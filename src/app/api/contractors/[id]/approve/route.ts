import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { getBaseUrl } from '@/lib/url'
import { sendEmail, contractorApprovedEmail } from '@/lib/email'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: adminProfile } = await admin.from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // C-06: Check approval update error
  const { error: approveErr } = await admin.from('contractor_profiles').update({
    approval_status: 'approved',
    approved_by: user.id,
    approved_at: new Date().toISOString(),
  }).eq('id', params.id)

  if (approveErr) {
    void logError(ErrorCategory.DB, 'Failed to approve contractor', { approveErr: approveErr.message, contractorId: params.id }, {
      route: '/api/contractors/[id]/approve', user_id: user.id, severity: ErrorSeverity.CRITICAL,
    })
    return NextResponse.json({ error: 'Failed to approve contractor: ' + approveErr.message }, { status: 500 })
  }

  const { data: contractor } = await admin.from('contractor_profiles')
    .select('user_profiles(phone, email)')
    .eq('id', params.id)
    .single()

  const baseUrl = getBaseUrl()
  const dashUrl = `${baseUrl}/dashboard/contractor`
  const up = (contractor?.user_profiles as { phone?: string; email?: string } | null)

  // C-06: Wrap SMS in try/catch — approval already succeeded
  if (up?.phone) {
    try {
      await sendSMS(up.phone, `Your TAGS account is approved! Start bidding: ${dashUrl}`)
    } catch (e) {
      console.error('[approve] SMS failed:', e)
      void logError(ErrorCategory.SMS, 'Contractor approval SMS failed', {
        err: e instanceof Error ? e.message : String(e), contractorId: params.id,
      }, { route: '/api/contractors/[id]/approve', user_id: user.id, severity: ErrorSeverity.MEDIUM })
    }
  }
  if (up?.email) {
    const { subject, html } = contractorApprovedEmail(dashUrl)
    await sendEmail(up.email, subject, html)
  }

  return NextResponse.json({ success: true })
}
