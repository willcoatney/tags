import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: project } = await admin.from('projects')
    .select('id, title, status, organization_id')
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!['awarded', 'work_complete'].includes(project.status)) return NextResponse.json({ error: 'Project must be awarded before completion' }, { status: 400 })

  // C-07: Check status update error
  const { error: completeErr } = await admin.from('projects')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', params.id)

  if (completeErr) {
    void logError(ErrorCategory.DB, 'Failed to mark project completed', { completeErr: completeErr.message, projectId: params.id }, {
      route: '/api/projects/[id]/complete', user_id: user.id, severity: ErrorSeverity.CRITICAL,
    })
    return NextResponse.json({ error: 'Failed to complete project: ' + completeErr.message }, { status: 500 })
  }

  // Get awarded contractor for rating prompt
  const { data: awardedBid } = await admin.from('bids')
    .select('contractor_user_id, contractor_profiles!contractor_profiles_user_id_fkey(company_name)')
    .eq('project_id', params.id)
    .eq('status', 'awarded')
    .single()

  // Notify winning contractor that PM confirmed completion
  if (awardedBid) {
    const { data: contractor } = await admin.from('user_profiles')
      .select('phone')
      .eq('id', awardedBid.contractor_user_id)
      .maybeSingle()
    // C-07: Wrap SMS in try/catch — completion already succeeded
    if (contractor?.phone) {
      try {
        await sendSMS(contractor.phone, `Great news! The property manager has confirmed "${project.title || 'your project'}" as complete. Thanks for your work on TAGS.`)
      } catch (e) {
        console.error('[complete] Contractor SMS failed:', e)
        void logError(ErrorCategory.SMS, 'Completion notification SMS to contractor failed', {
          err: e instanceof Error ? e.message : String(e), projectId: params.id,
        }, { route: '/api/projects/[id]/complete', user_id: user.id, severity: ErrorSeverity.MEDIUM })
      }
    }
  }

  return NextResponse.json({
    success: true,
    contractorUserId: awardedBid?.contractor_user_id,
    contractorName: (awardedBid?.contractor_profiles as { company_name?: string })?.company_name,
  })
}
