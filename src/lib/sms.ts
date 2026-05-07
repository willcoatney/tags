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

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const body64 = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  // Prefer MessagingServiceSid (routes through approved A2P campaign)
  const params = messagingServiceSid
    ? { To: to, MessagingServiceSid: messagingServiceSid, Body: body }
    : { To: to, From: from!, Body: body }

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
  }
}
