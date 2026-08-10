import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { getBaseUrl } from '@/lib/url'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role, full_name').eq('id', user.id).single()
  if (!profile || profile.role !== 'contractor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: bid } = await admin.from('bids')
    .select('id')
    .eq('project_id', params.id)
    .eq('contractor_user_id', user.id)
    .eq('status', 'awarded')
    .maybeSingle()

  if (!bid) return NextResponse.json({ error: 'No awarded bid found' }, { status: 403 })

  const { data: project } = await admin.from('projects')
    .select('id, title, status, created_by, organization_id')
    .eq('id', params.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (project.status !== 'awarded') return NextResponse.json({ error: 'Project is not in awarded status' }, { status: 400 })

  // C-08: Check status update error
  const { error: workCompleteErr } = await admin.from('projects')
    .update({ status: 'work_complete', updated_at: new Date().toISOString() })
    .eq('id', params.id)

  if (workCompleteErr) {
    void logError(ErrorCategory.DB, 'Failed to mark project work_complete', { workCompleteErr: workCompleteErr.message, projectId: params.id }, {
      route: '/api/projects/[id]/contractor-complete', user_id: user.id, severity: ErrorSeverity.CRITICAL,
    })
    return NextResponse.json({ error: 'Failed to mark work complete: ' + workCompleteErr.message }, { status: 500 })
  }

  const { data: pmUsers } = await admin.from('user_profiles')
    .select('phone')
    .eq('organization_id', project.organization_id)
    .eq('role', 'pm')

  const baseUrl = getBaseUrl()
  const projectUrl = `${baseUrl}/dashboard/pm/projects/${params.id}`
  const contractorName = profile.full_name || 'Your contractor'

  // C-08: Individual try/catch per PM so loop continues on failure
  for (const pm of (pmUsers || [])) {
    if (pm.phone) {
      try {
        await sendSMS(pm.phone, `${contractorName} has marked work complete on "${project.title}". Please log in to confirm: ${projectUrl}`)
      } catch (e) {
        console.error('[contractor-complete] PM SMS failed:', e)
        void logError(ErrorCategory.SMS, 'PM work-complete notification SMS failed', {
          err: e instanceof Error ? e.message : String(e), projectId: params.id,
        }, { route: '/api/projects/[id]/contractor-complete', user_id: user.id, severity: ErrorSeverity.MEDIUM })
      }
    }
  }

  return NextResponse.json({ success: true })
}
