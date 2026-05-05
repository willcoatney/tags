export async function sendSMS(to: string, message: string) {
  if (!to || !process.env.TWILIO_ACCOUNT_SID) return
  const twilio = (await import('twilio')).default
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  const normalized = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`
  try {
    await client.messages.create({
      from: process.env.TWILIO_FROM_NUMBER,
      to: normalized,
      body: message,
    })
  } catch (e) {
    console.error('SMS failed:', e)
  }
}
