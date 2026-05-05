'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
      <Button size="sm" onClick={() => handle('approve')} disabled={!!loading}
        className="bg-green-600 hover:bg-green-700">
        {loading === 'approve' ? '...' : 'Approve'}
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handle('reject')} disabled={!!loading}>
        {loading === 'reject' ? '...' : 'Reject'}
      </Button>
    </div>
  )
}
