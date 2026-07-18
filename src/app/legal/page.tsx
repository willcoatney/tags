import Link from 'next/link'

const documents = [
  {
    href: '/terms',
    title: 'Terms of Service',
    desc: 'The core user agreement governing all accounts on tagyourproject.com — covering platform use, fees, roles, and prohibited conduct.',
    badge: 'All Users',
  },
  {
    href: '/privacy',
    title: 'Privacy Policy',
    desc: 'How TAGS collects, uses, stores, and protects your personal information. Includes SMS consent, third-party services, and your data rights.',
    badge: 'All Users',
  },
  {
    href: '/legal/contractor-agreement',
    title: 'Contractor Agreement',
    desc: 'Supplemental agreement for approved contractors. Covers independent contractor status, licensing requirements, bid commitments, and fee obligations.',
    badge: 'Contractors',
  },
  {
    href: '/legal/pm-agreement',
    title: 'Property Manager Agreement',
    desc: 'Supplemental agreement for property managers and regional managers. Covers posting responsibilities, SOW review obligations, and bid award commitments.',
    badge: 'PMs & RMs',
  },
  {
    href: '/legal/ip-notice',
    title: 'Intellectual Property & Copyright',
    desc: 'Who owns what on the TAGS platform — including AI-generated Scopes of Work, the platform itself, user-uploaded content, and the TAGS brand.',
    badge: 'All Users',
  },
  {
    href: '/legal/disclaimer',
    title: 'Website Disclaimer',
    desc: 'Important limitations on AI-generated content, contractor quality assurance, platform availability, and TAGS\'s role as a marketplace intermediary.',
    badge: 'All Users',
  },
  {
    href: '/legal/cookies',
    title: 'Cookie Policy',
    desc: 'What cookies and local storage TAGS uses, why we use them, and how to manage your preferences.',
    badge: 'All Users',
  },
  {
    href: '/legal/esign',
    title: 'Electronic Signature & Consent',
    desc: 'Your consent to conduct business electronically, the legal validity of electronic agreements, and how to withdraw consent.',
    badge: 'All Users',
  },
]

const badgeColor: Record<string, string> = {
  'All Users': 'oklch(0.25 0.025 252)',
  'Contractors': 'oklch(0.22 0.04 160)',
  'PMs & RMs': 'oklch(0.22 0.04 250)',
}

const badgeText: Record<string, string> = {
  'All Users': 'oklch(0.60 0.02 252)',
  'Contractors': 'oklch(0.65 0.12 160)',
  'PMs & RMs': 'oklch(0.65 0.12 250)',
}

export default function LegalHubPage() {
  return (
    <div style={{ background: 'oklch(0.13 0.022 252)', color: 'oklch(0.96 0.008 252)' }} className="min-h-screen font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ background: 'oklch(0.13 0.022 252 / 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <Link href="/" className="flex items-center gap-2">
          <img src="/tags-logo.jpg" alt="TAGS" className="h-10 max-w-[130px] object-contain rounded-md shrink-0" />
        </Link>
        <Link href="/" className="text-sm" style={{ color: 'oklch(0.57 0.135 183)' }}>← Back to Home</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-20">

        <h1 className="text-4xl font-bold text-white mb-3">Legal Center</h1>
        <p className="text-lg mb-12 leading-relaxed" style={{ color: 'oklch(0.60 0.02 252)' }}>
          Everything governing your use of TAGS — The Apartment Guys System — in one place.
          All documents apply to use of tagyourproject.com.
        </p>

        <div className="grid gap-4">
          {documents.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="group block rounded-xl p-6 transition-all"
              style={{ background: 'oklch(0.16 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-white mb-1 group-hover:underline">{doc.title}</h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.60 0.02 252)' }}>{doc.desc}</p>
                </div>
                <span
                  className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: badgeColor[doc.badge], color: badgeText[doc.badge] }}
                >
                  {doc.badge}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-xl p-6" style={{ background: 'oklch(0.16 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
          <h2 className="text-base font-semibold text-white mb-2">Questions?</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.60 0.02 252)' }}>
            Reach us at{' '}
            <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>
              hello@tagyourproject.com
            </a>
            . We respond to all legal inquiries within 5 business days.
          </p>
        </div>

      </div>

      <footer className="px-6 md:px-12 py-8 mt-12" style={{ borderTop: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
