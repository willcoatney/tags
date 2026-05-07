'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  projectId: string
}

export default function CompleteProjectButton({ projectId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [contractor, setContractor] = useState<{ id: string; name: string } | null>(null)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleComplete() {
    setLoading(true)
    const res = await fetch(`/api/projects/${projectId}/complete`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setContractor({ id: data.contractorUserId, name: data.contractorName || 'the contractor' })
      setShowRating(true)
    } else {
      toast.error(data.error || 'Failed to mark complete')
    }
    setLoading(false)
  }

  async function handleRatingSubmit() {
    if (!rating || !contractor) return
    setSubmitting(true)
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        contractorUserId: contractor.id,
        rating,
        comment,
      }),
    })
    if (res.ok) {
      toast.success('Rating submitted — thanks!')
      router.refresh()
    } else {
      toast.error('Failed to submit rating')
    }
    setSubmitting(false)
    setShowRating(false)
  }

  if (showRating && contractor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'oklch(0 0 0 / 0.7)' }}>
        <div className="w-full max-w-sm rounded-2xl p-6 space-y-5 animate-fade-in"
          style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Rate {contractor.name}</h3>
            <p className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>
              Project marked complete. How did they do?
            </p>
          </div>

          {/* Stars */}
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-4xl transition-transform hover:scale-110">
                <span style={{ color: star <= (hovered || rating) ? 'oklch(0.80 0.18 75)' : 'oklch(0.30 0.02 252)' }}>★</span>
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm font-medium" style={{ color: 'oklch(0.80 0.18 75)' }}>
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
            </p>
          )}

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Leave a comment (optional)…"
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
            style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
          />

          <div className="flex gap-3">
            <button onClick={() => { setShowRating(false); router.refresh() }}
              className="flex-1 h-10 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.65 0.02 252)' }}>
              Skip
            </button>
            <button onClick={handleRatingSubmit} disabled={!rating || submitting}
              className="flex-1 h-10 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-all"
              style={{ background: 'oklch(0.57 0.135 183)' }}>
              {submitting ? 'Submitting…' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
      style={{ background: 'oklch(0.55 0.14 160)' }}
    >
      {loading ? 'Marking…' : '✓ Mark Complete'}
    </button>
  )
}
