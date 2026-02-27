'use client'

import { useEffect, useState } from 'react'

export default function Overlay() {
  const [visible, setVisible] = useState(true)

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent">
      <div className="w-[460px] rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700 p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-zinc-400 text-sm font-medium">Spktr is watching</span>
        </div>
        <p className="text-white text-lg font-semibold">Press Alt+Space to toggle</p>
        <p className="text-zinc-500 text-sm mt-1">Phase 1 — Overlay shell working ✓</p>
      </div>
    </main>
  )
}
