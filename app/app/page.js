'use client'

import { useEffect, useState, useRef } from 'react'
import { getScreenshotableMonitors, getMonitorScreenshot } from 'tauri-plugin-screenshots-api'
import { invoke } from '@tauri-apps/api/core'

const BACKEND_URL = 'http://localhost:3001'
const POLL_INTERVAL = 7000

export default function Overlay() {
  const [status, setStatus] = useState('initializing...')
  const [lastCapture, setLastCapture] = useState(null)
  const [interactive, setInteractive] = useState(false)
  const wsRef = useRef(null)
  const monitorsRef = useRef([])

  const captureAndSend = async (via = 'poll') => {
    try {
      if (monitorsRef.current.length === 0) {
        monitorsRef.current = await getScreenshotableMonitors()
      }
      const monitor = monitorsRef.current[0]
      const screenshotPath = await getMonitorScreenshot(monitor.id)
      const base64 = await invoke('read_screenshot_as_base64', { path: screenshotPath })

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'screenshot', base64 }))
      }

      const now = new Date().toLocaleTimeString()
      setLastCapture(now)
      setStatus(`watching — last capture: ${now} (${via})`)
    } catch (err) {
      console.error('[capture] Error:', err)
      setStatus(`error: ${err}`)
    }
  }

  const toggleInteractive = async () => {
    const next = !interactive
    setInteractive(next)
    await invoke('set_clickable', { clickable: next })
  }

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001')
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected — watching your screen')
      captureAndSend('init')
    }
    ws.onerror = () => setStatus('backend not running')
    ws.onclose = () => setStatus('disconnected from backend')

    const interval = setInterval(() => captureAndSend('poll'), POLL_INTERVAL)
    return () => {
      clearInterval(interval)
      ws.close()
    }
  }, [])

  return (
    <main style={{ background: 'transparent' }} className="flex min-h-screen items-end justify-end p-6">
      <div
        style={{
          background: 'rgba(24, 24, 27, 0.92)',
          border: '1px solid rgba(63, 63, 70, 0.8)',
          borderRadius: '16px',
          padding: '20px 24px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          width: '460px',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#4ade80',
              boxShadow: '0 0 6px #4ade80'
            }} />
            <span style={{ color: '#a1a1aa', fontSize: '13px', fontWeight: 500 }}>
              {status}
            </span>
          </div>

          {/* 🔑 Interactive toggle button */}
          <button
            onClick={toggleInteractive}
            style={{
              background: interactive ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${interactive ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              color: interactive ? '#4ade80' : '#71717a',
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 10px',
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            {interactive ? '🔓 INTERACTIVE' : '🔒 PASSTHROUGH'}
          </button>
        </div>

        <p style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600, margin: 0 }}>
          Spktr is watching
        </p>
        <p style={{ color: '#52525b', fontSize: '13px', margin: '4px 0 0 0' }}>
          Phase 2 — Screen capture pipeline {lastCapture ? '✓' : '...'}
        </p>
      </div>
    </main>
  )
}
