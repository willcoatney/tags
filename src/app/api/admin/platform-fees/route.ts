import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/admin/platform-fees
// Query params:
//   status — 'charged' | 'pending' | 'failed' | 'waived' (omit for all)
//
// Returns rows + summary aggregates for the Platform Fees admin page.
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status')

  // Build the bids query — only include bids that are relevant to fee tracking
  let query = admin
    .from('bids')
    .select(`
      id,
      amount,
      platform_fee_cents,
      platform_fee_status,
      platform_fee_charged_at,
      platform_fee_failed_at,
      contractor_user_id,
      project_id,
      projects ( title ),
      user_profiles!bids_contractor_user_id_fkey ( full_name, email )
    `)
    .neq('platform_fee_status', 'not_applicable')
    .order('created_at', { ascending: false })
    .limit(500)

  if (statusFilter) {
    query = query.eq('platform_fee_status', statusFilter)
  }

  const { data: bids, error } = await query

  if (error) {
    console.error('[platform-fees] GET failed:', error)
    return NextResponse.json({ error: 'Failed to fetch platform fees' }, { status: 500 })
  }

  // ── Summary aggregates ─────────────────────────────────────────────────
  // Always compute over all statuses regardless of filter
  const { data: allFees } = await admin
    .from('bids')
    .select('platform_fee_cents, platform_fee_status')
    .neq('platform_fee_status', 'not_applicable')

  const totalCollectedCents = (allFees ?? [])
    .filter(b => b.platform_fee_status === 'charged')
    .reduce((sum, b) => sum + (b.platform_fee_cents ?? 0), 0)

  const pendingCount = (allFees ?? []).filter(b => b.platform_fee_status === 'pending').length
  const failedCount  = (allFees ?? []).filter(b => b.platform_fee_status === 'failed').length

  // ── Shape rows ─────────────────────────────────────────────────────────
  type BidRow = {
    id: string
    amount: number
    platform_fee_cents: number | null
    platform_fee_status: string
    platform_fee_charged_at: string | null
    platform_fee_failed_at: string | null
    projects: { title: string } | null
    user_profiles: { full_name: string | null; email: string | null } | null
  }

  const rows = ((bids ?? []) as unknown as BidRow[]).map(b => ({
    bid_id: b.id,
    project_title: b.projects?.title ?? '—',
    contractor_name: b.user_profiles?.full_name ?? '',
    contractor_email: b.user_profiles?.email ?? '',
    bid_amount: b.amount,
    platform_fee_cents: b.platform_fee_cents,
    platform_fee_status: b.platform_fee_status,
    platform_fee_charged_at: b.platform_fee_charged_at,
    platform_fee_failed_at: b.platform_fee_failed_at,
  }))

  return NextResponse.json({
    rows,
    summary: { totalCollectedCents, pendingCount, failedCount },
  })
}
