'use client'

import { useState } from 'react'

export default function CopyShareButton({ projectId }: { projectId: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}/share/${projectId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
      style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.82 0.01 252)', background: 'oklch(0.20 0.022 252)' }}
    >
      {copied ? '✓ Copied!' : '🔗 Share SOW'}
    </button>
  )
}
