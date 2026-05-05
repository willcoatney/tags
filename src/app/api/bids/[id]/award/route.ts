import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { sendEmail, awardedWinnerEmail } from '@/lib/email'

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

  // Award winning bid
  await admin.from('bids').update({ status: 'awarded', updated_at: new Date().toISOString() }).eq('id', params.id)

  // Reject all other bids
  const { data: losingBids } = await admin.from('bids')
    .select('id, contractor_user_id')
    .eq('project_id', winningBid.project_id)
    .neq('id', params.id)

  if (losingBids?.length) {
    await admin.from('bids')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .in('id', losingBids.map(b => b.id))
  }

  // Update project status
  await admin.from('projects')
    .update({ status: 'awarded', updated_at: new Date().toISOString() })
    .eq('id', winningBid.project_id)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const projectUrl = `${baseUrl}/dashboard/contractor/projects/${winningBid.project_id}`
  const { title, properties } = winningBid.projects

  // Notify winning contractor
  const { data: winner } = await admin.from('user_profiles')
    .select('phone, email, full_name')
    .eq('id', winningBid.contractor_user_id)
    .single()

  if (winner?.phone) {
    await sendSMS(winner.phone, `You've been awarded "${title}" in ${properties.city}. Login for details: ${projectUrl}`)
  }
  if (winner?.email) {
    const { subject, html } = awardedWinnerEmail(title, properties.city, projectUrl)
    await sendEmail(winner.email, subject, html)
  }

  // Notify losing contractors
  for (const loser of (losingBids || [])) {
    const { data: loserProfile } = await admin.from('user_profiles')
      .select('phone, email')
      .eq('id', loser.contractor_user_id)
      .single()
    if (loserProfile?.phone) {
      await sendSMS(loserProfile.phone, `"${title}" has been awarded to another contractor. Watch for new projects on TAGS.`)
    }
  }

  return NextResponse.json({ success: true })
}
