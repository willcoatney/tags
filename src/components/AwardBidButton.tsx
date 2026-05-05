'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props { bidId: string }

export default function AwardBidButton({ bidId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAward() {
    if (!confirm('Award this job? All other bids will be rejected and the contractor will be notified.')) return
    setLoading(true)
    const res = await fetch(`/api/bids/${bidId}/award`, { method: 'POST' })
    if (res.ok) {
      toast.success('Job awarded! Contractor notified via SMS and email.')
      router.refresh()
    } else {
      toast.error('Failed to award bid')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAward}
      disabled={loading}
      className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
      style={{ background: loading ? 'oklch(0.44 0.10 160)' : 'oklch(0.52 0.14 160)' }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Awarding…
        </span>
      ) : '✓ Award This Job'}
    </button>
  )
}
