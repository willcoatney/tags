import Link from 'next/link'

const SAMPLES = [
  { slug: 'roof-leak-repair', title: 'Roof Leak Repair', icon: '🏠', desc: 'Identify and repair active roof leaks, flashing, and underlayment.' },
  { slug: 'bathroom-remodel', title: 'Bathroom Remodel', icon: '🚿', desc: 'Full bathroom renovation including tile, fixtures, and plumbing.' },
  { slug: 'window-repair', title: 'Window Repair & Replacement', icon: '🪟', desc: 'Failed seals, damaged frames, and full window replacement scopes.' },
  { slug: 'plumbing-leak', title: 'Plumbing Leak Repair', icon: '🔧', desc: 'Supply line, drain, and fixture leak diagnosis and repair.' },
  { slug: 'drywall-repair', title: 'Drywall Repair & Painting', icon: '🎨', desc: 'Patch, texture match, prime, and paint damaged drywall sections.' },
  { slug: 'hvac-service', title: 'HVAC Tune-Up & Repair', icon: '❄️', desc: 'Filter replacement, coil cleaning, refrigerant check, and repairs.' },
  { slug: 'flooring-replacement', title: 'Flooring Replacement', icon: '🏗', desc: 'Remove and replace LVP, tile, or carpet in residential spaces.' },
  { slug: 'electrical-outlet', title: 'Electrical Outlet & Panel Work', icon: '⚡', desc: 'Outlet replacement, GFCI install, and panel inspection scopes.' },
]

export const metadata = {
  title: 'Sample Scopes of Work — TAGS',
  description: 'Browse professional Scope of Work examples for common repairs and renovations. See exactly what a TAGS-generated SOW looks like before you start.',
}

export default function SamplesPage() {
  return (
    <div style={{ background: 'oklch(0.13 0.022 252)', minHeight: '100vh', color: 'oklch(0.96 0.008 252)' }}>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ background: 'oklch(0.13 0.022 252 / 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tags-logo.jpg" alt="TAGS" className="h-9 max-w-[120px] object-contain rounded-md" />
        </Link>
        <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'oklch(0.57 0.135 183)' }}>
          Start Free →
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'oklch(0.57 0.135 183)' }}>
            Sample Scopes of Work
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">See what a TAGS SOW looks like</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'oklch(0.60 0.025 252)' }}>
            Every project type. Professional format. Materials, labor, and cost estimate included — in under 60 seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {SAMPLES.map(s => (
            <Link key={s.slug} href={`/samples/${s.slug}`}
              className="rounded-2xl p-6 flex items-start gap-4 transition-all duration-150 hover:border-[oklch(0.35_0.08_183)] active:scale-[0.98]"
              style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
              <span className="text-3xl shrink-0">{s.icon}</span>
              <div>
                <h2 className="font-semibold text-white mb-1">{s.title}</h2>
                <p className="text-sm" style={{ color: 'oklch(0.58 0.02 252)' }}>{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 rounded-2xl p-8 text-center"
          style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.30 0.08 183)' }}>
          <h2 className="text-2xl font-bold text-white mb-2">Ready for your actual project?</h2>
          <p className="mb-6" style={{ color: 'oklch(0.60 0.025 252)' }}>
            Property managers get 3 free SOWs. Homeowners pay $20 per scope.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register/pm"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'oklch(0.57 0.135 183)' }}>
              Start Free — Property Manager →
            </Link>
            <Link href="/register/homeowner"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'oklch(0.45 0.18 250)' }}>
              Homeowner? Get a SOW — $20 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
