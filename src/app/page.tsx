import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const admin = createAdminClient()
    const { data: profile } = await admin.from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile) redirect(`/dashboard/${profile.role}`)
  }

  return <LandingPage />
}

function LandingPage() {
  return (
    <div style={{ background: 'oklch(0.13 0.022 252)', color: 'oklch(0.96 0.008 252)' }} className="min-h-screen font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ background: 'oklch(0.13 0.022 252 / 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg tags-gradient flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">TAGS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
            style={{ color: 'oklch(0.65 0.02 252)' }}>
            Sign In
          </Link>
          <Link href="/register/pm"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'oklch(0.57 0.135 183)' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 md:px-12 pt-24 pb-28 max-w-6xl mx-auto">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, oklch(0.57 0.135 183), transparent 70%)' }} />
        </div>

        <div className="relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: 'oklch(0.20 0.05 183)', color: 'oklch(0.72 0.12 183)', border: '1px solid oklch(0.30 0.08 183)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'oklch(0.57 0.135 183)' }} />
            Now in beta for multifamily PMs
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-6">
            Stop chasing contractors.<br />
            <span style={{ color: 'oklch(0.57 0.135 183)' }}>Start managing repairs.</span>
          </h1>

          <p className="text-xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'oklch(0.65 0.02 252)' }}>
            Snap a photo. Describe the problem in plain English. TAGS generates a professional Scope of Work in seconds — then qualified contractors bid for the job.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register/pm"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-150 active:scale-[0.98] shadow-glow"
              style={{ background: 'oklch(0.57 0.135 183)' }}>
              Get Started Free
              <span>→</span>
            </Link>
            <Link href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium transition-colors duration-150"
              style={{ color: 'oklch(0.78 0.01 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
              See How It Works
            </Link>
          </div>

          <p className="mt-4 text-sm" style={{ color: 'oklch(0.45 0.015 252)' }}>
            Free for property managers. No subscription. No credit card.
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <div className="px-6 md:px-12 py-6" style={{ borderTop: '1px solid oklch(0.20 0.022 252)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
          {[
            { value: '< 60s', label: 'SOW generated' },
            { value: '0 fees', label: 'for property managers' },
            { value: 'AI-powered', label: 'by Claude' },
            { value: 'Vetted', label: 'contractor network' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm mt-0.5" style={{ color: 'oklch(0.50 0.02 252)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">From problem to bids in minutes</h2>
          <p className="text-lg" style={{ color: 'oklch(0.60 0.025 252)' }}>No RFP writing. No contractor hunting. No scope disputes.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: '📸',
              title: 'Describe the problem',
              body: 'Snap a photo of the issue. Add a plain-language description — "leaking pipe under unit 4B sink" is enough. You don\'t need construction knowledge.',
              color: 'oklch(0.20 0.05 230)',
              accent: 'oklch(0.62 0.14 230)',
            },
            {
              step: '02',
              icon: '📋',
              title: 'AI writes the SOW',
              body: 'Claude analyzes your photo and description and generates a professional, contractor-ready Scope of Work with materials, labor, safety requirements, and warranty language.',
              color: 'oklch(0.18 0.06 183)',
              accent: 'oklch(0.57 0.135 183)',
            },
            {
              step: '03',
              icon: '🏗',
              title: 'Contractors bid',
              body: 'Vetted contractors in your area receive the scoped project and submit competitive bids. You review, compare, and award — all in one place.',
              color: 'oklch(0.18 0.06 160)',
              accent: 'oklch(0.60 0.16 160)',
            },
          ].map(card => (
            <div key={card.step} className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
              <div className="absolute top-0 right-0 text-7xl font-black leading-none select-none opacity-[0.06] translate-x-2 -translate-y-2"
                style={{ color: card.accent }}>{card.step}</div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-5"
                style={{ background: card.color }}>
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.60 0.025 252)' }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOW SHOWCASE */}
      <section className="px-6 md:px-12 py-20" style={{ background: 'oklch(0.15 0.025 252)' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'oklch(0.57 0.135 183)' }}>
              The core product
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              A Scope of Work a contractor can act on immediately.
            </h2>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'oklch(0.60 0.025 252)' }}>
              Most repair requests fail because PMs can&apos;t write specs and contractors guess at scope. TAGS eliminates that gap — every project gets a professional construction document before a single bid is submitted.
            </p>
            <ul className="space-y-3">
              {[
                'No more scope disputes mid-project',
                'Apples-to-apples bid comparison',
                'Contractors know exactly what they\'re bidding on',
                'Reduces change orders and cost overruns',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'oklch(0.75 0.015 252)' }}>
                  <span className="mt-0.5 shrink-0 text-base" style={{ color: 'oklch(0.57 0.135 183)' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Fake SOW card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'oklch(0.13 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'oklch(0.57 0.135 183)' }} />
                <span className="text-xs font-semibold text-white">Generated Scope of Work</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.18 0.06 160)', color: 'oklch(0.70 0.13 160)' }}>
                ● Ready
              </span>
            </div>
            <div className="p-5 space-y-4 text-sm font-mono" style={{ color: 'oklch(0.72 0.015 252)' }}>
              <div>
                <p className="font-sans font-semibold text-white text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>## Project Overview</p>
                <p className="leading-relaxed" style={{ color: 'oklch(0.65 0.015 252)' }}>
                  Replace failed P-trap and supply lines under Unit 4B kitchen sink. Active leak causing cabinet moisture damage. Requires shutoff and drain access.
                </p>
              </div>
              <div>
                <p className="font-sans font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>## Scope of Work</p>
                <ol className="space-y-1 list-decimal list-inside" style={{ color: 'oklch(0.65 0.015 252)' }}>
                  <li>Shut off water supply to affected sink</li>
                  <li>Remove and inspect existing P-trap assembly</li>
                  <li>Replace P-trap, supply lines, and shutoff valves</li>
                  <li>Inspect cabinet subfloor for moisture damage</li>
                  <li>Pressure test and verify no active leaks</li>
                </ol>
              </div>
              <div>
                <p className="font-sans font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>## Materials Required</p>
                <ul className="space-y-0.5 list-disc list-inside" style={{ color: 'oklch(0.65 0.015 252)' }}>
                  <li>1.5&quot; PVC P-trap assembly</li>
                  <li>Braided stainless supply lines (2x)</li>
                  <li>1/4-turn shutoff valves (2x)</li>
                </ul>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
                </svg>
                Generated in 4.2s · Ready for contractor bids
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for how PMs actually work</h2>
          <p className="text-lg" style={{ color: 'oklch(0.60 0.025 252)' }}>
            You&apos;re on-site, on your phone, in the middle of five things. TAGS meets you there.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              before: 'Text 3 contractors, wait 3 days, get 2 responses, one ghosted',
              after: 'Post once. Matching contractors are notified automatically.',
              icon: '📲',
            },
            {
              before: 'Contractor shows up, says the scope is different, bills extra',
              after: 'AI-written SOW means everyone bids on the same defined scope.',
              icon: '📋',
            },
            {
              before: 'No idea if the price is fair — just pick the middle bid and hope',
              after: 'Side-by-side bid comparison with price, timeline, and notes.',
              icon: '⚖️',
            },
            {
              before: 'Maintenance log is a spreadsheet that only you can read',
              after: 'Every project, bid, and award is documented automatically.',
              icon: '📁',
            },
          ].map(item => (
            <div key={item.icon} className="rounded-2xl p-6 grid grid-cols-[auto_1fr] gap-4"
              style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: 'oklch(0.20 0.022 252)' }}>
                {item.icon}
              </div>
              <div className="space-y-2">
                <p className="text-sm line-through" style={{ color: 'oklch(0.45 0.015 252)' }}>{item.before}</p>
                <p className="text-sm font-medium" style={{ color: 'oklch(0.82 0.01 252)' }}>✓ {item.after}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 md:px-12 py-20" style={{ background: 'oklch(0.15 0.025 252)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'oklch(0.57 0.135 183)' }}>Pricing</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Free for property managers. Always.</h2>
          <p className="text-lg leading-relaxed mb-10" style={{ color: 'oklch(0.60 0.025 252)' }}>
            TAGS earns a small percentage only when a contractor gets paid for a completed project. If you don&apos;t save money, we don&apos;t make money. That&apos;s the deal.
          </p>

          <div className="rounded-2xl p-8 text-left mb-8" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.30 0.08 183)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-2xl font-bold text-white">Property Manager</p>
                <p className="text-sm mt-1" style={{ color: 'oklch(0.57 0.135 183)' }}>Free forever</p>
              </div>
              <div className="text-4xl font-black text-white">$0</div>
            </div>
            <ul className="space-y-3">
              {[
                'Unlimited projects',
                'AI-generated Scope of Work on every project',
                'Photo uploads and storage',
                'Competitive contractor bids',
                'SMS and email notifications',
                'Full project history',
              ].map(feat => (
                <li key={feat} className="flex items-center gap-3 text-sm" style={{ color: 'oklch(0.75 0.015 252)' }}>
                  <span style={{ color: 'oklch(0.57 0.135 183)' }}>✓</span> {feat}
                </li>
              ))}
            </ul>
          </div>

          <Link href="/register/pm"
            className="inline-flex items-center justify-center gap-2 w-full max-w-sm px-7 py-4 rounded-xl text-base font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'oklch(0.57 0.135 183)' }}>
            Create Your Free Account →
          </Link>
          <p className="text-sm mt-3" style={{ color: 'oklch(0.40 0.015 252)' }}>No credit card. No contract. Cancel anytime.</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-12 py-24 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          Your next repair project<br />
          <span style={{ color: 'oklch(0.57 0.135 183)' }}>takes 60 seconds to post.</span>
        </h2>
        <p className="text-lg mb-10" style={{ color: 'oklch(0.60 0.025 252)' }}>
          Join property managers who&apos;ve stopped guessing at scope and started getting competitive bids on professional projects.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register/pm"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'oklch(0.57 0.135 183)' }}>
            Get Started Free →
          </Link>
          <Link href="/register/contractor"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-medium transition-colors duration-150"
            style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
            Join as a Contractor
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 py-8" style={{ borderTop: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md tags-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: 'oklch(0.65 0.02 252)' }}>TAGS</span>
            <span className="text-sm" style={{ color: 'oklch(0.38 0.015 252)' }}>— The Apartment Guys System</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm transition-colors duration-150" style={{ color: 'oklch(0.45 0.015 252)' }}>Sign In</Link>
            <Link href="/register/pm" className="text-sm transition-colors duration-150" style={{ color: 'oklch(0.45 0.015 252)' }}>For PMs</Link>
            <Link href="/register/contractor" className="text-sm transition-colors duration-150" style={{ color: 'oklch(0.45 0.015 252)' }}>For Contractors</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
