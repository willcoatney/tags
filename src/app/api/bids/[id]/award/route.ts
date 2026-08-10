import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { getBaseUrl } from '@/lib/url'
import { sendEmail, awardedWinnerEmail } from '@/lib/email'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'
import { chargePlatformFee } from '@/lib/platform-fee'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: winningBid } = await admin.from('bids')
    .select('*, projects(*, properties(*))')
    .eq('id', params.id)
    .single()

  if (!winningBid) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: pmProfile } = await admin.from('user_profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!pmProfile || pmProfile.role !== 'pm' ||
      pmProfile.organization_id !== winningBid.projects.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // C-02: Award winning bid — check error
  const { error: awardErr } = await admin.from('bids')
    .update({ status: 'awarded', updated_at: new Date().toISOString() })
    .eq('id', params.id)
  if (awardErr) {
    void logError(ErrorCategory.DB, 'Failed to award bid', { awardErr: awardErr.message, bidId: params.id }, {
      route: '/api/bids/[id]/award', user_id: user.id, severity: ErrorSeverity.CRITICAL,
    })
    return NextResponse.json({ error: 'Failed to award bid: ' + awardErr.message }, { status: 500 })
  }

  // Reject all other bids
  const { data: losingBids } = await admin.from('bids')
    .select('id, contractor_user_id')
    .eq('project_id', winningBid.project_id)
    .neq('id', params.id)

  if (losingBids?.length) {
    const { error: rejectErr } = await admin.from('bids')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .in('id', losingBids.map(b => b.id))
    if (rejectErr) {
      // Non-fatal — log but don't block
      console.error('[award] Failed to reject losing bids:', rejectErr)
      void logError(ErrorCategory.DB, 'Failed to reject losing bids', { rejectErr: rejectErr.message, bidId: params.id }, {
        route: '/api/bids/[id]/award', user_id: user.id, severity: ErrorSeverity.HIGH,
      })
    }
  }

  // C-02: Update project status — check error
  const { error: projectErr } = await admin.from('projects')
    .update({ status: 'awarded', updated_at: new Date().toISOString() })
    .eq('id', winningBid.project_id)
  if (projectErr) {
    void logError(ErrorCategory.DB, 'Failed to update project status to awarded', { projectErr: projectErr.message, projectId: winningBid.project_id }, {
      route: '/api/bids/[id]/award', user_id: user.id, severity: ErrorSeverity.CRITICAL,
    })
    return NextResponse.json({ error: 'Failed to update project status: ' + projectErr.message }, { status: 500 })
  }

  // ── Charge contractor 1.5% platform fee (soft gate — award already complete) ──
  let feeResult: Awaited<ReturnType<typeof chargePlatformFee>> | null = null
  try {
    feeResult = await chargePlatformFee(
      {
        id: params.id,
        amount: winningBid.amount,
        project_id: winningBid.project_id,
        contractor_user_id: winningBid.contractor_user_id,
      },
      { title: winningBid.projects.title },
      { route: '/api/bids/[id]/award', user_id: user.id }
    )
  } catch (err) {
    // chargePlatformFee handles its own error logging — this is belt-and-suspenders
    console.error('[award] Platform fee helper threw unexpectedly for bid', params.id, err)
    void logError(ErrorCategory.STRIPE, 'Platform fee helper threw unexpectedly', {
      bidId: params.id, err: err instanceof Error ? err.message : String(err),
    }, { route: '/api/bids/[id]/award', user_id: user.id, severity: ErrorSeverity.HIGH })
  }
  // ────────────────────────────────────────────────────────────────────────

  const baseUrl = getBaseUrl()
  const projectUrl = `${baseUrl}/dashboard/contractor/projects/${winningBid.project_id}`
  const { title, properties } = winningBid.projects

  // Notify winning contractor
  const { data: winner } = await admin.from('user_profiles')
    .select('phone, email, full_name')
    .eq('id', winningBid.contractor_user_id)
    .single()

  // Build fee suffix for winner SMS if charge succeeded
  let feeSuffix = ''
  if (feeResult?.status === 'charged') {
    const feeDisplay = `$${(feeResult.feeCents / 100).toFixed(2)}`
    feeSuffix = ` A ${feeDisplay} platform fee was charged to your card ending ${feeResult.cardLast4}.`
  }

  // C-03: Wrap SMS in try/catch — DB writes already complete, don't let SMS crash response
  if (winner?.phone) {
    try {
      await sendSMS(winner.phone, `You've been awarded "${title}" in ${properties.city}. Login for details: ${projectUrl}${feeSuffix}`)
    } catch (e) {
      console.error('[award] Winner SMS failed:', e)
      void logError(ErrorCategory.SMS, 'Winner SMS failed after bid award', {
        bidId: params.id, err: e instanceof Error ? e.message : String(e),
      }, { route: '/api/bids/[id]/award', user_id: user.id, severity: ErrorSeverity.MEDIUM })
    }
  }
  if (winner?.email) {
    const { subject, html } = awardedWinnerEmail(title, properties.city, projectUrl)
    await sendEmail(winner.email, subject, html)
  }

  // C-03: Notify losing contractors — individual try/catch so loop continues on failure
  for (const loser of (losingBids || [])) {
    const { data: loserProfile } = await admin.from('user_profiles')
      .select('phone, email')
      .eq('id', loser.contractor_user_id)
      .single()
    if (loserProfile?.phone) {
      try {
        await sendSMS(loserProfile.phone, `"${title}" has been awarded to another contractor. Watch for new projects on TAGS.`)
      } catch (e) {
        console.error('[award] Loser SMS failed:', e)
        void logError(ErrorCategory.SMS, 'Loser notification SMS failed', {
          loserUserId: loser.contractor_user_id, err: e instanceof Error ? e.message : String(e),
        }, { route: '/api/bids/[id]/award', user_id: user.id, severity: ErrorSeverity.LOW })
      }
    }
  }

  return NextResponse.json({ success: true, feeStatus: feeResult?.status ?? 'skipped' })
}
