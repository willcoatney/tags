import LegalPageWrapper from '@/components/LegalPageWrapper'

export default function HomeownerAgreementPage() {
  return (
    <LegalPageWrapper title="Homeowner Agreement" updated="November 2026">

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">1. What This Agreement Covers</h2>
        <p className="leading-relaxed">
          This Homeowner Agreement (&ldquo;Agreement&rdquo;) is between TAGS — The Apartment Guys System (&ldquo;TAGS,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;) and you, registering as a Homeowner on tagyourproject.com (&ldquo;you&rdquo;). This Agreement supplements the TAGS Terms of Service and governs your use of the platform to generate Scopes of Work for your personal repair and renovation projects.
        </p>
        <p className="leading-relaxed mt-3">
          By completing registration and clicking &ldquo;Create Account,&rdquo; you confirm that you agree to the terms of this Agreement.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">2. What You Are Purchasing</h2>
        <p className="leading-relaxed">
          As a Homeowner, you purchase individual Scopes of Work on a pay-per-use basis. Each SOW generation is a separate transaction. Here is exactly what you get and what you pay:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li><strong className="text-white">Price:</strong> $20 per Scope of Work generated. No subscription, no hidden fees.</li>
          <li><strong className="text-white">What you receive:</strong> A professionally formatted, AI-assisted Scope of Work document covering project overview, numbered work steps, materials required, labor requirements, site safety, cleanup expectations, and a ballpark cost estimate.</li>
          <li><strong className="text-white">Delivery:</strong> Your SOW is generated and available for download within your account dashboard immediately upon generation — typically within 60 seconds of submission.</li>
          <li><strong className="text-white">Payment:</strong> Your $20 charge is processed through Stripe at the time you submit your project for generation. By submitting, you authorize this charge.</li>
          <li><strong className="text-white">Refunds:</strong> SOW purchases are non-refundable once generation has been initiated, except as required by applicable law. If generation fails due to a platform error, we will re-generate at no additional charge or issue a full refund.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">3. What a TAGS SOW Is — and Is Not</h2>
        <p className="leading-relaxed">
          A TAGS-generated Scope of Work is a starting-point document designed to help you communicate clearly with contractors. It is important that you understand its limitations before you rely on it:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>A TAGS SOW is <strong className="text-white">not professional engineering, architectural, structural, or legal advice.</strong></li>
          <li>A TAGS SOW is <strong className="text-white">not a building permit or code compliance review.</strong> It does not account for local building codes, permit requirements, HOA restrictions, or zoning regulations in your area.</li>
          <li>The <strong className="text-white">cost estimate</strong> included in your SOW is a ballpark figure based on national average trade pricing. It is intended to help you evaluate contractor quotes — not as a binding or guaranteed price.</li>
          <li>TAGS cannot physically inspect your property. The SOW is based solely on the description and photos you provide. Accuracy depends on the completeness and accuracy of your submission.</li>
          <li>For complex, structural, or safety-sensitive projects, you should consult a licensed professional before proceeding.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">4. Your Responsibilities</h2>
        <p className="leading-relaxed">You agree to:</p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Provide accurate and honest descriptions of your repair or renovation project.</li>
          <li>Upload photos that fairly represent the actual condition of the area requiring work.</li>
          <li>Review your TAGS-generated SOW before sharing it with any contractor. You are responsible for the accuracy of any SOW you share — not TAGS.</li>
          <li>Use TAGS-generated SOWs only for legitimate personal repair and renovation projects on property you own or have authority to repair.</li>
          <li>Not use TAGS or its documents for fraudulent, misrepresentative, or commercial resale purposes.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">5. Your Contractor Relationship</h2>
        <p className="leading-relaxed">
          TAGS gives you a document. What you do with it is entirely your decision. TAGS does not introduce, refer, vet, approve, or manage contractors. You are solely responsible for:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Selecting any contractor you choose to share your SOW with.</li>
          <li>Verifying contractor licenses, insurance, and credentials before hiring.</li>
          <li>Negotiating and entering into any work agreement directly with your contractor.</li>
          <li>All decisions related to your project, your property, and your contractor relationship.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          TAGS is not a party to any agreement between you and a contractor and is not responsible for the quality, safety, legality, cost, or completion of any work performed.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">6. Your Data</h2>
        <p className="leading-relaxed">
          By uploading photos and project descriptions, you grant TAGS a limited license to process and store that content for the purpose of generating your Scope of Work. This includes transmitting your content to Anthropic&apos;s API for AI processing. TAGS does not use your project data for advertising and does not sell it to third parties. See our <a href="/privacy" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>Privacy Policy</a> for full details.
        </p>
        <p className="leading-relaxed mt-3">
          You represent that you have the right to upload all content you submit, including any photos of your property or the work area.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">7. Account & Termination</h2>
        <p className="leading-relaxed">
          You may close your account at any time by contacting <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>. Closing your account does not entitle you to a refund for any SOWs previously generated. TAGS may suspend or terminate accounts for violation of this Agreement or the Terms of Service.
        </p>
        <p className="leading-relaxed mt-3">
          Your generated SOW documents will remain accessible in your account dashboard for 90 days following account closure, upon request.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">8. Contact</h2>
        <p className="leading-relaxed">
          Questions about this Agreement? Reach us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>. We respond to all inquiries within 5 business days.
        </p>
      </section>

    </LegalPageWrapper>
  )
}
