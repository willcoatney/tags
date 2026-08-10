/**
 * Platform fee email templates
 * Inline HTML strings — no separate file imports.
 */

export function feeChargedEmail(
  projectTitle: string,
  feeAmount: string,
  cardLast4: string,
): { subject: string; html: string } {
  return {
    subject: `Platform fee charged — ${projectTitle}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Platform Fee Charged</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#161b27;border-radius:12px;border:1px solid #1e2536;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid #1e2536;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">TAGS</p>
              <p style="margin:4px 0 0;font-size:12px;color:#4b5675;">The Apartment Guys System</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">✅ Platform fee charged</p>
              <p style="margin:0 0 24px;font-size:15px;color:#8892a4;line-height:1.6;">
                A platform fee has been charged for your awarded project.
              </p>
              <!-- Fee detail box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;border-radius:8px;border:1px solid #1e2536;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#4b5675;">Project</p>
                    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#ffffff;">${escapeHtml(projectTitle)}</p>
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#4b5675;">Fee Charged</p>
                    <p style="margin:0 0 16px;font-size:24px;font-weight:700;color:#34d399;">${escapeHtml(feeAmount)}</p>
                    <p style="margin:0;font-size:13px;color:#6b7a96;">Charged to card ending <strong style="color:#e2e8f0;">${escapeHtml(cardLast4)}</strong></p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#6b7a96;line-height:1.6;">
                This is the 1.5% TAGS platform fee for projects awarded through our marketplace.
                If you have questions, reply to this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1e2536;">
              <p style="margin:0;font-size:12px;color:#3a4255;">© TAGS — The Apartment Guys System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  }
}

export function feeDeclinedEmail(
  projectTitle: string,
  feeAmount: string,
  billingUrl: string,
): { subject: string; html: string } {
  return {
    subject: `Action required: Platform fee payment failed — ${projectTitle}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Platform Fee Failed</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#161b27;border-radius:12px;border:1px solid #1e2536;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid #1e2536;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">TAGS</p>
              <p style="margin:4px 0 0;font-size:12px;color:#4b5675;">The Apartment Guys System</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">⚠️ Platform fee payment failed</p>
              <p style="margin:0 0 24px;font-size:15px;color:#8892a4;line-height:1.6;">
                We were unable to charge the TAGS platform fee for your awarded project.
                Please update your payment method within <strong style="color:#fbbf24;">48 hours</strong>.
              </p>
              <!-- Fee detail box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;border-radius:8px;border:1px solid #422b2b;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#4b5675;">Project</p>
                    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#ffffff;">${escapeHtml(projectTitle)}</p>
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#4b5675;">Amount Due</p>
                    <p style="margin:0;font-size:24px;font-weight:700;color:#f87171;">${escapeHtml(feeAmount)}</p>
                  </td>
                </tr>
              </table>
              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#2563eb;border-radius:8px;">
                    <a href="${escapeHtml(billingUrl)}"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Update Payment Method →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#6b7a96;line-height:1.6;">
                Your project award stands — this only affects the platform fee.
                If the fee is not resolved within 48 hours, our team may reach out.
                Questions? Reply to this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1e2536;">
              <p style="margin:0;font-size:12px;color:#3a4255;">© TAGS — The Apartment Guys System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  }
}

/** Minimal HTML entity escaping for inline template values */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
