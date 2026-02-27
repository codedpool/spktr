'use client'

export default function Overlay() {
  return (
    <main
      style={{ background: 'transparent' }}
      className="flex min-h-screen items-end justify-end p-6"
    >
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#4ade80',
            }}
          />
          <span style={{ color: '#a1a1aa', fontSize: '13px', fontWeight: 500 }}>
            Spktr is watching
          </span>
        </div>
        <p style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600, margin: 0 }}>
          Press Ctrl+Shift+Space to toggle
        </p>
        <p style={{ color: '#52525b', fontSize: '13px', marginTop: '4px', margin: '4px 0 0 0' }}>
          Phase 1 — Overlay shell working ✓
        </p>
      </div>
    </main>
  )
}
