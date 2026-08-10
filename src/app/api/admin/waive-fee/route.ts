import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

// POST /api/admin/waive-fee
// Body: { bidId: string }
// Sets platform_fee_status = 'waived' for a failed or pending fee.
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

  // Verify the bid exists and has a waive-eligible status
  const { data: bid } = await admin
    .from('bids')
    .select('id, platform_fee_status')
    .eq('id', bidId)
    .single()

  if (!bid) {
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 })
  }

  if (bid.platform_fee_status !== 'failed' && bid.platform_fee_status !== 'pending') {
    return NextResponse.json(
      { error: `Cannot waive a fee with status '${bid.platform_fee_status}'` },
      { status: 400 }
    )
  }

  const { error: updateErr } = await admin
    .from('bids')
    .update({ platform_fee_status: 'waived', updated_at: new Date().toISOString() })
    .eq('id', bidId)

  if (updateErr) {
    void logError(ErrorCategory.DB, 'Failed to waive platform fee', { updateErr: updateErr.message, bidId }, {
      route: '/api/admin/waive-fee', user_id: user.id, severity: ErrorSeverity.HIGH,
    })
    return NextResponse.json({ error: 'Failed to waive fee: ' + updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, bidId, status: 'waived' })
}
