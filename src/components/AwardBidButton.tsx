'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props { bidId: string }

export default function AwardBidButton({ bidId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAward() {
    if (!confirm('Award this job? All other bids will be rejected.')) return
    setLoading(true)
    const res = await fetch(`/api/bids/${bidId}/award`, { method: 'POST' })
    if (res.ok) {
      toast.success('Job awarded! Contractor has been notified.')
      router.refresh()
    } else {
      toast.error('Failed to award bid')
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleAward} disabled={loading} className="bg-green-600 hover:bg-green-700 w-full">
      {loading ? 'Awarding...' : '✓ Award This Job'}
    </Button>
  )
}
