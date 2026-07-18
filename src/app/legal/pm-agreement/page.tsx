import LegalPageWrapper from '@/components/LegalPageWrapper'

export default function PMagreementPage() {
  return (
    <LegalPageWrapper title="Property Manager Agreement" updated="July 2026">

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">1. Agreement Overview</h2>
        <p className="leading-relaxed">
          This Property Manager Agreement (&ldquo;Agreement&rdquo;) is entered into between TAGS — The Apartment Guys System (&ldquo;TAGS,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;) and you, registering as a Property Manager or Regional Manager on tagyourproject.com (&ldquo;you&rdquo; or &ldquo;PM&rdquo;). This Agreement supplements the TAGS Terms of Service and governs your use of the platform to post repair projects and engage contractors.
        </p>
        <p className="leading-relaxed mt-3">
          By completing registration and clicking &ldquo;I Agree,&rdquo; you confirm that you have authority to post projects and engage contractors on behalf of your organization, and that you agree to the terms of this Agreement.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">2. Who This Applies To</h2>
        <p className="leading-relaxed">This Agreement applies to two roles on the TAGS platform:</p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li><strong className="text-white">Property Manager (PM)</strong> — A professional responsible for managing one or more multifamily residential communities. PMs post projects, review TAGS-generated Scopes of Work, and award bids.</li>
          <li><strong className="text-white">Regional Manager (RM) / Asset Manager</strong> — A professional overseeing a portfolio of multiple communities managed by one or more PMs. RMs can view activity across their portfolio and manage PM access via invite links.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">3. Platform Fees</h2>
        <ul className="space-y-3 list-disc list-inside leading-relaxed">
          <li><strong className="text-white">Property Manager:</strong> $50 per community per month (beta pricing). This fee covers unlimited project posting and SOW generation for your registered community.</li>
          <li><strong className="text-white">Regional Manager:</strong> Pricing is based on portfolio size and will be communicated at registration. Contact <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a> for current RM pricing.</li>
          <li>Early access accounts are grandfathered at current rates. TAGS will provide 30 days written notice before any pricing changes affect your account.</li>
          <li>Fees are processed through Stripe. By providing payment information, you authorize TAGS to charge applicable fees.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">4. Your Responsibilities When Posting Projects</h2>
        <p className="leading-relaxed">Posting a project on TAGS is a representation to contractors that a real repair need exists and that you have authority to engage a contractor to perform the work. You agree to:</p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Provide accurate and complete project descriptions that give contractors a genuine picture of the scope.</li>
          <li>Upload clear, relevant photos that fairly represent the condition requiring repair.</li>
          <li>Review all TAGS-generated Scopes of Work before publishing a project for bid. You are responsible for the accuracy of any SOW you publish — not TAGS.</li>
          <li>Respond to contractor questions in a reasonable timeframe (we recommend within 2 business days).</li>
          <li>Not post projects you have no genuine intent to proceed with.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">5. Bid Awards & Commitments</h2>
        <p className="leading-relaxed">
          Awarding a bid on TAGS is a binding commitment. When you click &ldquo;Award Bid,&rdquo; you are entering into a work agreement with that contractor at the stated price, scope, and timeline. You agree to:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Honor bid awards — do not award a bid unless you are prepared to proceed with that contractor.</li>
          <li>Provide the contractor with reasonable access to the property to perform the work.</li>
          <li>Confirm project completion honestly and in a timely manner once the contractor marks the job done.</li>
          <li>Provide accurate, good-faith ratings and reviews based on the contractor&apos;s actual performance.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          Repeatedly awarding bids and then failing to allow the contractor to perform the work is a violation of this Agreement and may result in account suspension.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">6. AI-Generated Scopes of Work</h2>
        <p className="leading-relaxed">
          TAGS uses its proprietary document engine to generate Scopes of Work from your project description and photos. These documents are provided as a professional starting point. You acknowledge that:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>TAGS-generated SOWs may not be complete, accurate, or sufficient for every regulatory, insurance, or contractual purpose.</li>
          <li>You are responsible for reviewing the SOW before publishing and for any modifications you make.</li>
          <li>By publishing a project, you confirm you have reviewed the SOW and find it acceptable for soliciting bids.</li>
          <li>TAGS is not liable for errors or omissions in a TAGS-generated SOW or for any consequences arising from contractor reliance on a SOW you approved and published.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">7. Data You Upload</h2>
        <p className="leading-relaxed">
          By uploading project descriptions and photos to TAGS, you grant TAGS a limited license to process and store that content for the purpose of generating Scopes of Work and facilitating the bidding process. This includes transmitting your content to Anthropic&apos;s API for AI processing. TAGS does not use your project data for advertising or sell it to third parties. See our <a href="/privacy" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>Privacy Policy</a> for full details.
        </p>
        <p className="leading-relaxed mt-3">
          You represent that you have the right to upload all content you post, and that doing so does not violate any privacy laws, tenant agreements, or third-party rights.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">8. Non-Circumvention</h2>
        <p className="leading-relaxed">
          You agree not to solicit or engage contractors you met through TAGS for work outside the TAGS platform for a period of twelve (12) months after your last TAGS-facilitated interaction with that contractor, for the purpose of avoiding platform fees. This does not apply to contractors you had a pre-existing relationship with prior to their appearance on TAGS.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">9. Termination</h2>
        <p className="leading-relaxed">
          You may cancel your account at any time by contacting <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>. TAGS may suspend or terminate accounts for violation of this Agreement, non-payment of fees, or at our discretion with 30 days notice. Upon termination, open projects will be archived and contractors with active bids will be notified.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
        <p className="leading-relaxed">
          Questions about this Agreement? Reach us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>.
        </p>
      </section>

    </LegalPageWrapper>
  )
}
