import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function JoinPortfolioPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: invite } = await admin
    .from('portfolio_invites')
    .select('id, portfolio_id, used_by_org_id, expires_at')
    .eq('token', token)
    .is('used_by_org_id', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  let portfolioName: string | null = null
  let ownerName = 'Regional Manager'

  if (invite) {
    const { data: portfolio } = await admin
      .from('portfolios')
      .select('name, owner_id')
      .eq('id', invite.portfolio_id)
      .single()

    if (portfolio) {
      portfolioName = portfolio.name as string
      const { data: owner } = await admin
        .from('user_profiles')
        .select('full_name')
        .eq('id', portfolio.owner_id)
        .single()
      if (owner?.full_name) ownerName = owner.full_name as string
    }
  }

  const isValid = !!invite && !!portfolioName

  if (!isValid) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'oklch(0.13 0.022 252)' }}
      >
        <div
          className="max-w-md w-full text-center rounded-2xl p-10"
          style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}
        >
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-white mb-2">Invite Link Invalid</h2>
          <p style={{ color: 'oklch(0.55 0.02 252)' }}>
            This invite link is invalid or has expired. Ask your Regional Manager for a new one.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'oklch(0.13 0.022 252)' }}
    >
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <img src="/tags-logo.jpg" alt="TAGS" className="h-12 max-w-[160px] object-contain rounded-md mx-auto" />
        </div>

        {/* Invite card */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.30 0.08 183)' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'oklch(0.20 0.08 183)' }}
          >
            <span className="text-3xl">📊</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">
            You&apos;ve been invited to join
          </h1>
          <p className="text-xl font-semibold mb-1" style={{ color: 'oklch(0.57 0.135 183)' }}>
            {portfolioName}
          </p>
          <p className="text-sm mb-6" style={{ color: 'oklch(0.60 0.025 252)' }}>
            by {ownerName}
          </p>

          <Link
            href={`/register/pm?portfolioToken=${token}`}
            className="inline-flex items-center justify-center w-full h-12 rounded-lg font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'oklch(0.57 0.135 183)' }}
          >
            Create Your Account
          </Link>
        </div>

        <p className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: 'oklch(0.57 0.135 183)' }}>
            Sign in and connect your portfolio from your dashboard.
          </Link>
        </p>
      </div>
    </div>
  )
}
