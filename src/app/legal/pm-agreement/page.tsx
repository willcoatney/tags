import LegalPageWrapper from '@/components/LegalPageWrapper'

export default function PMagreementPage() {
  return (
    <LegalPageWrapper title="Property Manager Agreement" updated="November 2026">

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">1. Agreement Overview</h2>
        <p className="leading-relaxed">
          This Property Manager Agreement (&ldquo;Agreement&rdquo;) is entered into between TAGS — The Apartment Guys System (&ldquo;TAGS,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;) and you, registering as a Property Manager on tagyourproject.com (&ldquo;you&rdquo; or &ldquo;PM&rdquo;). This Agreement supplements the TAGS Terms of Service and governs your use of the platform to generate and manage Scopes of Work.
        </p>
        <p className="leading-relaxed mt-3">
          By completing registration and clicking &ldquo;I Agree,&rdquo; you confirm that you have authority to act on behalf of your organization and that you agree to the terms of this Agreement.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">2. What TAGS Provides</h2>
        <p className="leading-relaxed">TAGS is a Scope of Work generation platform. As a Property Manager, you may use TAGS to:</p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Submit repair descriptions and photos to generate AI-assisted Scopes of Work.</li>
          <li>Review, download, print, and share generated SOWs with contractors of your choosing.</li>
          <li>Maintain a project history within your account dashboard.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          TAGS does not introduce or refer contractors, facilitate bidding, manage contractor relationships, or participate in any work agreements between you and any contractor you engage. You bring your own contractors. TAGS provides the document.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">3. Platform Fees</h2>
        <ul className="space-y-3 list-disc list-inside leading-relaxed">
          <li><strong className="text-white">Property Manager:</strong> $50 per month. Includes 3 free Scope of Work generations to start — no credit card required for the trial. After your 3rd SOW, the $50/month subscription activates.</li>
          <li>Early access accounts are grandfathered at current rates. TAGS will provide 30 days written notice before any pricing changes affect your account.</li>
          <li>Fees are processed through Stripe. By providing payment information, you authorize TAGS to charge applicable fees on the billing cycle.</li>
          <li>Fees are non-refundable except as required by applicable law.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">4. Your Responsibilities</h2>
        <p className="leading-relaxed">You agree to:</p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Provide accurate and complete project descriptions and photos that fairly represent the condition requiring repair.</li>
          <li>Review all TAGS-generated Scopes of Work before sharing them with contractors. You are responsible for the accuracy of any SOW you share — not TAGS.</li>
          <li>Use TAGS-generated SOWs only for legitimate repair and renovation projects on properties you manage or own.</li>
          <li>Not submit false, misleading, or fraudulent project information.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">5. TAGS-Generated Scopes of Work</h2>
        <p className="leading-relaxed">
          TAGS uses its proprietary document engine to generate Scopes of Work from your project description and photos. These documents are provided as a professional starting point. You acknowledge that:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>TAGS-generated SOWs may not be complete, accurate, or sufficient for every regulatory, insurance, or contractual purpose.</li>
          <li>You are responsible for reviewing the SOW before sharing it with any contractor.</li>
          <li>Cost estimates included in SOWs are ballpark figures based on national average trade pricing — not binding quotes. Final pricing is always set by the contractor you engage.</li>
          <li>TAGS is not liable for errors or omissions in a TAGS-generated SOW or for any consequences arising from contractor reliance on a SOW you shared.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">6. Contractor Relationships</h2>
        <p className="leading-relaxed">
          TAGS does not introduce, vet, approve, or manage contractors. You are solely responsible for selecting, licensing verification, bonding, insuring, and contracting with any contractors you engage. TAGS is not a party to any contract between you and a contractor, and is not responsible for the quality, safety, legality, or completion of any work performed.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">7. Data You Upload</h2>
        <p className="leading-relaxed">
          By uploading project descriptions and photos to TAGS, you grant TAGS a limited license to process and store that content for the purpose of generating Scopes of Work. This includes transmitting your content to Anthropic&apos;s API for AI processing. TAGS does not use your project data for advertising or sell it to third parties. See our <a href="/privacy" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>Privacy Policy</a> for full details.
        </p>
        <p className="leading-relaxed mt-3">
          You represent that you have the right to upload all content you post, and that doing so does not violate any privacy laws, tenant agreements, or third-party rights.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">8. Termination</h2>
        <p className="leading-relaxed">
          You may cancel your account at any time by contacting <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>. TAGS may suspend or terminate accounts for violation of this Agreement, non-payment of fees, or at our discretion with 30 days notice. Upon termination, your project history will be archived and accessible for 90 days upon request.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
        <p className="leading-relaxed">
          Questions about this Agreement? Reach us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>.
        </p>
      </section>

    </LegalPageWrapper>
  )
}
