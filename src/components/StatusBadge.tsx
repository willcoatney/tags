import type { ProjectStatus, BidStatus, ApprovalStatus } from '@/lib/types'

const STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  draft:     { bg: 'oklch(0.25 0.015 252)', text: 'oklch(0.65 0.02 252)', dot: 'oklch(0.50 0.02 252)' },
  open:      { bg: 'oklch(0.20 0.05 230)', text: 'oklch(0.72 0.10 230)', dot: 'oklch(0.62 0.14 230)' },
  awarded:   { bg: 'oklch(0.18 0.06 160)', text: 'oklch(0.70 0.13 160)', dot: 'oklch(0.60 0.16 160)' },
  completed: { bg: 'oklch(0.22 0.025 252)', text: 'oklch(0.65 0.02 252)', dot: 'oklch(0.50 0.025 252)' },
  cancelled: { bg: 'oklch(0.20 0.05 15)',  text: 'oklch(0.72 0.10 15)',  dot: 'oklch(0.62 0.15 15)' },
  submitted: { bg: 'oklch(0.20 0.05 230)', text: 'oklch(0.72 0.10 230)', dot: 'oklch(0.62 0.14 230)' },
  rejected:  { bg: 'oklch(0.20 0.05 15)',  text: 'oklch(0.72 0.10 15)',  dot: 'oklch(0.62 0.15 15)' },
  pending:   { bg: 'oklch(0.22 0.06 75)',  text: 'oklch(0.75 0.12 75)',  dot: 'oklch(0.65 0.15 75)' },
  approved:  { bg: 'oklch(0.18 0.06 160)', text: 'oklch(0.70 0.13 160)', dot: 'oklch(0.60 0.16 160)' },
}

interface Props { status: ProjectStatus | BidStatus | ApprovalStatus }

export default function StatusBadge({ status }: Props) {
  const s = STYLES[status] || STYLES.draft
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {status}
    </span>
  )
}
