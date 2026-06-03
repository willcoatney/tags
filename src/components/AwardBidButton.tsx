'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props { bidId: string }

export default function AwardBidButton({ bidId }: Props) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAward() {
    setLoading(true)
    const res = await fetch(`/api/bids/${bidId}/award`, { method: 'POST' })
    if (res.ok) {
      toast.success('Job awarded! Contractor notified via SMS and email.')
      router.refresh()
    } else {
      toast.error('Failed to award bid')
      setLoading(false)
      setConfirm(false)
    }
  }

  if (loading) {
    return (
      <button disabled className="w-full h-10 rounded-lg text-sm font-semibold text-white opacity-60 flex items-center justify-center gap-2"
        style={{ background: 'oklch(0.44 0.10 160)' }}>
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Awarding…
      </button>
    )
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="w-full h-10 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
        style={{ color: 'oklch(0.75 0.14 60)', border: '1px solid oklch(0.45 0.14 60)', background: 'transparent' }}
      >
        Award This Job
      </button>
    )
  }

  return (
    <div className="rounded-lg p-3 space-y-2" style={{ background: 'oklch(0.20 0.04 60)', border: '1px solid oklch(0.45 0.14 60)' }}>
      <p className="text-xs text-center font-medium" style={{ color: 'oklch(0.80 0.14 60)' }}>
        Confirm — this cannot be undone
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setConfirm(false)}
          className="h-9 rounded-lg text-xs font-medium transition-colors duration-150"
          style={{ color: 'oklch(0.60 0.02 252)', border: '1px solid oklch(0.27 0.025 252)', background: 'transparent' }}
        >
          Cancel
        </button>
        <button
          onClick={handleAward}
          className="h-9 rounded-lg text-xs font-semibold text-white transition-all duration-150 active:scale-[0.98]"
          style={{ background: 'oklch(0.52 0.14 160)' }}
        >
          ✓ Yes, Award
        </button>
      </div>
    </div>
  )
}
