import { Badge } from '@/components/ui/badge'
import type { ProjectStatus, BidStatus, ApprovalStatus } from '@/lib/types'

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-600 text-slate-200',
  open: 'bg-blue-600 text-white',
  awarded: 'bg-green-600 text-white',
  completed: 'bg-slate-500 text-white',
  cancelled: 'bg-red-600 text-white',
  submitted: 'bg-blue-600 text-white',
  rejected: 'bg-red-600 text-white',
  pending: 'bg-yellow-600 text-white',
  approved: 'bg-green-600 text-white',
}

interface Props { status: ProjectStatus | BidStatus | ApprovalStatus }

export default function StatusBadge({ status }: Props) {
  return (
    <Badge className={`${STATUS_STYLES[status] || 'bg-slate-600'} capitalize`}>
      {status}
    </Badge>
  )
}
