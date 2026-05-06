'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function ViewAsButton({ userId, name, role }: { userId: string; name: string; role: string }) {
  const [loading, setLoading] = useState(false)

  async function handleViewAs() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/view-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        toast.error(data.error || 'Failed to generate session')
        return
      }
      // Open in new tab — admin keeps their own session
      window.open(data.url, '_blank')
      toast.success(`Opening ${name}'s session in a new tab`)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (role === 'admin') return null

  return (
    <button
      onClick={handleViewAs}
      disabled={loading}
      className="px-2 py-1 rounded text-xs font-medium transition-colors duration-150"
      style={{
        color: 'oklch(0.57 0.135 183)',
        border: '1px solid oklch(0.30 0.08 183)',
        background: 'oklch(0.18 0.06 183)',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '…' : 'View As'}
    </button>
  )
}
