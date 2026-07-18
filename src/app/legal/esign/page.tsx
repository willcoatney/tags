import LegalPageWrapper from '@/components/LegalPageWrapper'

export default function ESignPage() {
  return (
    <LegalPageWrapper title="Electronic Signature & Consent" updated="July 2026">

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">1. Overview</h2>
        <p className="leading-relaxed">
          This Electronic Signature and Consent Agreement (&ldquo;E-Sign Agreement&rdquo;) governs your consent to conduct business electronically with TAGS — The Apartment Guys System (&ldquo;TAGS&rdquo;) and other users of the platform. By using tagyourproject.com, you agree to the terms of this E-Sign Agreement.
        </p>
        <p className="leading-relaxed mt-3">
          This agreement is made in accordance with the Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. § 7001 et seq.) and applicable state electronic signature laws.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">2. Your Consent to Electronic Transactions</h2>
        <p className="leading-relaxed">
          By creating an account or taking any action on tagyourproject.com (including clicking &ldquo;I Agree,&rdquo; &ldquo;Register,&rdquo; &ldquo;Submit Bid,&rdquo; or &ldquo;Award Bid&rdquo;), you consent to:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Conducting business with TAGS and other platform users electronically.</li>
          <li>Receiving all disclosures, notices, agreements, and communications from TAGS in electronic form (email, SMS, or platform notifications).</li>
          <li>Electronic signatures having the same legal force and effect as handwritten signatures.</li>
          <li>Electronic records serving as originals for all purposes under applicable law.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">3. How Electronic Signatures Work on TAGS</h2>
        <p className="leading-relaxed">On the TAGS platform, electronic signatures are created when you:</p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li><strong className="text-white">Register an account</strong> — Clicking &ldquo;Create Account&rdquo; or completing the registration flow constitutes your electronic signature on the Terms of Service, this E-Sign Agreement, and the role-specific agreement applicable to your account type (PM Agreement or Contractor Agreement).</li>
          <li><strong className="text-white">Award a bid</strong> — Clicking &ldquo;Award Bid&rdquo; constitutes an electronic signature creating a binding work agreement between you (as a property manager) and the selected contractor.</li>
          <li><strong className="text-white">Submit a bid</strong> — Clicking &ldquo;Submit Bid&rdquo; constitutes an electronic signature on your bid proposal, including the stated price, timeline, and scope commitment.</li>
          <li><strong className="text-white">Confirm project completion</strong> — Clicking &ldquo;Mark Complete&rdquo; or confirming completion constitutes an electronic acknowledgment that the described work has been performed.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">4. Electronic Communications Consent</h2>
        <p className="leading-relaxed">
          By creating a TAGS account, you consent to receive the following categories of electronic communication:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li><strong className="text-white">Transactional emails</strong> — Account confirmation, password reset, project notifications, bid alerts, and award notifications. Sent via Resend from hello@tagyourproject.com.</li>
          <li><strong className="text-white">SMS notifications</strong> — Bid alerts, job updates, and completion confirmations. Sent via Twilio from the TAGS messaging service. Message and data rates may apply.</li>
          <li><strong className="text-white">Platform notifications</strong> — In-app alerts and status updates.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          These communications are operational in nature and are required for the platform to function. They are not marketing communications.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">5. SMS Consent (Required by Federal Law)</h2>
        <p className="leading-relaxed">
          By providing your phone number and creating an account, you expressly consent to receive SMS messages from TAGS related to your account activity. You understand that:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Message frequency varies based on platform activity.</li>
          <li>Message and data rates may apply based on your carrier plan.</li>
          <li>You can opt out at any time by replying <strong className="text-white">STOP</strong> to any TAGS SMS. After opting out, you will receive one confirmation message and no further SMS from TAGS.</li>
          <li>You can opt back in by replying <strong className="text-white">START</strong>.</li>
          <li>For help, reply <strong className="text-white">HELP</strong> or email <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          Note: Opting out of SMS may affect your ability to receive timely bid and project notifications. You can manage notification preferences in your account settings.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">6. System Requirements</h2>
        <p className="leading-relaxed">
          To access electronic records and disclosures from TAGS, you need:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>A device with internet access and a current web browser (Chrome, Firefox, Safari, or Edge — current versions).</li>
          <li>An active email address capable of receiving messages from hello@tagyourproject.com.</li>
          <li>Sufficient storage to save or print electronic records if you choose to retain them.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          TAGS does not currently provide a native mobile application. The platform is accessible via mobile browser.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">7. Requesting Paper Records</h2>
        <p className="leading-relaxed">
          You have the right to request paper copies of any electronic record or agreement. To request a paper copy, contact us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>. We may charge a reasonable fee for paper copies. Requesting paper records does not withdraw your consent to electronic transactions.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">8. Withdrawing Consent</h2>
        <p className="leading-relaxed">
          You may withdraw your consent to electronic transactions at any time by closing your TAGS account. Contact <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a> to initiate account closure. Withdrawal of consent does not affect the validity of any electronic signatures or agreements made prior to withdrawal.
        </p>
        <p className="leading-relaxed mt-3">
          Because TAGS is an entirely electronic platform, withdrawal of consent to electronic transactions necessarily means you can no longer use the service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">9. Retention of Records</h2>
        <p className="leading-relaxed">
          TAGS retains electronic records of all agreements, bid awards, and transactions for a minimum of 3 years from the date of the record. You may download your project and bid history from your account dashboard at any time while your account is active.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
        <p className="leading-relaxed">
          Questions about electronic signatures or consent? Reach us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>.
        </p>
      </section>

    </LegalPageWrapper>
  )
}
