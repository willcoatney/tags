import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

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
    approval_status: 'rejected',
  }).eq('id', params.id)

  const { data: contractor } = await admin.from('contractor_profiles')
    .select('user_profiles(phone)')
    .eq('id', params.id)
    .single()

  const up = (contractor?.user_profiles as { phone?: string } | null)
  if (up?.phone) {
    await sendSMS(up.phone, 'Your TAGS application was not approved at this time.')
  }

  return NextResponse.json({ success: true })
}
