import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { sendEmail, contractorApprovedEmail } from '@/lib/email'

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

  await admin.from('contractor_profiles').update({
    approval_status: 'approved',
    approved_by: user.id,
    approved_at: new Date().toISOString(),
  }).eq('id', params.id)

  const { data: contractor } = await admin.from('contractor_profiles')
    .select('user_profiles(phone, email)')
    .eq('id', params.id)
    .single()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const dashUrl = `${baseUrl}/dashboard/contractor`
  const up = (contractor?.user_profiles as { phone?: string; email?: string } | null)

  if (up?.phone) await sendSMS(up.phone, `Your TAGS account is approved! Start bidding: ${dashUrl}`)
  if (up?.email) {
    const { subject, html } = contractorApprovedEmail(dashUrl)
    await sendEmail(up.email, subject, html)
  }

  return NextResponse.json({ success: true })
}
