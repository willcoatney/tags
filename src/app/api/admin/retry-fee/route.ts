import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { chargePlatformFee } from '@/lib/platform-fee'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

// POST /api/admin/retry-fee
// Body: { bidId: string }
// Retries a failed or pending platform fee charge.
// Admin auth required.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let bidId: string
  try {
    const body = await req.json() as { bidId?: unknown }
    if (!body.bidId || typeof body.bidId !== 'string') {
      return NextResponse.json({ error: 'bidId is required' }, { status: 400 })
    }
    bidId = body.bidId
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Look up bid with project info
  const { data: bid } = await admin
    .from('bids')
    .select('id, amount, project_id, contractor_user_id, platform_fee_status, projects(title)')
    .eq('id', bidId)
    .single()

  if (!bid) {
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 })
  }

  if (bid.platform_fee_status !== 'failed' && bid.platform_fee_status !== 'pending') {
    return NextResponse.json(
      { error: `Cannot retry a fee with status '${bid.platform_fee_status}'` },
      { status: 400 }
    )
  }

  const projectsRaw = bid.projects as unknown
  const projectInfo = (Array.isArray(projectsRaw) ? projectsRaw[0] : projectsRaw) as { title: string } | null
  if (!projectInfo?.title) {
    void logError(ErrorCategory.DB, 'Retry fee — project not found for bid', { bidId }, {
      route: '/api/admin/retry-fee', user_id: user.id, severity: ErrorSeverity.HIGH,
    })
    return NextResponse.json({ error: 'Project not found for bid' }, { status: 500 })
  }

  const result = await chargePlatformFee(
    {
      id: bid.id,
      amount: bid.amount,
      project_id: bid.project_id,
      contractor_user_id: bid.contractor_user_id,
    },
    { title: projectInfo.title },
    { route: '/api/admin/retry-fee', user_id: user.id }
  )

  return NextResponse.json({ success: true, result })
}
