import Link from 'next/link'

export default function ForContractorsPage() {
  return (
    <div style={{ background: 'oklch(0.13 0.022 252)', color: 'oklch(0.96 0.008 252)' }} className="min-h-screen font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ background: 'oklch(0.13 0.022 252 / 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <Link href="/" className="flex items-center gap-2">
          <img src="/tags-logo.jpg" alt="TAGS" className="h-10 max-w-[130px] object-contain rounded-md shrink-0" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: 'oklch(0.65 0.02 252)' }}>Sign In</Link>
          <Link href="/register/contractor"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'oklch(0.57 0.135 183)' }}>
            Apply as Contractor
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 md:px-12 pt-24 pb-28 max-w-6xl mx-auto">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, oklch(0.57 0.135 183), transparent 70%)' }} />
        </div>
        <div className="relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: 'oklch(0.20 0.05 183)', color: 'oklch(0.72 0.12 183)', border: '1px solid oklch(0.30 0.08 183)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.57 0.135 183)' }} />
            For licensed contractors
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-6">
            Stop chasing leads.<br />
            <span style={{ color: 'oklch(0.57 0.135 183)' }}>Start winning scoped jobs.</span>
          </h1>
          <p className="text-xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'oklch(0.65 0.02 252)' }}>
            Every project on TAGS comes with a professionally generated Scope of Work. You know exactly what you&apos;re bidding on before you submit a number. No surprises. No scope disputes. Just qualified work.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register/contractor"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white"
              style={{ background: 'oklch(0.57 0.135 183)' }}>
              Apply to Join →
            </Link>
            <Link href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium"
              style={{ color: 'oklch(0.78 0.01 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
              See How It Works
            </Link>
          </div>
          <p className="mt-4 text-sm" style={{ color: 'oklch(0.45 0.015 252)' }}>$100/year membership + 1.5% of each awarded bid.</p>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="px-6 md:px-12 py-6" style={{ borderTop: '1px solid oklch(0.20 0.022 252)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
          {[
            { value: 'SOW', label: 'on every job — no vague requests' },
            { value: '$100', label: 'flat annual membership' },
            { value: '1.5%', label: 'of each awarded bid' },
            { value: '2-way SMS', label: 'no app required' },
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works for contractors</h2>
          <p className="text-lg" style={{ color: 'oklch(0.60 0.025 252)' }}>From application to payment — the full flow.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: '01', icon: '📋', title: 'Apply & get approved', body: 'Submit your license, insurance, and service areas. TAGS reviews and approves — usually within 24 hours.', accent: 'oklch(0.62 0.14 230)', bg: 'oklch(0.20 0.05 230)' },
            { step: '02', icon: '📱', title: 'Get notified of matching jobs', body: 'When a PM posts a project matching your trades and zip code, you get a text with a link. View the full SOW before you decide to bid.', accent: 'oklch(0.57 0.135 183)', bg: 'oklch(0.18 0.06 183)' },
            { step: '03', icon: '⚖️', title: 'Submit your bid', body: "Bid on a clearly defined scope — not a vague description. Enter your price and timeline with full confidence.", accent: 'oklch(0.72 0.14 75)', bg: 'oklch(0.20 0.06 75)' },
            { step: '04', icon: '💰', title: 'Win and get paid', body: "PM awards the job, you get a text. Work directly with the PM through the platform. TAGS charges 1.5% of the awarded bid amount — that's it.", accent: 'oklch(0.60 0.16 160)', bg: 'oklch(0.18 0.06 160)' },
          ].map(card => (
            <div key={card.step} className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
              <div className="absolute top-0 right-0 text-7xl font-black leading-none select-none opacity-[0.06] translate-x-2 -translate-y-2"
                style={{ color: card.accent }}>{card.step}</div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-5" style={{ background: card.bg }}>{card.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.60 0.025 252)' }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOW ADVANTAGE */}
      <section className="px-6 md:px-12 py-20" style={{ background: 'oklch(0.15 0.025 252)' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'oklch(0.57 0.135 183)' }}>The core advantage</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">You&apos;ll never bid blind again.</h2>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'oklch(0.60 0.025 252)' }}>
              Most contractor leads are a phone number and a vague description. TAGS gives you a professional construction document — scope, materials, safety requirements, estimated cost — before you submit a single number. Your bids are accurate, your margins are protected, and scope disputes don&apos;t happen.
            </p>
            <ul className="space-y-3">
              {[
                'Full scope before you bid — no surprises on-site',
                'Accurate material and labor estimates built in',
                'Everyone bids on the same defined document',
                'Bid with confidence, price with accuracy',
                'TAGS handles communication and job tracking',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'oklch(0.75 0.015 252)' }}>
                  <span className="mt-0.5 shrink-0" style={{ color: 'oklch(0.57 0.135 183)' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'oklch(0.13 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'oklch(0.57 0.135 183)' }} />
                <span className="text-xs font-semibold text-white">Generated Scope of Work</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.18 0.06 160)', color: 'oklch(0.70 0.13 160)' }}>● Ready</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>Project Overview</p>
                <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.65 0.015 252)' }}>Replace failed P-trap and supply lines — Unit 4B kitchen sink. Active leak causing cabinet moisture damage.</p>
              </div>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>Scope of Work</p>
                <ol className="space-y-1 list-decimal list-inside text-sm" style={{ color: 'oklch(0.65 0.015 252)' }}>
                  <li>Shut off water supply to affected sink</li>
                  <li>Remove and replace P-trap assembly</li>
                  <li>Replace supply lines and shutoff valves</li>
                  <li>Inspect subfloor for moisture damage</li>
                  <li>Pressure test and verify no active leaks</li>
                </ol>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.30 0.08 145)' }}>
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide" style={{ background: 'oklch(0.20 0.07 145)', color: 'oklch(0.75 0.15 145)' }}>Total Cost Summary</div>
                <table className="w-full">
                  <tbody>
                    {[['Materials', '$180'], ['Labor', '$320'], ['TOTAL', '$500']].map(([label, val], i) => (
                      <tr key={label} style={{ background: i === 2 ? 'oklch(0.20 0.07 145)' : i % 2 === 0 ? 'oklch(0.15 0.04 145)' : 'oklch(0.16 0.04 145)', borderTop: i === 2 ? '1px solid oklch(0.30 0.08 145)' : undefined }}>
                        <td className={`px-4 py-2 text-xs ${i === 2 ? 'font-bold' : ''}`} style={{ color: i === 2 ? 'oklch(0.90 0.12 145)' : 'oklch(0.75 0.02 252)' }}>{label}</td>
                        <td className={`px-4 py-2 text-xs text-right ${i === 2 ? 'font-bold' : ''}`} style={{ color: i === 2 ? 'oklch(0.90 0.12 145)' : 'white' }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'oklch(0.57 0.135 183)' }}>Pricing</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Simple pricing. No surprises.</h2>
          <p className="text-lg leading-relaxed mb-10" style={{ color: 'oklch(0.60 0.025 252)' }}>
            A flat annual membership gets you in the door. Then TAGS takes 1.5% of each job you win — nothing more. No per-bid fees, no monthly charges.
          </p>
          <div className="rounded-2xl p-8 text-left mb-6" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.30 0.08 183)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-white">Contractor</p>
                <p className="text-sm mt-1" style={{ color: 'oklch(0.57 0.135 183)' }}>Annual membership</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-white">$100</div>
                <div className="text-xs mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>per year</div>
              </div>
            </div>
            <div className="rounded-xl p-4 mb-6" style={{ background: 'oklch(0.20 0.05 183)', border: '1px solid oklch(0.30 0.08 183)' }}>
              <p className="text-sm" style={{ color: 'oklch(0.75 0.10 183)' }}>
                + <strong className="text-white">1.5%</strong> of each awarded bid &mdash; paid only when you win
              </p>
              <p className="text-xs mt-1" style={{ color: 'oklch(0.55 0.10 183)' }}>
                Example: win a $5,000 job → TAGS fee is $75
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Free to apply and get approved',
                'Unlimited bids on open projects',
                'Full Scope of Work access on every project',
                'SMS notifications for matching projects',
                'Two-way messaging with property managers',
                'Job history and completion records',
                '1.5% fee only charged when you win a bid',
              ].map(feat => (
                <li key={feat} className="flex items-center gap-3 text-sm" style={{ color: 'oklch(0.75 0.015 252)' }}>
                  <span style={{ color: 'oklch(0.57 0.135 183)' }}>✓</span> {feat}
                </li>
              ))}
            </ul>
            <Link href="/register/contractor"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-xl text-base font-semibold text-white"
              style={{ background: 'oklch(0.57 0.135 183)' }}>
              Apply to Join TAGS →
            </Link>
          </div>
          <p className="text-sm" style={{ color: 'oklch(0.40 0.015 252)' }}>Annual membership billed via Stripe. 1.5% fee charged automatically when a bid is awarded to you.</p>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="px-6 md:px-12 py-20" style={{ background: 'oklch(0.15 0.025 252)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for how contractors actually work</h2>
            <p className="text-lg" style={{ color: 'oklch(0.60 0.025 252)' }}>Stop wasting time on bad leads and unclear jobs.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { before: 'Drive to a site just to give a number on a job nobody scoped', after: "Read the full Scope of Work before you bid. Know exactly what you're walking into.", icon: '🚗' },
              { before: 'Win a job then find out the scope is twice what they described', after: 'SOW is locked before bids open. No scope creep, no mid-project surprises.', icon: '📋' },
              { before: 'Chase payments and play phone tag with property managers', after: 'Two-way SMS keeps communication on the record. No chasing.', icon: '📞' },
              { before: 'Cold calling and marketing to find multifamily work', after: 'Qualified leads delivered by text when they match your trade and area.', icon: '📲' },
            ].map(item => (
              <div key={item.icon} className="rounded-2xl p-6 grid grid-cols-[auto_1fr] gap-4"
                style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'oklch(0.20 0.022 252)' }}>{item.icon}</div>
                <div className="space-y-2">
                  <p className="text-sm line-through" style={{ color: 'oklch(0.45 0.015 252)' }}>{item.before}</p>
                  <p className="text-sm font-medium" style={{ color: 'oklch(0.82 0.01 252)' }}>✓ {item.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-12 py-24 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          Your next job is<br />
          <span style={{ color: 'oklch(0.57 0.135 183)' }}>already posted.</span>
        </h2>
        <p className="text-lg mb-10" style={{ color: 'oklch(0.60 0.025 252)' }}>
          Property managers in your area are posting scoped projects right now. Apply today and start winning qualified work.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register/contractor"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white"
            style={{ background: 'oklch(0.57 0.135 183)' }}>
            Apply to Join TAGS →
          </Link>
          <Link href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-medium"
            style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
            I&apos;m a Property Manager
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 py-8" style={{ borderTop: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/tags-logo.jpg" alt="TAGS" className="h-7 max-w-[90px] object-contain rounded-sm" />
            <span className="text-sm" style={{ color: 'oklch(0.38 0.015 252)' }}>— The Apartment Guys System</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm" style={{ color: 'oklch(0.45 0.015 252)' }}>Sign In</Link>
            <Link href="/" className="text-sm" style={{ color: 'oklch(0.45 0.015 252)' }}>For PMs</Link>
            <Link href="/for-contractors" className="text-sm" style={{ color: 'oklch(0.45 0.015 252)' }}>For Contractors</Link>
            <Link href="/register/contractor" className="text-sm" style={{ color: 'oklch(0.45 0.015 252)' }}>Apply Now</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid oklch(0.17 0.022 252)' }}>
          <p className="text-xs" style={{ color: 'oklch(0.32 0.015 252)' }}>
            © {new Date().getFullYear()} TAGS — The Apartment Guys System. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="mailto:hello@tagyourproject.com" className="text-xs transition-colors" style={{ color: 'oklch(0.45 0.015 252)' }}>hello@tagyourproject.com</a>
            <Link href="/privacy" className="text-xs transition-colors" style={{ color: 'oklch(0.45 0.015 252)' }}>Privacy Policy</Link>
            <Link href="/terms" className="text-xs transition-colors" style={{ color: 'oklch(0.45 0.015 252)' }}>Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
