import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
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

  // H-06: Check rejection update error
  const { error: rejectErr } = await admin.from('contractor_profiles').update({
    approval_status: 'rejected',
  }).eq('id', params.id)

  if (rejectErr) {
    void logError(ErrorCategory.DB, 'Failed to reject contractor', { rejectErr: rejectErr.message, contractorId: params.id }, {
      route: '/api/contractors/[id]/reject', user_id: user.id, severity: ErrorSeverity.HIGH,
    })
    return NextResponse.json({ error: 'Failed to reject contractor: ' + rejectErr.message }, { status: 500 })
  }

  const { data: contractor } = await admin.from('contractor_profiles')
    .select('user_profiles(phone)')
    .eq('id', params.id)
    .single()

  const up = (contractor?.user_profiles as { phone?: string } | null)

  // H-06: Wrap SMS in try/catch — rejection already succeeded
  if (up?.phone) {
    try {
      await sendSMS(up.phone, 'Your TAGS application was not approved at this time.')
    } catch (e) {
      console.error('[reject] SMS failed:', e)
      void logError(ErrorCategory.SMS, 'Contractor rejection SMS failed', {
        err: e instanceof Error ? e.message : String(e), contractorId: params.id,
      }, { route: '/api/contractors/[id]/reject', user_id: user.id, severity: ErrorSeverity.MEDIUM })
    }
  }

  return NextResponse.json({ success: true })
}
