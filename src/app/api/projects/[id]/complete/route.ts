import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

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

  await admin.from('projects').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', params.id)

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
    if (contractor?.phone) {
      await sendSMS(contractor.phone, `Great news! The property manager has confirmed "${project.title || 'your project'}" as complete. Thanks for your work on TAGS.`)
    }
  }

  return NextResponse.json({
    success: true,
    contractorUserId: awardedBid?.contractor_user_id,
    contractorName: (awardedBid?.contractor_profiles as { company_name?: string })?.company_name,
  })
}
