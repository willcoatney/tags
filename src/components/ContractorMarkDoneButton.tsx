'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  projectId: string
  status: string
}

export default function ContractorMarkDoneButton({ projectId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (status === 'work_complete') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
        style={{ background: 'oklch(0.22 0.06 145)', color: 'oklch(0.75 0.15 145)', border: '1px solid oklch(0.35 0.10 145)' }}>
        <span>✓</span>
        <span>Work marked done — awaiting PM confirmation</span>
      </div>
    )
  }

  if (status !== 'awarded') return null

  async function handleMarkDone() {
    setLoading(true)
    const res = await fetch(`/api/projects/${projectId}/contractor-complete`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      toast.success('Work marked as done. PM has been notified.')
      router.refresh()
    } else {
      toast.error(data.error || 'Failed to mark work done')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleMarkDone}
      disabled={loading}
      className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
      style={{ background: 'oklch(0.55 0.14 160)' }}
    >
      {loading ? 'Submitting…' : '✓ Mark Work Done'}
    </button>
  )
}
