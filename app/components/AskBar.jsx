// app/components/AskBar.jsx
'use client'

import { useState, useRef, useEffect } from 'react'

const BACKEND_URL = 'http://localhost:3001'

export default function AskBar({ visible }) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    function handleFocus() {
      if (visible) {
        inputRef.current?.focus()
      }
    }
    window.addEventListener('spktr-focus-askbar', handleFocus)
    return () => window.removeEventListener('spktr-focus-askbar', handleFocus)
  }, [visible])

  if (!visible) return null

  async function handleAsk() {
    const trimmed = query.trim()
    if (!trimmed || loading) return

    setMessages(prev => [...prev, { role: 'user', text: trimmed }])
    setQuery('')
    setLoading(true)

    try {
      const res = await fetch(`${BACKEND_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, includeScreenshot: true }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || `Error: ${data.error}`,
        },
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Network error: ${err.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '14px', gap: '8px' }}>
      <div style={{ height: '1px', background: 'rgba(63,63,70,0.6)' }} />

      {messages.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto',
            maxHeight: '240px',
            paddingRight: '2px',
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#2563eb' : '#1e1e2e',
                color: '#f4f4f5',
                borderRadius:
                  msg.role === 'user'
                    ? '12px 12px 2px 12px'
                    : '12px 12px 12px 2px',
                padding: '8px 12px',
                maxWidth: '92%',
                fontSize: '12px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div
              style={{
                alignSelf: 'flex-start',
                background: '#1e1e2e',
                color: '#52525b',
                borderRadius: '12px 12px 12px 2px',
                padding: '8px 12px',
                fontSize: '12px',
              }}
            >
              Thinking…
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Spktr about your screen…"
          disabled={loading}
          autoFocus
          style={{
            flex: 1,
            background: '#18181b',
            border: '1px solid rgba(63,63,70,0.8)',
            borderRadius: '8px',
            color: '#f4f4f5',
            fontSize: '12px',
            padding: '8px 10px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleAsk}
          disabled={loading || !query.trim()}
          style={{
            background: loading || !query.trim() ? '#27272a' : '#2563eb',
            border: 'none',
            borderRadius: '8px',
            color: loading || !query.trim() ? '#52525b' : '#fff',
            fontSize: '12px',
            fontWeight: 600,
            padding: '8px 14px',
            cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? '…' : 'Ask'}
        </button>
      </div>
    </div>
  )
}
