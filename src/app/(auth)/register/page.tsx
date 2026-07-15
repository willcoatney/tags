'use client'

import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'oklch(0.13 0.022 252)' }}
    >
      {/* Logo */}
      <div className="mb-10 text-center">
        <img src="/tags-logo.jpg" alt="TAGS" className="h-12 max-w-[160px] object-contain rounded-md mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-sm mt-1" style={{ color: 'oklch(0.60 0.025 252)' }}>
          Choose the account type that fits your role
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
        {/* Property Manager */}
        <Link
          href="/register/pm"
          className="flex-1 rounded-2xl p-8 text-center group transition-all duration-200"
          style={{
            background: 'oklch(0.17 0.022 252)',
            border: '1px solid oklch(0.27 0.025 252)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'oklch(0.57 0.135 183)'
            e.currentTarget.style.background = 'oklch(0.18 0.028 252)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'oklch(0.27 0.025 252)'
            e.currentTarget.style.background = 'oklch(0.17 0.022 252)'
          }}
        >
          <div className="text-5xl mb-4">🏢</div>
          <h2 className="text-xl font-bold text-white mb-2">Property Manager</h2>
          <p className="text-sm mb-6" style={{ color: 'oklch(0.60 0.025 252)' }}>
            I manage day-to-day repairs at one or more properties
          </p>
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150"
            style={{ background: 'oklch(0.57 0.135 183)' }}
          >
            Get Started →
          </div>
        </Link>

        {/* Regional Manager */}
        <Link
          href="/register/rm"
          className="flex-1 rounded-2xl p-8 text-center group transition-all duration-200"
          style={{
            background: 'oklch(0.17 0.022 252)',
            border: '1px solid oklch(0.27 0.025 252)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'oklch(0.57 0.135 183)'
            e.currentTarget.style.background = 'oklch(0.18 0.028 252)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'oklch(0.27 0.025 252)'
            e.currentTarget.style.background = 'oklch(0.17 0.022 252)'
          }}
        >
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-white mb-2">Regional Manager</h2>
          <p className="text-sm mb-6" style={{ color: 'oklch(0.60 0.025 252)' }}>
            I oversee a portfolio of properties and multiple property managers
          </p>
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150"
            style={{ background: 'oklch(0.57 0.135 183)' }}
          >
            Get Started →
          </div>
        </Link>
      </div>

      {/* Sign in link */}
      <p className="mt-8 text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-medium" style={{ color: 'oklch(0.57 0.135 183)' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
