import LegalPageWrapper from '@/components/LegalPageWrapper'

export default function ContractorAgreementPage() {
  return (
    <LegalPageWrapper title="Contractor Agreement" updated="July 2026">

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">1. Agreement Overview</h2>
        <p className="leading-relaxed">
          This Contractor Agreement (&ldquo;Agreement&rdquo;) is entered into between TAGS — The Apartment Guys System (&ldquo;TAGS,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;) and you, the individual or business entity registering as a contractor on tagyourproject.com (&ldquo;Contractor,&rdquo; &ldquo;you&rdquo;). This Agreement supplements the TAGS Terms of Service and governs your participation as a service provider on the platform.
        </p>
        <p className="leading-relaxed mt-3">
          By completing contractor registration and clicking &ldquo;I Agree,&rdquo; you acknowledge that you have read, understood, and agree to the terms of this Agreement. If you are registering on behalf of a business entity, you represent that you have the authority to bind that entity.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">2. Independent Contractor Status</h2>
        <p className="leading-relaxed">
          You are an independent contractor, not an employee, agent, partner, or joint venturer of TAGS. Nothing in this Agreement creates an employment relationship. You are solely responsible for:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Payment of all applicable taxes, including self-employment taxes.</li>
          <li>Maintaining your own workers&apos; compensation coverage as required by your jurisdiction.</li>
          <li>All decisions related to how, when, and with what tools you perform work.</li>
          <li>Hiring, supervising, and compensating any employees or subcontractors you engage.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          TAGS does not control the means or methods by which you perform work for property managers. TAGS is a technology platform that facilitates introductions and manages the workflow — not a contractor agency or staffing firm.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">3. Eligibility & Approval</h2>
        <p className="leading-relaxed">To be approved as a TAGS contractor, you must:</p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Hold all licenses required by your jurisdiction and trade(s).</li>
          <li>Carry general liability insurance with a minimum of $1,000,000 per occurrence and provide proof upon request.</li>
          <li>Be in good standing — no active license suspensions, revocations, or debarments.</li>
          <li>Be at least 18 years of age and legally authorized to work in the United States.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          TAGS reserves the right to approve or deny contractor applications at its sole discretion. TAGS may request updated license or insurance documentation at any time, and may suspend your account if documentation lapses.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">4. Platform Fees</h2>
        <ul className="space-y-3 list-disc list-inside leading-relaxed">
          <li><strong className="text-white">Annual Membership:</strong> $100 per year, billed at registration and on each anniversary. This fee grants access to the TAGS marketplace and the ability to view and bid on posted projects.</li>
          <li><strong className="text-white">Bid Award Fee:</strong> 1.5% of the awarded bid amount, charged only when a bid you submitted is accepted by a property manager. This fee is invoiced at the time of award.</li>
          <li>All fees are processed through Stripe. By providing payment information, you authorize TAGS to charge applicable fees as described.</li>
          <li>Fees are non-refundable except as required by applicable law or at TAGS&apos;s sole discretion.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">5. Bidding & Job Commitments</h2>
        <p className="leading-relaxed">Submitting a bid on TAGS is a serious commitment. When you submit a bid:</p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li>Your bid must be based on the published Scope of Work and reflect a genuine, good-faith price and timeline.</li>
          <li>You represent that you have the capacity, licensing, and availability to complete the work if your bid is accepted.</li>
          <li>If your bid is awarded, you are committed to completing the job at the bid price, timeline, and scope described.</li>
          <li>Abandoning an awarded job without mutual agreement is a material breach of this Agreement and may result in immediate account suspension.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          TAGS understands that circumstances change. If you cannot complete an awarded job, contact the property manager and TAGS immediately at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>. Documented emergencies will be handled with reasonable discretion.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">6. Work Quality & Professionalism</h2>
        <ul className="space-y-2 list-disc list-inside leading-relaxed">
          <li>All work must be performed in a professional, workmanlike manner consistent with industry standards.</li>
          <li>You are responsible for obtaining all necessary permits as required by the project scope and local regulations.</li>
          <li>You must communicate promptly and professionally with property managers through the TAGS platform.</li>
          <li>You must maintain a clean and safe jobsite and comply with all applicable OSHA and local safety requirements.</li>
          <li>Upon job completion, you must mark the project complete in the TAGS platform and cooperate with the completion confirmation process.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">7. Non-Circumvention</h2>
        <p className="leading-relaxed">
          TAGS invests significant resources to connect you with qualified property management clients. You agree that, for a period of twelve (12) months after your last TAGS-facilitated introduction to a property manager or management company, you will not solicit, accept, or perform work for that party outside of the TAGS platform in order to avoid platform fees.
        </p>
        <p className="leading-relaxed mt-3">
          This restriction does not apply to relationships you had with a party prior to meeting them through TAGS, or to relationships formed entirely outside of any TAGS introduction. Violation of this section is a material breach and may result in account termination and civil liability for damages.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">8. Ratings & Reviews</h2>
        <p className="leading-relaxed">
          Property managers may rate and review your work after project completion. These ratings are visible to other property managers on the platform. TAGS does not remove ratings unless they are factually false or violate our content policies. You may dispute an inaccurate rating by contacting <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">9. Termination</h2>
        <p className="leading-relaxed">
          TAGS may suspend or terminate your account for: violation of this Agreement or the Terms of Service; failure to maintain required licensing or insurance; poor performance or repeated negative ratings; fraudulent bids; non-circumvention violations; or at TAGS&apos;s sole discretion with 30 days notice for any reason not constituting cause.
        </p>
        <p className="leading-relaxed mt-3">
          Upon termination, any outstanding bid award fees remain due and payable. Annual membership fees are non-refundable upon termination for cause.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">10. Indemnification</h2>
        <p className="leading-relaxed">
          You agree to indemnify, defend, and hold harmless TAGS and its officers, directors, employees, and agents from any claims, damages, liabilities, costs, or expenses (including reasonable attorneys&apos; fees) arising from: your performance of work for a property manager; your violation of this Agreement; any bodily injury or property damage occurring during a job you performed; or your failure to maintain required licensing or insurance.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
        <p className="leading-relaxed">
          Questions about this Agreement? Reach us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>.
        </p>
      </section>

    </LegalPageWrapper>
  )
}
