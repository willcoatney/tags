'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props { contractorId: string }

export default function AdminContractorActions({ contractorId }: Props) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  async function handle(action: 'approve' | 'reject') {
    setLoading(action)
    const res = await fetch(`/api/contractors/${contractorId}/${action}`, { method: 'POST' })
    if (res.ok) {
      toast.success(action === 'approve' ? 'Contractor approved' : 'Contractor rejected')
      router.refresh()
    } else {
      toast.error('Action failed')
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handle('approve')}
        disabled={!!loading}
        className="px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all duration-150 disabled:opacity-50"
        style={{ background: 'oklch(0.52 0.14 160)' }}
      >
        {loading === 'approve' ? '…' : 'Approve'}
      </button>
      <button
        onClick={() => handle('reject')}
        disabled={!!loading}
        className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 disabled:opacity-50"
        style={{ background: 'oklch(0.22 0.022 252)', color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
      >
        {loading === 'reject' ? '…' : 'Reject'}
      </button>
    </div>
  )
}
