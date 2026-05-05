'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props { projectId: string }

export default function PublishProjectButton({ projectId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePublish() {
    setLoading(true)
    const res = await fetch(`/api/projects/${projectId}/publish`, { method: 'POST' })
    if (res.ok) {
      toast.success('Project posted! Matching contractors are being notified.')
      router.refresh()
    } else {
      toast.error('Failed to post project')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePublish}
      disabled={loading}
      className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
      style={{ background: loading ? 'oklch(0.45 0.10 183)' : 'oklch(0.57 0.135 183)' }}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Posting…
        </span>
      ) : 'Post for Bids'}
    </button>
  )
}
