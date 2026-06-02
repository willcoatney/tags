import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contractorUserId = req.nextUrl.searchParams.get('contractorUserId')
  if (!contractorUserId) return NextResponse.json({ error: 'contractorUserId required' }, { status: 400 })

  const admin = createAdminClient()
  const { data: messages } = await admin
    .from('project_messages')
    .select('*, user_profiles(full_name, role)')
    .eq('project_id', params.id)
    .eq('contractor_user_id', contractorUserId)
    .order('created_at', { ascending: true })

  return NextResponse.json(messages || [])
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message, contractorUserId } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })
  if (!contractorUserId) return NextResponse.json({ error: 'contractorUserId required' }, { status: 400 })

  const admin = createAdminClient()

  const { error } = await admin.from('project_messages').insert({
    project_id: params.id,
    sender_id: user.id,
    contractor_user_id: contractorUserId,
    message: message.trim(),
    channel: 'app',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // SMS bridge — notify the other party in this thread
  try {
    const { data: senderProfile } = await admin
      .from('user_profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .maybeSingle()

    const { data: project } = await admin
      .from('projects')
      .select('id, title, created_by')
      .eq('id', params.id)
      .maybeSingle()

    if (senderProfile && project) {
      const senderRole = senderProfile.role
      const senderName = senderProfile.full_name || (senderRole === 'pm' ? 'Property Manager' : 'Contractor')
      // PM sends → notify contractor. Contractor sends → notify PM.
      const otherPartyId = senderRole === 'pm' ? contractorUserId : project.created_by

      const { data: otherProfile } = await admin
        .from('user_profiles')
        .select('phone')
        .eq('id', otherPartyId)
        .maybeSingle()

      if (otherProfile?.phone) {
        await sendSMS(
          otherProfile.phone,
          `${senderName} via TAGS (${project.title}): ${message.trim()}`
        )
      }
    }
  } catch (smsErr) {
    console.error('[SMS bridge] Error:', smsErr)
  }

  return NextResponse.json({ success: true })
}
