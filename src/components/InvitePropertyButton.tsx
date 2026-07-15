'use client'

import { useState } from 'react'

export default function InvitePropertyButton() {
  const [loading, setLoading] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/portfolio/invites', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate invite')
      setInviteUrl(data.inviteUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate invite')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {!inviteUrl ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
          style={{ background: 'oklch(0.57 0.135 183)' }}
        >
          {loading ? 'Generating…' : '+ Invite Property Manager'}
        </button>
      ) : (
        <div className="flex items-center gap-2 max-w-lg">
          <input
            readOnly
            value={inviteUrl}
            className="flex-1 h-9 px-3 rounded-lg text-xs"
            style={{
              background: 'oklch(0.20 0.022 252)',
              border: '1px solid oklch(0.27 0.025 252)',
              color: 'oklch(0.72 0.01 252)',
            }}
          />
          <button
            onClick={handleCopy}
            className="px-3 h-9 rounded-lg text-xs font-semibold text-white transition-all duration-150"
            style={{ background: copied ? 'oklch(0.45 0.10 145)' : 'oklch(0.57 0.135 183)' }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button
            onClick={() => { setInviteUrl(null); setCopied(false) }}
            className="px-3 h-9 rounded-lg text-xs font-medium transition-colors duration-150"
            style={{ color: 'oklch(0.55 0.02 252)', border: '1px solid oklch(0.22 0.022 252)' }}
          >
            New
          </button>
        </div>
      )}
      {error && <p className="text-xs mt-1" style={{ color: 'oklch(0.65 0.18 25)' }}>{error}</p>}
    </div>
  )
}
