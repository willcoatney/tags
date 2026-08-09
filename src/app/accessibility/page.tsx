import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility Statement — TAGS',
  description: 'TAGS commitment to web accessibility and WCAG 2.1 AA conformance.',
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen" style={{ background: 'oklch(0.13 0.022 252)' }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Logo */}
        <div className="mb-10">
          <Link href="/">
            <img src="/tags-logo.jpg" alt="TAGS — The Apartment Guys System" className="h-10 object-contain rounded-md" />
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Accessibility Statement</h1>
        <p className="text-sm mb-10" style={{ color: 'oklch(0.55 0.02 252)' }}>
          Last updated: August 8, 2026
        </p>

        <div className="prose prose-invert max-w-none space-y-8 text-base leading-relaxed" style={{ color: 'oklch(0.72 0.01 252)' }}>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Our Commitment</h2>
            <p>
              TAGS (The Apartment Guys System) is committed to ensuring that our platform is accessible
              to all users, including those with disabilities. We aim to conform to the{' '}
              <strong className="text-white">Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>,
              published by the World Wide Web Consortium (W3C).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Conformance Status</h2>
            <p>
              TAGS is <strong className="text-white">partially conformant</strong> with WCAG 2.1 Level AA.
              Partially conformant means that some parts of the content do not fully conform to the
              accessibility standard. We are actively working to identify and resolve gaps.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Known Limitations</h2>
            <p>We are aware of the following areas and are actively improving them:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Some image elements may lack descriptive alternative text</li>
              <li>Certain complex data views may not be fully optimized for screen readers</li>
            </ul>
            <p className="mt-3">
              If you encounter an accessibility barrier not listed here, please let us know using the
              contact information below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Technical Specifications</h2>
            <p>
              TAGS relies on the following technologies for conformance with WCAG 2.1:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>HTML5 with semantic markup</li>
              <li>WAI-ARIA (where applicable)</li>
              <li>CSS</li>
              <li>JavaScript / React</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Assistive Technology Support</h2>
            <p>
              TAGS is designed to be compatible with the following assistive technologies:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
              <li>Keyboard-only navigation</li>
              <li>Browser zoom up to 200%</li>
              <li>High contrast display modes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Feedback & Contact</h2>
            <p>
              We welcome your feedback on the accessibility of TAGS. If you experience any barriers,
              need content in an alternative format, or have suggestions for improvement, please
              contact us:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong className="text-white">Email:</strong>{' '}
                <a
                  href="mailto:accessibility@tagyourproject.com"
                  className="underline"
                  style={{ color: 'oklch(0.57 0.135 183)' }}
                >
                  accessibility@tagyourproject.com
                </a>
              </li>
            </ul>
            <p className="mt-4">
              We aim to respond to accessibility feedback within{' '}
              <strong className="text-white">2 business days</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Formal Complaints</h2>
            <p>
              If you are not satisfied with our response, you may contact the{' '}
              <a
                href="https://www.ada.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'oklch(0.57 0.135 183)' }}
              >
                U.S. Department of Justice ADA Information Line
              </a>{' '}
              at 1-800-514-0301 (voice) or 1-800-514-0383 (TTY).
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t flex flex-wrap gap-4 text-sm" style={{ borderColor: 'oklch(0.22 0.022 252)', color: 'oklch(0.45 0.015 252)' }}>
          <Link href="/" style={{ color: 'oklch(0.57 0.135 183)' }}>← Back to TAGS</Link>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
