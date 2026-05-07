import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: messages } = await admin
    .from('project_messages')
    .select('*, user_profiles(full_name, role)')
    .eq('project_id', params.id)
    .order('created_at', { ascending: true })

  return NextResponse.json(messages || [])
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

  const admin = createAdminClient()

  // Save message with channel='app'
  const { error } = await admin.from('project_messages').insert({
    project_id: params.id,
    sender_id: user.id,
    message: message.trim(),
    channel: 'app',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Bridge to SMS: look up sender role and notify the other party
  try {
    // Get sender profile
    const { data: senderProfile } = await admin
      .from('user_profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .maybeSingle()

    // Get project details with bids
    const { data: project } = await admin
      .from('projects')
      .select('id, title, created_by, status, bids(contractor_user_id, status)')
      .eq('id', params.id)
      .maybeSingle()

    if (senderProfile && project) {
      const senderRole = senderProfile.role
      const senderName = senderProfile.full_name || (senderRole === 'pm' ? 'Property Manager' : 'Contractor')
      let otherPartyId: string | null = null

      if (senderRole === 'pm') {
        // Notify awarded contractor
        const bids = (project.bids as Array<{ contractor_user_id: string; status: string }>) || []
        const awardedBid = bids.find(b => b.status === 'awarded')
        otherPartyId = awardedBid?.contractor_user_id || null
      } else {
        // Notify PM
        otherPartyId = project.created_by
      }

      if (otherPartyId) {
        const { data: otherProfile } = await admin
          .from('user_profiles')
          .select('phone')
          .eq('id', otherPartyId)
          .maybeSingle()

        if (otherProfile?.phone) {
          await sendSMS(
            otherProfile.phone,
            `${senderName} via TAGS (${project.title}): ${message.trim()}. Reply to this text to respond.`
          )
        }
      }
    }
  } catch (smsErr) {
    // SMS bridge failure should not block the response
    console.error('[SMS bridge] Error:', smsErr)
  }

  return NextResponse.json({ success: true })
}
