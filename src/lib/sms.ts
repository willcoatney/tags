// Twilio SMS helper — server-side only
export async function sendSMS(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
  const from = process.env.TWILIO_FROM_NUMBER

  if (!accountSid || !authToken || (!messagingServiceSid && !from)) {
    console.warn('[SMS] Twilio not configured — skipping SMS to', to)
    return
  }

  // Normalize to E.164 — Twilio requires +1XXXXXXXXXX for US numbers
  const digits = to.replace(/\D/g, '')
  const normalized = digits.startsWith('1') ? `+${digits}` : `+1${digits}`

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const body64 = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  // Use MessagingServiceSid for A2P compliance; From is not needed when using a messaging service
  const params: Record<string, string> = messagingServiceSid
    ? { To: normalized, MessagingServiceSid: messagingServiceSid, Body: body }
    : { To: normalized, From: from!, Body: body }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${body64}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[SMS] Twilio error:', err)
    throw new Error(`SMS failed to ${normalized}: ${err}`)
  } else {
    console.log('[SMS] Sent to', normalized)
  }
}
