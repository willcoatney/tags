import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-sm mb-12" style={{ color: 'oklch(0.50 0.02 252)' }}>Last updated: July 2026</p>

        <div className="space-y-10" style={{ color: 'oklch(0.72 0.015 252)' }}>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Who We Are</h2>
            <p className="leading-relaxed">TAGS (The Apartment Guys System) is a two-sided marketplace for multifamily property repair, operated at tagyourproject.com. We connect property managers and regional managers with vetted contractors using AI-generated Scopes of Work.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What We Collect</h2>
            <ul className="space-y-2 list-disc list-inside leading-relaxed">
              <li><strong className="text-white">Account information:</strong> Name, email address, phone number, company name, and role (Property Manager, Regional Manager, or Contractor).</li>
              <li><strong className="text-white">Project information:</strong> Project descriptions, photos, unit numbers, property addresses, and Scopes of Work you create or receive through the platform.</li>
              <li><strong className="text-white">Bid information:</strong> Bid amounts, timelines, and notes submitted by contractors.</li>
              <li><strong className="text-white">Communication records:</strong> Messages sent between property managers and contractors through the TAGS platform, including SMS messages routed through our system.</li>
              <li><strong className="text-white">Usage data:</strong> How you interact with the platform — pages visited, actions taken, timestamps.</li>
              <li><strong className="text-white">Payment information:</strong> Billing is processed through Stripe. TAGS does not store your full payment card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
            <ul className="space-y-2 list-disc list-inside leading-relaxed">
              <li>To operate the TAGS platform and provide its core services.</li>
              <li>To send SMS notifications via Twilio (bid alerts, job updates, completion confirmations).</li>
              <li>To send transactional emails via Resend (account confirmations, project notifications).</li>
              <li>To generate AI-powered Scopes of Work using Anthropic&apos;s Claude — your project description and photos are sent to Anthropic&apos;s API for this purpose.</li>
              <li>To process payments through Stripe for contractor membership fees and per-bid charges.</li>
              <li>To improve the platform and diagnose technical issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What We Don&apos;t Do</h2>
            <ul className="space-y-2 list-disc list-inside leading-relaxed">
              <li>We do not sell your personal information to third parties.</li>
              <li>We do not use your project data for advertising purposes.</li>
              <li>We do not share your information with anyone outside the platform except the service providers listed in this policy (Supabase, Twilio, Resend, Anthropic, Stripe, Netlify).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Storage & Security</h2>
            <p className="leading-relaxed">Your data is stored securely on Supabase (PostgreSQL), hosted on infrastructure protected by row-level security policies. Project photos are stored in Supabase Storage. All data is encrypted in transit using TLS. We take reasonable technical and organizational measures to protect your information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">SMS Communications</h2>
            <p className="leading-relaxed">By creating an account and providing your phone number, you consent to receive SMS notifications from TAGS related to your account activity (bids, project updates, alerts). Message and data rates may apply. You may opt out at any time by replying STOP to any TAGS message or by contacting us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2>
            <p className="leading-relaxed">You may request access to, correction of, or deletion of your personal information at any time by contacting us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h2>
            <p className="leading-relaxed">We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p className="leading-relaxed">Questions about this policy? Reach us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>.</p>
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
