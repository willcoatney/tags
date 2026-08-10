import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { getBaseUrl } from '@/lib/url'
import { sendEmail } from '@/lib/email'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Verify PM owns the project
  const { data: project } = await admin.from('projects')
    .select('*, properties(*)')
    .eq('id', params.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'pm' || profile.organization_id !== project.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // C-04: Check publish error before sending any notifications
  const { error: publishErr } = await admin.from('projects')
    .update({ status: 'open', updated_at: new Date().toISOString() })
    .eq('id', params.id)

  if (publishErr) {
    void logError(ErrorCategory.DB, 'Failed to publish project', { publishErr: publishErr.message, projectId: params.id }, {
      route: '/api/projects/[id]/publish', user_id: user.id, severity: ErrorSeverity.CRITICAL,
    })
    return NextResponse.json({ error: 'Failed to publish project: ' + publishErr.message }, { status: 500 })
  }

  // Find matching contractors: approved + matching service type
  const { data: allContractors } = await admin.from('contractor_profiles')
    .select('*, user_profiles!contractor_profiles_user_id_fkey(*)')
    .eq('approval_status', 'approved')
    .contains('services', [project.project_type])

  const contractors = (allContractors || []).filter(c => {
    const states: string[] = c.service_states || []
    return states.length === 0 || states.includes(project.properties?.state)
  })

  const baseUrl = getBaseUrl()
  const projectUrl = `${baseUrl}/dashboard/contractor/projects/${params.id}`

  // M-08: Null-safe property access
  const city = project.properties?.city ?? 'your area'
  const state = project.properties?.state ?? ''
  const msg = `New ${project.project_type} project posted in ${city}${state ? ', ' + state : ''}. View & bid: ${projectUrl}`

  for (const contractor of (contractors || [])) {
    const up = Array.isArray(contractor.user_profiles)
      ? contractor.user_profiles[0]
      : contractor.user_profiles
    if (!up) continue
    if (up.phone) {
      try { await sendSMS(up.phone, msg) } catch (e) {
        console.error('[publish] SMS error for', up.phone, e)
        void logError(ErrorCategory.SMS, 'Contractor notification SMS failed on publish', {
          contractorPhone: up.phone, err: e instanceof Error ? e.message : String(e),
        }, { route: '/api/projects/[id]/publish', user_id: user.id, severity: ErrorSeverity.LOW })
      }
    }
    if (up.email) {
      try { await sendEmail(up.email, `New project: ${project.title}`, `<p>${msg}</p>`) } catch (e) {
        console.error('[publish] Email error for', up.email, e)
      }
    }
  }

  return NextResponse.json({ success: true })
}
