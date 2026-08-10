'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

type BillingState = {
  subscription_status: string | null
  stripe_customer_id: string | null
  role: string | null
}

type PlanInterval = 'monthly' | 'yearly'

const PLANS: Record<string, { name: string; monthly: string; yearly: string; yearlyNote: string; note?: string }> = {
  pm: {
    name: 'TAGS Property Manager',
    monthly: '$50/month',
    yearly: '$500/year',
    yearlyNote: 'Save $100/year',
  },
  contractor: {
    name: 'TAGS Contractor',
    monthly: '$10/month',
    yearly: '$100/year',
    yearlyNote: 'Save $20/year',
    note: '+ 1.5% platform fee per awarded job',
  },
}

export default function BillingPage() {
  const searchParams = useSearchParams()
  const required = searchParams.get('required') === '1'
  const success = searchParams.get('success') === '1'
  const canceled = searchParams.get('canceled') === '1'

  const [billing, setBilling] = useState<BillingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [interval, setInterval] = useState<PlanInterval>('monthly')

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchBilling() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) { setLoading(false); return }

      const { data: org } = await supabase
        .from('organizations')
        .select('subscription_status, stripe_customer_id')
        .eq('id', profile.organization_id)
        .single()

      setBilling({
        subscription_status: org?.subscription_status ?? null,
        stripe_customer_id: org?.stripe_customer_id ?? null,
        role: profile.role,
      })
      setLoading(false)
    }

    fetchBilling()
  }, [])

  async function handleSubscribe() {
    setActionLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: interval }),
    })
    const { url, error } = await res.json()
    if (error) { alert(error); setActionLoading(false); return }
    window.location.href = url
  }

  async function handleManage() {
    setActionLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url, error } = await res.json()
    if (error) { alert(error); setActionLoading(false); return }
    window.location.href = url
  }

  const isActive = billing?.subscription_status === 'active'
  const plan = billing?.role ? PLANS[billing.role] : null
  const currentPrice = plan ? (interval === 'yearly' ? plan.yearly : plan.monthly) : null

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Billing</h1>

      {required && !isActive && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
          An active subscription is required to access your dashboard.
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-200">
          🎉 Subscription activated — welcome aboard.
        </div>
      )}

      {canceled && (
        <div className="mb-6 rounded-lg bg-gray-50 border border-gray-200 p-4 text-gray-700 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
          Checkout canceled. Your subscription has not changed.
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading billing status…</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Plan</p>
              <p className="font-semibold text-gray-900 dark:text-white">{plan?.name ?? 'TAGS'}</p>
              {plan?.note && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{plan.note}</p>
              )}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : billing?.subscription_status === 'past_due'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {isActive ? 'Active' : billing?.subscription_status ?? 'Inactive'}
            </span>
          </div>

          {!isActive && plan && (
            <>
              {/* Monthly / Yearly toggle */}
              <div className="mb-5">
                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                  <button
                    onClick={() => setInterval('monthly')}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
                      interval === 'monthly'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setInterval('yearly')}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
                      interval === 'yearly'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Yearly
                    <span className="ml-1.5 text-xs text-green-600 dark:text-green-400 font-semibold">
                      {plan.yearlyNote}
                    </span>
                  </button>
                </div>
              </div>

              {/* Price display */}
              <div className="text-center mb-5 py-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {interval === 'monthly'
                    ? (billing?.role === 'contractor' ? '$10' : '$50')
                    : (billing?.role === 'contractor' ? '$100' : '$500')
                  }
                  <span className="text-base font-normal text-gray-500 dark:text-gray-400">
                    /{interval === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </p>
              </div>
            </>
          )}

          <div>
            {isActive ? (
              <button
                onClick={handleManage}
                disabled={actionLoading}
                className="w-full rounded-lg bg-gray-900 text-white py-2.5 px-4 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {actionLoading ? 'Loading…' : 'Manage Billing'}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="w-full rounded-lg bg-blue-600 text-white py-2.5 px-4 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Loading…' : `Subscribe — ${currentPrice ?? 'Get Started'}`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
