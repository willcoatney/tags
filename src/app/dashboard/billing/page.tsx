'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

type BillingState = {
  subscription_status: string | null
  stripe_customer_id: string | null
  role: string | null
}

const PLAN_LABELS: Record<string, { name: string; price: string; note?: string }> = {
  pm: {
    name: 'TAGS Property Manager',
    price: '$50/month',
  },
  contractor: {
    name: 'TAGS Contractor',
    price: '$100/year',
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
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
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
  const plan = billing?.role ? PLAN_LABELS[billing.role] : null

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing</h1>

      {required && !isActive && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
          An active subscription is required to access your dashboard.
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
          🎉 Subscription activated — welcome aboard.
        </div>
      )}

      {canceled && (
        <div className="mb-6 rounded-lg bg-gray-50 border border-gray-200 p-4 text-gray-700 text-sm">
          Checkout canceled. Your subscription has not changed.
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading billing status…</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500 mb-1">Plan</p>
              <p className="font-semibold text-gray-900">{plan?.name ?? 'TAGS'}</p>
              <p className="text-sm text-gray-600">{plan?.price}</p>
              {plan?.note && (
                <p className="text-xs text-gray-400 mt-0.5">{plan.note}</p>
              )}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-700'
                : billing?.subscription_status === 'past_due'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {isActive ? 'Active' : billing?.subscription_status ?? 'Inactive'}
            </span>
          </div>

          <div className="mt-6">
            {isActive ? (
              <button
                onClick={handleManage}
                disabled={actionLoading}
                className="w-full rounded-lg bg-gray-900 text-white py-2.5 px-4 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Loading…' : 'Manage Billing'}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="w-full rounded-lg bg-blue-600 text-white py-2.5 px-4 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Loading…' : `Subscribe — ${plan?.price ?? 'Get Started'}`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
