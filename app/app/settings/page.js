'use client'

import { useState, useEffect } from 'react'

const BACKEND = 'http://localhost:3001'

const s = {
  page: {
    minHeight: '100vh',
    background: 'rgba(24, 24, 27, 0.97)',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
    padding: '32px',
  },
  title: { fontSize: '20px', fontWeight: 700, marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#71717a', marginBottom: '32px' },
  section: { marginBottom: '28px' },
  label: { fontSize: '12px', color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' },
  providerRow: { display: 'flex', gap: '10px', marginBottom: '16px' },
  providerBtn: (active) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
    background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
    color: active ? '#818cf8' : '#71717a',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  }),
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    padding: '10px 12px',
    marginBottom: '10px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputLabel: { fontSize: '12px', color: '#71717a', marginBottom: '4px' },
  testBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  saveBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  status: (ok) => ({
    marginTop: '14px',
    padding: '10px 14px',
    borderRadius: '8px',
    background: ok ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
    border: `1px solid ${ok ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
    color: ok ? '#4ade80' : '#f87171',
    fontSize: '13px',
  }),
  divider: { borderColor: 'rgba(255,255,255,0.06)', margin: '24px 0' },
}

export default function Settings() {
  const [config, setConfig] = useState(null)
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`${BACKEND}/config`)
      .then(r => r.json())
      .then(setConfig)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await fetch(`${BACKEND}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    setSaving(false)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const res = await fetch(`${BACKEND}/providers/test`)
    const data = await res.json()
    setTestResult(data)
    setTesting(false)
  }

  if (!config) return (
    <div style={s.page}>
      <p style={{ color: '#71717a' }}>Loading config...</p>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.title}>⚙️ Spktr Settings</div>
      <div style={s.subtitle}>Configure your AI provider. All data stays local.</div>

      {/* Provider selector */}
      <div style={s.section}>
        <div style={s.label}>AI Provider</div>
        <div style={s.providerRow}>
          {['ollama', 'lmstudio', 'groq'].map(p => (
            <button
              key={p}
              style={s.providerBtn(config.provider === p)}
              onClick={() => setConfig({ ...config, provider: p })}
            >
              {p === 'ollama' ? '🦙 Ollama' : p === 'lmstudio' ? '🖥️ LM Studio' : '⚡ Groq'}
            </button>
          ))}
        </div>
      </div>

      <hr style={s.divider} />

      {/* Ollama config */}
      {config.provider === 'ollama' && (
        <div style={s.section}>
          <div style={s.label}>Ollama Settings</div>
          <div style={s.inputLabel}>Server URL</div>
          <input
            style={s.input}
            value={config.ollama.baseURL}
            onChange={e => setConfig({ ...config, ollama: { ...config.ollama, baseURL: e.target.value } })}
          />
          <div style={s.inputLabel}>Model</div>
          <input
            style={s.input}
            value={config.ollama.model}
            placeholder="e.g. moondream, llava, llama3.2-vision"
            onChange={e => setConfig({ ...config, ollama: { ...config.ollama, model: e.target.value } })}
          />
        </div>
      )}

      {/* LM Studio config */}
      {config.provider === 'lmstudio' && (
        <div style={s.section}>
          <div style={s.label}>LM Studio Settings</div>
          <div style={s.inputLabel}>Server URL</div>
          <input
            style={s.input}
            value={config.lmstudio.baseURL}
            onChange={e => setConfig({ ...config, lmstudio: { ...config.lmstudio, baseURL: e.target.value } })}
          />
          <div style={s.inputLabel}>Model name (as loaded in LM Studio)</div>
          <input
            style={s.input}
            value={config.lmstudio.model}
            placeholder="e.g. llava-v1.5-7b"
            onChange={e => setConfig({ ...config, lmstudio: { ...config.lmstudio, model: e.target.value } })}
          />
        </div>
      )}

      {/* Groq config */}
      {config.provider === 'groq' && (
        <div style={s.section}>
          <div style={s.label}>Groq Settings</div>
          <div style={s.inputLabel}>API Key</div>
          <input
            style={s.input}
            type="password"
            value={config.groq.apiKey}
            placeholder="gsk_..."
            onChange={e => setConfig({ ...config, groq: { ...config.groq, apiKey: e.target.value } })}
          />
          <div style={s.inputLabel}>Model</div>
          <input
            style={s.input}
            value={config.groq.model}
            onChange={e => setConfig({ ...config, groq: { ...config.groq, model: e.target.value } })}
          />
        </div>
      )}

      <hr style={s.divider} />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button style={s.testBtn} onClick={handleTest} disabled={testing}>
          {testing ? 'Testing...' : '🔌 Test Connection'}
        </button>
        <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save'}
        </button>
      </div>

      {/* Test result */}
      {testResult && (
        <div style={s.status(testResult.ok)}>
          {testResult.ok
            ? `✅ Connected — ${testResult.model} — ${testResult.latency}ms latency`
            : `❌ Failed — ${testResult.error}`
          }
        </div>
      )}
    </div>
  )
}
