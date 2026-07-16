import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import WistiaPlayer from '@/components/WistiaPlayer'

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
      const roleToPath: Record<string, string> = {
        asset_manager: 'asset-manager',
      }
      const path = roleToPath[profile.role] ?? profile.role
      redirect(`/dashboard/${path}`)
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
            Built for multifamily property managers
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-6">
            Every repair starts with a Scope of Work.<br />
            <span style={{ color: 'oklch(0.57 0.135 183)' }}>Yours is ready in seconds.</span>
          </h1>

          <p className="text-xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'oklch(0.65 0.02 252)' }}>
            Describe the problem in plain English. TAGS generates a professional Scope of Work using proprietary software, gets you competitive bids, and keeps the whole job — including contractor communication — in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-150 active:scale-[0.98] shadow-glow"
              style={{ background: 'oklch(0.57 0.135 183)' }}>
              Start Tagging
              <span>→</span>
            </Link>
            <Link href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium transition-colors duration-150"
              style={{ color: 'oklch(0.78 0.01 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
              See How It Works
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'oklch(0.22 0.08 75)', color: 'oklch(0.85 0.16 75)', border: '1px solid oklch(0.38 0.14 75)' }}>
              🔒 Invite-only beta
            </span>
            <span className="text-sm" style={{ color: 'oklch(0.45 0.015 252)' }}>$50/community · temporary beta pricing</span>
          </div>
        </div>
      </section>

      {/* VIDEO DEMO */}
      <section className="px-6 md:px-12 pb-20 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'oklch(0.57 0.135 183)' }}>
            See it in action
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">
            From photo to Scope of Work in under 60 seconds.
          </h2>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid oklch(0.22 0.022 252)' }}>
          <WistiaPlayer />
        </div>
      </section>

      {/* STATS BAR */}
      <div className="px-6 md:px-12 py-6" style={{ borderTop: '1px solid oklch(0.20 0.022 252)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
          {[
            { value: '< 60s', label: 'SOW generated' },
            { value: '$0', label: 'for property managers' },
            { value: '8', label: 'automated alerts per job' },
            { value: '$50', label: 'per community (beta)' },
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">From problem to completed job</h2>
          <p className="text-lg" style={{ color: 'oklch(0.60 0.025 252)' }}>Every step of the repair workflow — in one tool.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              icon: '📸',
              title: 'Snap & describe',
              body: 'Photo + plain English description. "Leaking pipe, unit 4B." That\'s all you need.',
              accent: 'oklch(0.62 0.14 230)',
              bg: 'oklch(0.20 0.05 230)',
            },
            {
              step: '02',
              icon: '📋',
              title: 'SOW generated instantly',
              body: 'Our proprietary software generates a contractor-ready Scope of Work with materials, labor, safety, and a cost estimate.',
              accent: 'oklch(0.57 0.135 183)',
              bg: 'oklch(0.18 0.06 183)',
            },
            {
              step: '03',
              icon: '⚖️',
              title: 'Compare bids',
              body: 'Vetted contractors bid. Review them side-by-side with price, timeline, and their past ratings.',
              accent: 'oklch(0.72 0.14 75)',
              bg: 'oklch(0.20 0.06 75)',
            },
            {
              step: '04',
              icon: '✓',
              title: 'Award & complete',
              body: 'Award the job. Message the contractor directly. Mark complete and rate when it\'s done.',
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
                'High-end cost estimate so you know if a bid is reasonable',
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

          {/* SOW preview card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'oklch(0.13 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'oklch(0.57 0.135 183)' }} />
                <span className="text-xs font-semibold text-white">Generated Scope of Work</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.18 0.06 160)', color: 'oklch(0.70 0.13 160)' }}>● Ready</span>
            </div>
            <div className="p-5 space-y-4 text-sm" style={{ color: 'oklch(0.72 0.015 252)' }}>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>Project Overview</p>
                <p className="leading-relaxed text-sm" style={{ color: 'oklch(0.65 0.015 252)' }}>Replace failed P-trap and supply lines — Unit 4B kitchen sink. Active leak causing cabinet moisture damage.</p>
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
                <table className="w-full text-sm">
                  <tbody>
                    {[['Materials', '$180'], ['Labor', '$320'], ['TOTAL', '$500']].map(([label, val], i) => (
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
                Generated in 4.2s · Ready for contractor bids
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to run repairs</h2>
          <p className="text-lg" style={{ color: 'oklch(0.60 0.025 252)' }}>
            Not just a bid board. A complete repair management system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: '💬',
              title: 'Two-way SMS with contractors',
              body: 'Message contractors directly from your dashboard. They reply by text — no app required. Every message syncs to the project thread automatically.',
              accent: 'oklch(0.57 0.135 183)',
              highlight: true,
            },
            {
              icon: '📱',
              title: 'Mobile-first photo uploads',
              body: 'Take photos directly from your phone camera or upload from your library. TAGS is built for PMs on the move, not desk workers.',
              accent: 'oklch(0.62 0.14 230)',
            },
            {
              icon: '🏢',
              title: 'Unit-level tracking',
              body: 'Tag every project with a unit number. "Unit 4B — Plumbing" lives in the right place in your records, not buried in a generic list.',
              accent: 'oklch(0.72 0.14 75)',
            },
            {
              icon: '⚖️',
              title: 'Side-by-side bid comparison',
              body: 'When multiple bids come in, compare them in a table — price, timeline, contractor rating. Pick the right contractor, not just the cheapest.',
              accent: 'oklch(0.60 0.16 160)',
            },
            {
              icon: '⭐',
              title: 'Contractor ratings',
              body: 'Rate contractors after every completed job. Ratings show on future bids so you know who shows up, who does quality work, and who to avoid.',
              accent: 'oklch(0.80 0.18 75)',
            },
            {
              icon: '📊',
              title: 'Portfolio analytics',
              body: 'See open projects, total bids received, average bids per project, and completed jobs at a glance. Know the health of your maintenance backlog.',
              accent: 'oklch(0.62 0.14 230)',
            },
            {
              icon: '✏️',
              title: 'Edit & regenerate SOW',
              body: 'Scope changed? Edit the project description, add more photos, and regenerate the SOW. The new version is ready for bids in seconds.',
              accent: 'oklch(0.57 0.135 183)',
            },
            {
              icon: '🔔',
              title: 'You\'re always in the loop',
              body: 'New bid? Text. Contractor marked work done? Text. 48 hours with no bids? Text. Every stage of every job triggers an automatic alert — no logging in just to check.',
              accent: 'oklch(0.60 0.16 160)',
              highlight: true,
            },
            {
              icon: '✓',
              title: 'Completion & close-out',
              body: 'Mark projects complete, rate the contractor, and keep a permanent record of every job — bids, SOW, contractor, cost, and completion date.',
              accent: 'oklch(0.60 0.16 160)',
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

      {/* VISIBILITY SECTION */}
      <section className="px-6 md:px-12 py-20" style={{ background: 'oklch(0.15 0.025 252)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'oklch(0.57 0.135 183)' }}>
              Always informed
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Never wonder where a job stands.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'oklch(0.60 0.025 252)' }}>
              TAGS texts you at every milestone — from first bid to confirmed complete. No logging in just to check.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Left: notification feed */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'oklch(0.13 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
              <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)', background: 'oklch(0.16 0.022 252)' }}>
                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'oklch(0.57 0.135 183)' }} />
                <span className="text-xs font-semibold text-white">TAGS Alerts — Unit 4B Plumbing</span>
              </div>
              <div className="p-4 space-y-2">
                {([
                  { icon: '📬', time: 'Day 0', label: 'Project posted', msg: '3 contractors notified in your area', color: 'oklch(0.57 0.135 183)' },
                  { icon: '💰', time: 'Day 1', label: 'Bid received', msg: 'New bid: ABC Plumbing — $485 / 3 days', color: 'oklch(0.72 0.14 75)' },
                  { icon: '💰', time: 'Day 1', label: 'Bid received', msg: 'New bid: ProFix Services — $520 / 2 days', color: 'oklch(0.72 0.14 75)' },
                  { icon: '🏆', time: 'Day 2', label: 'Bid awarded', msg: 'ABC Plumbing awarded — they\'ve been notified', color: 'oklch(0.57 0.135 183)' },
                  { icon: '🔨', time: 'Day 5', label: 'Work complete', msg: 'ABC Plumbing marked work done — tap to confirm', color: 'oklch(0.80 0.16 160)' },
                  { icon: '✅', time: 'Day 5', label: 'Job confirmed', msg: 'Unit 4B plumbing complete. Record saved.', color: 'oklch(0.65 0.15 145)' },
                ] as Array<{ icon: string; time: string; label: string; msg: string; color: string }>).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-2.5" style={{ background: 'oklch(0.17 0.022 252)' }}>
                    <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</span>
                        <span className="text-xs shrink-0" style={{ color: 'oklch(0.40 0.015 252)' }}>{item.time}</span>
                      </div>
                      <p className="text-xs leading-snug" style={{ color: 'oklch(0.65 0.015 252)' }}>{item.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: alert list */}
            <div className="space-y-4">
              <p className="text-sm font-semibold" style={{ color: 'oklch(0.65 0.02 252)' }}>Every alert that fires automatically:</p>
              {([
                { icon: '📬', title: 'Project goes live', body: 'Every matching contractor in your zip code is notified instantly by text.' },
                { icon: '💰', title: 'New bid received', body: 'You get a text with the contractor\'s name and a direct link to review the bid.' },
                { icon: '⏰', title: '48 hours, no bids', body: 'If no one has bid after 48 hours, you get a heads-up. You\'re never left wondering.' },
                { icon: '🏆', title: 'Bid awarded', body: 'Winning contractor is notified by text. Losing contractors are told the job was filled.' },
                { icon: '🔨', title: 'Contractor marks work done', body: 'You get a text with a link to log in and confirm — one tap to officially close the job.' },
                { icon: '✅', title: 'Job confirmed complete', body: 'Contractor gets a confirmation text. Permanent record is created automatically.' },
              ] as Array<{ icon: string; title: string; body: string }>).map((item, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl p-4" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{item.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.58 0.02 252)' }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SMS BRIDGE CALLOUT */}
      <section className="px-6 md:px-12 py-20" style={{ background: 'oklch(0.15 0.025 252)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 md:p-12" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.35 0.10 183)' }}>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'oklch(0.57 0.135 183)' }}>
                  Built for the real world
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">
                  Contractors don&apos;t log into apps.<br />Now they don&apos;t have to.
                </h2>
                <p className="text-base leading-relaxed mb-6" style={{ color: 'oklch(0.60 0.025 252)' }}>
                  Every message you send from the TAGS dashboard arrives as a text on the contractor&apos;s phone. When they reply by text, it shows up in your dashboard. The whole conversation is in one place — whether they use the app or not.
                </p>
                <ul className="space-y-2">
                  {[
                    'PM sends message → contractor gets a text',
                    'Contractor replies by text → PM sees it in the dashboard',
                    'Full conversation history, no gaps',
                    'No app download required for contractors',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'oklch(0.75 0.015 252)' }}>
                      <span className="shrink-0" style={{ color: 'oklch(0.57 0.135 183)' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chat mockup */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'oklch(0.14 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)', background: 'oklch(0.16 0.022 252)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.57 0.135 183)' }} />
                  <span className="text-xs font-semibold text-white">Unit 4B — Plumbing Repair</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { msg: 'Can you confirm you have access to the unit on Thursday?', me: true, tag: null },
                    { msg: 'Yes, I\'ll be there at 9am. Do I need to check in at the office?', me: false, tag: 'SMS' },
                    { msg: 'Yes, ask for Maria at the front desk. She\'ll have the key.', me: true, tag: null },
                    { msg: 'Got it. See you Thursday.', me: false, tag: 'SMS' },
                  ].map((m, i) => (
                    <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%]">
                        <div className="rounded-2xl px-4 py-2.5 text-xs leading-relaxed"
                          style={{
                            background: m.me ? 'oklch(0.57 0.135 183)' : 'oklch(0.20 0.022 252)',
                            color: m.me ? 'white' : 'oklch(0.82 0.01 252)',
                            borderRadius: m.me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          }}>
                          {m.msg}
                        </div>
                        {m.tag && (
                          <div className={`text-xs mt-1 flex items-center gap-1.5 ${m.me ? 'justify-end' : 'justify-start'}`}>
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: 'oklch(0.22 0.022 252)', color: 'oklch(0.50 0.02 252)' }}>SMS</span>
                            <span style={{ color: 'oklch(0.40 0.015 252)' }}>replied by text</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
            On-site, on your phone, in the middle of five things. TAGS meets you there.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              before: 'Text 3 contractors, wait 3 days, get 2 responses, one ghosted',
              after: 'Post once. Qualified contractors are notified and submit bids automatically.',
              icon: '📲',
            },
            {
              before: 'Contractor shows up, says the scope is different, bills extra',
              after: 'AI-written SOW means everyone bids on the same defined scope. No surprises.',
              icon: '📋',
            },
            {
              before: 'No idea if the price is fair — just pick the middle bid and hope',
              after: 'Side-by-side bid comparison with ratings. Pick the right contractor, not just the cheapest.',
              icon: '⚖️',
            },
            {
              before: 'Contractor never responds — you have no idea if they got your message',
              after: 'Two-way SMS means contractors reply by text. You see it instantly in the dashboard.',
              icon: '💬',
            },
            {
              before: 'No record of what was done, who did it, or what it cost',
              after: 'Every job is documented automatically — SOW, bids, contractor, cost, completion.',
              icon: '📁',
            },
            {
              before: 'Same bad contractor keeps getting called because no one tracks quality',
              after: 'Rate every contractor after completion. See ratings before you award the next job.',
              icon: '⭐',
            },
            {
              before: 'No idea where the job is — did they start? Is it done? Did they ghost you?',
              after: 'Automatic alerts at every stage. Contractor marks work done and you get a text to confirm.',
              icon: '📍',
            },
            {
              before: 'Posted a project and heard nothing for days — assumed it was broken',
              after: 'If no one bids in 48 hours, you get a text automatically. TAGS always tells you what\'s happening.',
              icon: '⏰',
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'oklch(0.57 0.135 183)' }}>Pricing</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple. Aligned. No surprises.</h2>
            <p className="text-lg" style={{ color: 'oklch(0.60 0.025 252)' }}>
              Everyone pays only when value is delivered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* PM Card */}
            <div className="rounded-2xl p-8" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.30 0.08 183)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xl font-bold text-white">Property Manager</p>
                  <p className="text-sm mt-1" style={{ color: 'oklch(0.57 0.135 183)' }}>Per community</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white">$50</div>
                  <div className="text-xs" style={{ color: 'oklch(0.55 0.02 252)' }}>per community / month</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-5 w-1/2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                  style={{ background: 'oklch(0.22 0.08 75)', color: 'oklch(0.85 0.16 75)', border: '1px solid oklch(0.38 0.14 75)' }}>
                  🔒 Invite-only beta
                </span>
                <span className="text-xs whitespace-nowrap" style={{ color: 'oklch(0.50 0.02 252)' }}>Temporary pricing</span>
              </div>
              <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'oklch(0.20 0.05 183)', border: '1px solid oklch(0.30 0.08 183)' }}>
                <p style={{ color: 'oklch(0.75 0.10 183)' }}>One flat rate per property. <strong className="text-white">No per-door math.</strong></p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited projects with unit-level tracking',
                  'Scope of Work generated by proprietary software on every project',
                  'Side-by-side bid comparison with ratings',
                  'Two-way SMS messaging with contractors',
                  'Full alert suite — bid, award, complete',
                  '48-hour no-bid alert',
                  'Portfolio analytics and full project history',
                ].map(feat => (
                  <li key={feat} className="flex items-center gap-3 text-sm" style={{ color: 'oklch(0.75 0.015 252)' }}>
                    <span style={{ color: 'oklch(0.57 0.135 183)' }}>✓</span> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/register/pm"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'oklch(0.57 0.135 183)' }}>
                Start Tagging →
              </Link>
            </div>

            {/* Contractor Card */}
            <div className="rounded-2xl p-8" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xl font-bold text-white">Contractor</p>
                  <p className="text-sm mt-1" style={{ color: 'oklch(0.60 0.025 252)' }}>Annual membership</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white">$100</div>
                  <div className="text-xs" style={{ color: 'oklch(0.55 0.02 252)' }}>per year</div>
                </div>
              </div>
              <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.022 252)' }}>
                <p style={{ color: 'oklch(0.65 0.02 252)' }}>+ <strong className="text-white">1.5%</strong> of each awarded bid — paid only when you win.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Free to apply and get approved',
                  'Unlimited bids on open projects',
                  'Full SOW on every project before you bid',
                  'SMS notifications for matching projects',
                  'Two-way messaging — no app required',
                  'Job history and completion records',
                  '1.5% fee only when you win a bid',
                ].map(feat => (
                  <li key={feat} className="flex items-center gap-3 text-sm" style={{ color: 'oklch(0.75 0.015 252)' }}>
                    <span style={{ color: 'oklch(0.57 0.135 183)' }}>✓</span> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/for-contractors"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ border: '1px solid oklch(0.35 0.025 252)', color: 'oklch(0.75 0.015 252)' }}>
                Learn More →
              </Link>
            </div>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: 'oklch(0.40 0.015 252)' }}>
            Beta pricing is temporary and invite-only. Early access accounts are grandfathered at current rates when billing goes live.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-12 py-24 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          Your next repair project<br />
          <span style={{ color: 'oklch(0.57 0.135 183)' }}>takes 60 seconds to post.</span>
        </h2>
        <p className="text-lg mb-10" style={{ color: 'oklch(0.60 0.025 252)' }}>
          Join property managers who&apos;ve stopped guessing at scope, stopped chasing contractors, and started running repairs like a system.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'oklch(0.57 0.135 183)' }}>
            Start Tagging →
          </Link>
          <Link href="/for-contractors"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-medium transition-colors duration-150"
            style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
            Join as a Contractor
          </Link>
          <Link href="/register/homeowner"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-medium transition-colors duration-150"
            style={{ color: 'oklch(0.72 0.12 183)', border: '1px solid oklch(0.35 0.10 183)', background: 'oklch(0.18 0.06 183)' }}>
            I&apos;m a Homeowner →
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
            <Link href="/register/pm" className="text-sm transition-colors duration-150" style={{ color: 'oklch(0.45 0.015 252)' }}>For PMs</Link>
            <Link href="/for-contractors" className="text-sm transition-colors duration-150" style={{ color: 'oklch(0.45 0.015 252)' }}>For Contractors</Link>
            <Link href="/register/homeowner" className="text-sm transition-colors duration-150" style={{ color: 'oklch(0.45 0.015 252)' }}>For Homeowners</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
