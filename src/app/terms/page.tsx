import Link from 'next/link'

export default function TermsPage() {
  return (
    <div style={{ background: 'oklch(0.13 0.022 252)', color: 'oklch(0.96 0.008 252)' }} className="min-h-screen font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ background: 'oklch(0.13 0.022 252 / 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <Link href="/" className="flex items-center gap-2">
          <img src="/tags-logo.jpg" alt="TAGS" className="h-10 max-w-[130px] object-contain rounded-md shrink-0" />
        </Link>
        <Link href="/legal" className="text-sm" style={{ color: 'oklch(0.57 0.135 183)' }}>← Legal Center</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-20">
        <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
        <p className="text-sm mb-12" style={{ color: 'oklch(0.50 0.02 252)' }}>Last updated: July 2026</p>

        <div className="space-y-10" style={{ color: 'oklch(0.72 0.015 252)' }}>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Agreement to Terms</h2>
            <p className="leading-relaxed">By creating an account on tagyourproject.com, you agree to these Terms of Service. If you do not agree, do not use the platform. TAGS is operated by The Apartment Guys System.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Who Can Use TAGS</h2>
            <p className="leading-relaxed mb-3">TAGS is designed for anyone who needs to define and document a repair or renovation project:</p>
            <ul className="space-y-2 list-disc list-inside leading-relaxed">
              <li><strong className="text-white">Property Managers</strong> — professionals managing multifamily or commercial properties.</li>
              <li><strong className="text-white">Homeowners</strong> — individuals managing repairs or renovations on their own property.</li>
              <li><strong className="text-white">Maintenance Professionals</strong> — staff generating scopes for internal approval or contractor engagement.</li>
              <li><strong className="text-white">Property Investors</strong> — owners planning and budgeting improvements across a portfolio.</li>
            </ul>
            <p className="leading-relaxed mt-3">You must be at least 18 years old to use TAGS.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Pricing & Fees</h2>
            <ul className="space-y-3 list-disc list-inside leading-relaxed">
              <li><strong className="text-white">Property Managers:</strong> $50 per month per community. Includes 3 free Scope of Work generations to start — no credit card required for the trial. Early access accounts are grandfathered at current rates.</li>
              <li><strong className="text-white">Homeowners:</strong> $20 per Scope of Work generated. No subscription required.</li>
              <li>All fees are processed through Stripe. By providing payment information, you authorize TAGS to charge applicable fees.</li>
              <li>Fees are non-refundable except as required by applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">User Responsibilities</h2>
            <ul className="space-y-2 list-disc list-inside leading-relaxed">
              <li>Provide accurate and complete project descriptions and photos.</li>
              <li>Review all generated Scopes of Work before sharing with contractors.</li>
              <li>Use the SOW as a starting point — final scope and pricing are always set by the contractor you engage.</li>
              <li>You are solely responsible for selecting, vetting, licensing verification, and contracting with any contractors you choose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">TAGS-Generated Scopes of Work</h2>
            <p className="leading-relaxed">TAGS uses AI to generate Scopes of Work from project descriptions and photos. These documents are provided as a professional starting point and should be reviewed before sharing with contractors. TAGS does not guarantee that generated SOWs are complete, accurate, or sufficient for all regulatory or contractual purposes. Cost estimates are ballpark figures for scoping purposes only — not binding quotes.</p>
            <p className="leading-relaxed mt-3">You may print, download, and share your TAGS-generated Scope of Work with any contractors of your choosing. The SOW is provided for your use in connection with your project.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Prohibited Conduct</h2>
            <ul className="space-y-2 list-disc list-inside leading-relaxed">
              <li>Submitting false, misleading, or fraudulent information.</li>
              <li>Using TAGS-generated documents for fraudulent or misrepresentative purposes.</li>
              <li>Harassing, threatening, or discriminating against any other user.</li>
              <li>Attempting to access, modify, or disrupt the platform&apos;s systems or data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">TAGS&apos;s Role</h2>
            <p className="leading-relaxed">TAGS is a Scope of Work generation platform. TAGS is not a party to any contract between a user and a contractor, and is not responsible for the quality, safety, legality, or completion of any work performed. Users are solely responsible for selecting, vetting, and contracting with any contractors they choose to engage. Disputes between users and contractors are the responsibility of those parties to resolve.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
            <p className="leading-relaxed">To the fullest extent permitted by law, TAGS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability to you for any claim shall not exceed the fees you paid to TAGS in the three months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Termination</h2>
            <p className="leading-relaxed">TAGS may suspend or terminate your account at any time for violation of these terms. You may close your account at any time by contacting <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>. Upon termination, your data may be retained for up to 90 days for legal and operational purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes to These Terms</h2>
            <p className="leading-relaxed">We may update these Terms from time to time. We will notify active users of material changes via email. Continued use of the platform after notice constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p className="leading-relaxed">Questions about these Terms? Reach us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>.</p>
          </section>

        </div>
      </div>

      <footer className="px-6 md:px-12 py-8 mt-12" style={{ borderTop: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'oklch(0.32 0.015 252)' }}>© {new Date().getFullYear()} TAGS — The Apartment Guys System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>Privacy Policy</Link>
            <Link href="/terms" className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
