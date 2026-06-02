import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Twilio sends form-encoded POST to this endpoint when someone replies to a TAGS SMS.
// We parse the sender's phone, find their user + thread context, and store the message.

export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)

  const from = params.get('From') || ''
  const messageBody = params.get('Body') || ''

  if (!from || !messageBody.trim()) {
    return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } })
  }

  // Normalize to digits only for DB lookup
  const digits = from.replace(/\D/g, '')
  const normalized10 = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits

  try {
    const admin = createAdminClient()

    // Find the user by phone number — try both formats
    const { data: users } = await admin
      .from('user_profiles')
      .select('id, role, full_name, phone')
      .or(`phone.eq.${normalized10},phone.eq.+1${normalized10},phone.eq.${digits}`)

    const sender = users?.[0] ?? null

    if (!sender) {
      console.warn('[SMS webhook] Unknown sender phone:', from)
      return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } })
    }

    // Find the most recent thread this sender is part of
    let projectId: string | null = null
    let contractorUserId: string | null = null

    if (sender.role === 'contractor') {
      // Find the most recent project_messages thread for this contractor
      const { data: recentMsg } = await admin
        .from('project_messages')
        .select('project_id, contractor_user_id')
        .eq('contractor_user_id', sender.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (recentMsg) {
        projectId = recentMsg.project_id
        contractorUserId = recentMsg.contractor_user_id
      } else {
        // No messages yet — find their most recently bid project
        const { data: recentBid } = await admin
          .from('bids')
          .select('project_id, contractor_user_id')
          .eq('contractor_user_id', sender.id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (recentBid) {
          projectId = recentBid.project_id
          contractorUserId = sender.id
        }
      }
    } else if (sender.role === 'pm') {
      // Find the most recent message thread this PM was part of
      const { data: recentMsg } = await admin
        .from('project_messages')
        .select('project_id, contractor_user_id')
        .eq('sender_id', sender.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (recentMsg) {
        projectId = recentMsg.project_id
        contractorUserId = recentMsg.contractor_user_id
      }
    }

    if (!projectId || !contractorUserId) {
      console.warn('[SMS webhook] Could not resolve thread for sender:', sender.id)
      return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } })
    }

    // Store the inbound message
    await admin.from('project_messages').insert({
      project_id: projectId,
      sender_id: sender.id,
      contractor_user_id: contractorUserId,
      message: messageBody.trim(),
      channel: 'sms',
    })

    console.log(`[SMS webhook] Stored reply from ${sender.role} ${sender.id} on project ${projectId}`)
  } catch (err) {
    console.error('[SMS webhook] Error:', err)
  }

  // Twilio requires a TwiML response — empty response means no auto-reply
  return new NextResponse('<Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}
