'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  projectId: string
  contractorUserId: string
  contractorName: string
}

export default function LeaveReviewButton({ projectId, contractorUserId, contractorName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!rating) return
    setSubmitting(true)
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, contractorUserId, rating, comment }),
    })
    if (res.ok) {
      toast.success('Rating submitted — thanks!')
      setOpen(false)
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to submit rating')
    }
    setSubmitting(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
        style={{ background: 'oklch(0.57 0.135 183)' }}
      >
        ⭐ Leave a Review
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'oklch(0 0 0 / 0.7)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-5 animate-fade-in"
            style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.27 0.025 252)' }}
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Rate {contractorName}</h3>
              <p className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>
                How did they do on this project?
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-4xl transition-transform hover:scale-110"
                >
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
              <button
                onClick={() => setOpen(false)}
                className="flex-1 h-10 rounded-lg text-sm font-medium transition-colors"
                style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.65 0.02 252)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!rating || submitting}
                className="flex-1 h-10 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-all"
                style={{ background: 'oklch(0.57 0.135 183)' }}
              >
                {submitting ? 'Submitting…' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
