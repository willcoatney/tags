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
    if (profile) {
      redirect(`/dashboard/${profile.role}`)
    }
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
          <img src="/tags-logo.jpg" alt="TAGS" className="h-10 max-w-[130px] object-contain rounded-md shrink-0" />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
            style={{ color: 'oklch(0.65 0.02 252)' }}>
            Sign In
          </Link>
          <Link href="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'oklch(0.57 0.135 183)' }}>
            Sign Up
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
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'oklch(0.57 0.135 183)' }} />
            AI-generated Scope of Work in 60 seconds
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-6">
            Professional Scope of Work —<br />
            <span style={{ color: 'oklch(0.57 0.135 183)' }}>in 60 seconds.</span>
          </h1>

          <p className="text-xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'oklch(0.65 0.02 252)' }}>
            Describe your repair. Upload a photo. Get a contractor-ready Scope of Work with materials, labor, and a cost estimate. For property managers and homeowners.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register/pm"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-150 active:scale-[0.98]"
              style={{ background: 'oklch(0.57 0.135 183)' }}>
              I&apos;m a Property Manager →
            </Link>
            <Link href="/register/homeowner"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium transition-colors duration-150"
              style={{ color: 'oklch(0.78 0.01 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
              I&apos;m a Homeowner →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-lg" style={{ color: 'oklch(0.60 0.025 252)' }}>Three steps from photo to professional document.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: '📸',
              title: 'Snap & describe',
              body: 'Upload a photo and describe the problem in plain English. "The bathroom faucet is leaking and rusting at the base." That\'s all you need.',
              accent: 'oklch(0.62 0.14 230)',
              bg: 'oklch(0.20 0.05 230)',
            },
            {
              step: '02',
              icon: '📋',
              title: 'SOW in 60 seconds',
              body: 'AI generates a professional Scope of Work — materials, labor requirements, safety notes, cleanup, and a cost estimate. Contractor-ready instantly.',
              accent: 'oklch(0.57 0.135 183)',
              bg: 'oklch(0.18 0.06 183)',
            },
            {
              step: '03',
              icon: '📤',
              title: 'Forward to your contractors',
              body: 'Download or print the SOW. Send it to any contractor you choose. Everyone bids on the same defined scope — no surprises, no scope creep.',
              accent: 'oklch(0.60 0.16 160)',
              bg: 'oklch(0.18 0.06 160)',
            },
          ].map(card => (
            <div key={card.step} className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
              <div className="absolute top-0 right-0 text-7xl font-black leading-none select-none opacity-[0.06] translate-x-2 -translate-y-2"
                style={{ color: card.accent }}>{card.step}</div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-5"
                style={{ background: card.bg }}>
                {card.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{card.title}</h3>
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
              The document that changes everything
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              A contractor-ready Scope of Work from your phone.
            </h2>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'oklch(0.60 0.025 252)' }}>
              Most repairs go sideways because nobody defined the scope upfront. TAGS generates a professional Scope of Work from your photos and description — before a single contractor sees the job.
            </p>
            <ul className="space-y-3">
              {[
                'Every contractor bids on the same locked scope — no surprises',
                'Apples-to-apples comparison across every quote you receive',
                'Built-in cost estimate so you know if a bid is reasonable',
                'No change orders. No mid-project scope creep.',
                'Every repair documented from day one',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'oklch(0.75 0.015 252)' }}>
                  <span className="mt-0.5 shrink-0 text-base" style={{ color: 'oklch(0.57 0.135 183)' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* SOW preview card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'oklch(0.13 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)', background: 'oklch(0.16 0.022 252)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'oklch(0.57 0.135 183)' }} />
                <span className="text-xs font-semibold text-white">Generated Scope of Work</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.18 0.06 160)', color: 'oklch(0.70 0.13 160)' }}>● Ready</span>
            </div>

            <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
              <div className="mb-3">
                <p className="text-sm font-bold text-white leading-tight">Bathtub Replacement</p>
                <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>Plumbing · 2 photos attached</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-xl overflow-hidden aspect-[4/3]" style={{ border: '1px solid oklch(0.27 0.022 252)' }}>
                  <img src="/demo-bathtub-1.jpg" alt="Bathtub — overhead view showing rusted drain" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden aspect-[4/3]" style={{ border: '1px solid oklch(0.27 0.022 252)' }}>
                  <img src="/demo-bathtub-2.jpg" alt="Bathtub — side view showing rust and deterioration" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="rounded-lg px-3 py-2 text-xs italic" style={{ background: 'oklch(0.17 0.022 252)', color: 'oklch(0.62 0.02 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
                &ldquo;I need to remove and replace this bathtub. The bottom is completely rusted out around the drain.&rdquo;
              </div>
            </div>

            <div className="p-5 space-y-4 text-sm" style={{ color: 'oklch(0.72 0.015 252)' }}>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>Project Overview</p>
                <p className="leading-relaxed text-sm" style={{ color: 'oklch(0.65 0.015 252)' }}>Remove and replace existing 60&quot; alcove bathtub. Existing tub has aging finish and failing drain assembly. Replacement tub to be installed in same location with new drain, overflow, and supply connections.</p>
              </div>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>Scope of Work</p>
                <ol className="space-y-1.5 list-decimal list-inside text-sm" style={{ color: 'oklch(0.65 0.015 252)' }}>
                  <li>Shut off water supply; confirm no active flow</li>
                  <li>Remove tub surround panels to expose wall flanges</li>
                  <li>Disconnect drain assembly, overflow, and supply lines</li>
                  <li>Remove existing tub; inspect subfloor for moisture damage</li>
                  <li>Set and secure new 60&quot; alcove tub per manufacturer specs</li>
                  <li>Reconnect drain assembly and supply connections</li>
                  <li>Reinstall surround; caulk all seams</li>
                </ol>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.30 0.08 145)' }}>
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide" style={{ background: 'oklch(0.20 0.07 145)', color: 'oklch(0.75 0.15 145)' }}>Estimated Project Cost</div>
                <table className="w-full text-sm">
                  <tbody>
                    {[['Materials', '$850'], ['Labor', '$1,200'], ['TOTAL', '$2,050']].map(([label, val], i) => (
                      <tr key={label} style={{ background: i === 2 ? 'oklch(0.20 0.07 145)' : i % 2 === 0 ? 'oklch(0.15 0.04 145)' : 'oklch(0.16 0.04 145)', borderTop: i === 2 ? '1px solid oklch(0.30 0.08 145)' : undefined }}>
                        <td className={`px-4 py-2 text-xs ${i === 2 ? 'font-bold' : ''}`} style={{ color: i === 2 ? 'oklch(0.90 0.12 145)' : 'oklch(0.75 0.02 252)' }}>{label}</td>
                        <td className={`px-4 py-2 text-xs ${i === 2 ? 'font-bold' : ''} text-right`} style={{ color: i === 2 ? 'oklch(0.90 0.12 145)' : 'white' }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                Generated in 3.8s · Ready to forward to contractors
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything in one document</h2>
          <p className="text-lg" style={{ color: 'oklch(0.60 0.025 252)' }}>
            Every TAGS SOW covers all seven sections a licensed contractor needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: '📋',
              title: 'Project Overview',
              body: 'Professional summary of the repair — what\'s wrong, what needs to happen, and the scope in plain language.',
            },
            {
              icon: '🔨',
              title: 'Scope of Work',
              body: 'Numbered task list in the correct trade sequence. Specific, technical, and actionable from day one.',
              highlight: true,
            },
            {
              icon: '🛒',
              title: 'Materials Required',
              body: 'Itemized materials list with quantities and estimated unit costs. No more contractor guesswork on what to bring.',
            },
            {
              icon: '👷',
              title: 'Labor Requirements',
              body: 'Trade skills required, estimated crew size, and hours. So you know if the bid is reasonable before accepting.',
            },
            {
              icon: '💰',
              title: 'Cost Estimate',
              body: 'Ballpark materials + labor total so you can sanity-check every quote you receive. Know before you agree.',
              highlight: true,
            },
            {
              icon: '🧹',
              title: 'Cleanup & Warranty',
              body: 'Site restoration expectations and standard warranty language — built in, every time, no negotiation needed.',
            },
          ].map(feat => (
            <div key={feat.title}
              className="rounded-2xl p-6"
              style={{
                background: feat.highlight ? 'oklch(0.18 0.06 183)' : 'oklch(0.17 0.022 252)',
                border: `1px solid ${feat.highlight ? 'oklch(0.35 0.10 183)' : 'oklch(0.22 0.022 252)'}`,
              }}>
              <div className="text-2xl mb-4">{feat.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.60 0.025 252)' }}>{feat.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 md:px-12 py-20" style={{ background: 'oklch(0.15 0.025 252)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'oklch(0.57 0.135 183)' }}>Pricing</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple. No surprises.</h2>
            <p className="text-lg" style={{ color: 'oklch(0.60 0.025 252)' }}>
              Property managers pay one flat rate. Homeowners pay per SOW.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* PM Card */}
            <div className="rounded-2xl p-8" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.30 0.08 183)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xl font-bold text-white">Property Manager</p>
                  <p className="text-sm mt-1" style={{ color: 'oklch(0.57 0.135 183)' }}>Per community</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white">$50</div>
                  <div className="text-xs" style={{ color: 'oklch(0.55 0.02 252)' }}>per month</div>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited SOWs — no per-use fees',
                  'AI-generated in under 60 seconds',
                  'Full 7-section professional format',
                  'Materials, labor, and cost estimate included',
                  'Print or export any SOW',
                  'Full project history',
                ].map(feat => (
                  <li key={feat} className="flex items-center gap-3 text-sm" style={{ color: 'oklch(0.75 0.015 252)' }}>
                    <span style={{ color: 'oklch(0.57 0.135 183)' }}>✓</span> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/register/pm"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'oklch(0.57 0.135 183)' }}>
                Start for $50/month →
              </Link>
            </div>

            {/* Homeowner Card */}
            <div className="rounded-2xl p-8" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xl font-bold text-white">Homeowner</p>
                  <p className="text-sm mt-1" style={{ color: 'oklch(0.60 0.025 252)' }}>Pay as you go</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white">$20</div>
                  <div className="text-xs" style={{ color: 'oklch(0.55 0.02 252)' }}>per SOW</div>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'No subscription required',
                  'Pay only when you need a SOW',
                  'Same professional AI-generated format',
                  'Materials, labor, and cost estimate',
                  'Print or export instantly',
                  'Forward to any contractor you choose',
                ].map(feat => (
                  <li key={feat} className="flex items-center gap-3 text-sm" style={{ color: 'oklch(0.75 0.015 252)' }}>
                    <span style={{ color: 'oklch(0.57 0.135 183)' }}>✓</span> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/register/homeowner"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ border: '1px solid oklch(0.35 0.025 252)', color: 'oklch(0.75 0.015 252)' }}>
                Get a SOW for $20 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 py-24 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'oklch(0.57 0.135 183)' }}>FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Questions we hear most</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              q: 'How does TAGS generate a Scope of Work?',
              a: 'You describe the problem in plain English and upload up to 5 photos. TAGS\'s AI analyzes your submission and returns a professional, contractor-ready Scope of Work in under 60 seconds — covering project overview, numbered tasks, materials, labor, safety, cleanup, and warranty expectations.',
            },
            {
              q: 'Can I forward the SOW to any contractor?',
              a: 'Yes. TAGS gives you the document — who you share it with is entirely your choice. Print it, email it, text it. Your contractors bid on a clearly defined scope, which means fewer surprises and cleaner quotes.',
            },
            {
              q: 'What if I\'m a property manager with many units?',
              a: 'The $50/month PM plan gives you unlimited SOWs for your community. No per-use fees — post as many projects as you need, track them by unit, and generate a new SOW whenever a repair comes in.',
            },
            {
              q: 'How accurate is the cost estimate?',
              a: 'The estimate is a ballpark based on 2025 US national average trade rates and contractor-grade material pricing. It\'s designed for sanity-checking contractor quotes — not as a binding number. Final pricing is always set by the contractor you hire.',
            },
            {
              q: 'Is my project data secure?',
              a: 'Yes. All data is stored with row-level security — each user can only access their own data. Photos are stored in encrypted cloud storage. We never sell your data.',
            },
            {
              q: 'Can I use TAGS on my phone?',
              a: 'Yes — TAGS is fully mobile-responsive. Upload photos from your camera roll, describe the issue, and get a SOW — all from your phone browser. No app download required.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-2xl p-6" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
              <h3 className="text-base font-semibold text-white mb-2">{q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.60 0.025 252)' }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-12 py-24 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          A professional Scope of Work<br />
          <span style={{ color: 'oklch(0.57 0.135 183)' }}>in 60 seconds.</span>
        </h2>
        <p className="text-lg mb-10" style={{ color: 'oklch(0.60 0.025 252)' }}>
          Stop guessing what a repair should cost. Stop arguing scope with contractors. Get a professional document and go in informed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register/pm"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'oklch(0.57 0.135 183)' }}>
            Property Manager — $50/mo →
          </Link>
          <Link href="/register/homeowner"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-medium transition-colors duration-150"
            style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
            Homeowner — $20/SOW →
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
            <Link href="/login" className="text-sm transition-colors duration-150" style={{ color: 'oklch(0.45 0.015 252)' }}>Sign In</Link>
            <Link href="/register/pm" className="text-sm transition-colors duration-150" style={{ color: 'oklch(0.45 0.015 252)' }}>For Property Managers</Link>
            <Link href="/register/homeowner" className="text-sm transition-colors duration-150" style={{ color: 'oklch(0.45 0.015 252)' }}>For Homeowners</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid oklch(0.17 0.022 252)' }}>
          <p className="text-xs" style={{ color: 'oklch(0.32 0.015 252)' }}>
            © {new Date().getFullYear()} TAGS — The Apartment Guys System. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="mailto:hello@tagyourproject.com" className="text-xs transition-colors" style={{ color: 'oklch(0.45 0.015 252)' }}>hello@tagyourproject.com</a>
            <Link href="/legal" className="text-xs transition-colors" style={{ color: 'oklch(0.45 0.015 252)' }}>Legal</Link>
            <Link href="/privacy" className="text-xs transition-colors" style={{ color: 'oklch(0.45 0.015 252)' }}>Privacy</Link>
            <Link href="/terms" className="text-xs transition-colors" style={{ color: 'oklch(0.45 0.015 252)' }}>Terms</Link>
            <Link href="/accessibility" className="text-xs transition-colors" style={{ color: 'oklch(0.45 0.015 252)' }}>Accessibility</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
