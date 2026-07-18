import Link from 'next/link'

const legalLinks = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/legal/contractor-agreement', label: 'Contractor Agreement' },
  { href: '/legal/pm-agreement', label: 'Property Manager Agreement' },
  { href: '/legal/ip-notice', label: 'IP & Copyright' },
  { href: '/legal/disclaimer', label: 'Website Disclaimer' },
  { href: '/legal/cookies', label: 'Cookie Policy' },
  { href: '/legal/esign', label: 'E-Sign & Consent' },
]

interface LegalPageWrapperProps {
  title: string
  updated?: string
  children: React.ReactNode
}

export default function LegalPageWrapper({ title, updated = 'July 2026', children }: LegalPageWrapperProps) {
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

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-20 flex flex-col lg:flex-row gap-12">

        {/* SIDEBAR */}
        <aside className="lg:w-56 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'oklch(0.50 0.02 252)' }}>Legal Documents</p>
          <ul className="space-y-1">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-sm py-1.5 px-2 rounded transition-colors"
                  style={{ color: 'oklch(0.60 0.02 252)' }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold text-white mb-3">{title}</h1>
          <p className="text-sm mb-12" style={{ color: 'oklch(0.50 0.02 252)' }}>Last updated: {updated}</p>
          <div className="space-y-10" style={{ color: 'oklch(0.72 0.015 252)' }}>
            {children}
          </div>
        </main>

      </div>

      <footer className="px-6 md:px-12 py-8 mt-12" style={{ borderTop: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'oklch(0.32 0.015 252)' }}>© {new Date().getFullYear()} TAGS — The Apartment Guys System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/legal" className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>Legal Center</Link>
            <Link href="/privacy" className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>Privacy Policy</Link>
            <Link href="/terms" className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
