const FROM = 'TAGS <notifications@tagyourproject.com>'

// L-06: Return boolean to allow callers to detect delivery failure
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!to || !process.env.RESEND_API_KEY) return false
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({ from: FROM, to, subject, html })
    return true
  } catch (e) {
    console.error('Email failed:', e)
    return false
  }
}

export function newBidEmail(projectTitle: string, companyName: string, url: string) {
  return {
    subject: `New bid received — ${projectTitle}`,
    html: `<h2>New bid received on ${projectTitle}</h2><p><strong>${companyName}</strong> submitted a bid.</p><p><a href="${url}">Review bids →</a></p>`,
  }
}

export function awardedWinnerEmail(projectTitle: string, city: string, url: string) {
  return {
    subject: `You've been awarded the job — ${projectTitle}`,
    html: `<h2>Congratulations!</h2><p><strong>${projectTitle}</strong> in ${city} has been awarded to you.</p><p><a href="${url}">View details →</a></p>`,
  }
}

export function contractorApprovedEmail(url: string) {
  return {
    subject: 'Your TAGS account is approved',
    html: `<h2>Welcome to TAGS!</h2><p>Your contractor account is approved. Start bidding now.</p><p><a href="${url}">Go to dashboard →</a></p>`,
  }
}
