import LegalPageWrapper from '@/components/LegalPageWrapper'

export default function CookiePolicyPage() {
  return (
    <LegalPageWrapper title="Cookie Policy" updated="July 2026">

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">1. What Are Cookies?</h2>
        <p className="leading-relaxed">
          Cookies are small text files stored in your browser when you visit a website. They help websites remember your preferences, keep you logged in, and understand how the site is being used. TAGS uses cookies and similar technologies (local storage, session storage) to operate the platform and provide a good experience.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">2. What We Use</h2>
        <p className="leading-relaxed mb-4">TAGS uses the following types of cookies and local storage:</p>

        <div className="space-y-6">
          <div className="rounded-lg p-4" style={{ background: 'oklch(0.18 0.022 252)', border: '1px solid oklch(0.24 0.022 252)' }}>
            <h3 className="font-semibold text-white mb-2">Authentication Cookies — <span className="font-normal" style={{ color: 'oklch(0.65 0.12 160)' }}>Strictly Necessary</span></h3>
            <p className="text-sm leading-relaxed">
              Set by Supabase Auth to keep you logged in during your session. These cookies contain your session token and are required for the platform to function. They expire when your session ends or after a configurable idle period.
            </p>
            <p className="text-xs mt-2" style={{ color: 'oklch(0.50 0.02 252)' }}>Example names: <code>sb-{'{project}'}-auth-token</code></p>
          </div>

          <div className="rounded-lg p-4" style={{ background: 'oklch(0.18 0.022 252)', border: '1px solid oklch(0.24 0.022 252)' }}>
            <h3 className="font-semibold text-white mb-2">Local Storage — <span className="font-normal" style={{ color: 'oklch(0.65 0.12 160)' }}>Strictly Necessary</span></h3>
            <p className="text-sm leading-relaxed">
              TAGS uses browser local storage to persist your login session and UI preferences (such as your current dashboard view) across page reloads. This data stays in your browser and is not transmitted to any third party except as required to authenticate with Supabase.
            </p>
          </div>

          <div className="rounded-lg p-4" style={{ background: 'oklch(0.18 0.022 252)', border: '1px solid oklch(0.24 0.022 252)' }}>
            <h3 className="font-semibold text-white mb-2">Performance & Analytics — <span className="font-normal" style={{ color: 'oklch(0.60 0.02 252)' }}>Optional</span></h3>
            <p className="text-sm leading-relaxed">
              TAGS may use basic server-side logging to understand platform performance and usage patterns (e.g., which pages are visited, error rates). This does not involve third-party advertising cookies or behavioral tracking. No advertising networks receive data from tagyourproject.com.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">3. What We Don&apos;t Do</h2>
        <ul className="space-y-2 list-disc list-inside leading-relaxed">
          <li>We do not use advertising or retargeting cookies.</li>
          <li>We do not share cookie data with advertising networks.</li>
          <li>We do not use cross-site tracking technologies.</li>
          <li>We do not embed third-party social media tracking pixels.</li>
        </ul>
        <p className="leading-relaxed mt-3">
          TAGS is a B2B platform. We have no interest in behavioral advertising and no advertising relationships. The cookies we use exist solely to operate the platform.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">4. How to Manage Cookies</h2>
        <p className="leading-relaxed">
          You can control cookies through your browser settings. Most browsers allow you to view, delete, and block cookies. Note that disabling authentication cookies will prevent you from logging into TAGS.
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li><strong className="text-white">Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
          <li><strong className="text-white">Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data</li>
          <li><strong className="text-white">Safari:</strong> Preferences → Privacy → Manage Website Data</li>
          <li><strong className="text-white">Edge:</strong> Settings → Cookies and site permissions</li>
        </ul>
        <p className="leading-relaxed mt-3">
          You can also clear TAGS local storage by logging out of the platform. Logging out removes all session tokens from your browser.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party Services</h2>
        <p className="leading-relaxed">
          TAGS integrates with the following third-party services that may set their own cookies or use local storage when you interact with payment or authentication flows:
        </p>
        <ul className="space-y-2 list-disc list-inside leading-relaxed mt-3">
          <li><strong className="text-white">Stripe</strong> — Payment processing. Stripe may set cookies when you interact with the payment flow. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>Stripe&apos;s Privacy Policy</a>.</li>
          <li><strong className="text-white">Supabase</strong> — Database and auth. Supabase sets session tokens as described above. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>Supabase&apos;s Privacy Policy</a>.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">6. Changes to This Policy</h2>
        <p className="leading-relaxed">
          We may update this Cookie Policy as the platform evolves. Any material changes will be noted with an updated date at the top of this page.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
        <p className="leading-relaxed">
          Cookie questions? Reach us at <a href="mailto:hello@tagyourproject.com" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>hello@tagyourproject.com</a>.
        </p>
      </section>

    </LegalPageWrapper>
  )
}
