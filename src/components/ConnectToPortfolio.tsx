'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'

function extractToken(input: string): string {
  // If it looks like a URL, extract the last path segment
  try {
    const url = new URL(input)
    const parts = url.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] ?? input
  } catch {
    return input.trim()
  }
}

export default function ConnectToPortfolio() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    const token = extractToken(value)
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/portfolio/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Connection failed')
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}
    >
      <p className="text-sm font-semibold text-white mb-1">Join a Portfolio</p>
      <p className="text-xs mb-3" style={{ color: 'oklch(0.55 0.02 252)' }}>
        Have an invite code from your Regional Manager?
      </p>

      {success ? (
        <p className="text-sm font-medium" style={{ color: 'oklch(0.72 0.12 145)' }}>
          ✓ Connected! Refresh to see your portfolio.
        </p>
      ) : (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Paste invite link or token…"
            className="h-9 text-sm flex-1"
            style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
          />
          <button
            onClick={handleConnect}
            disabled={loading || !value}
            className="px-4 h-9 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'oklch(0.57 0.135 183)' }}
          >
            {loading ? '…' : 'Connect'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs mt-2" style={{ color: 'oklch(0.65 0.18 25)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
