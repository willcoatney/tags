import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StatusBadge from '@/components/StatusBadge'
import AwardBidButton from '@/components/AwardBidButton'
import type { Bid } from '@/lib/types'

const CARD = { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }

export default async function BidsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') redirect('/login')

  const { data: project } = await admin.from('projects')
    .select('*, properties(*)')
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)
    .single()

  if (!project) notFound()

  const { data: bids } = await admin.from('bids')
    .select('*, user_profiles(full_name, email, phone), contractor_profiles(company_name, services)')
    .eq('project_id', params.id)
    .order('amount', { ascending: true })

  const lowestBid = bids?.[0]?.amount

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{project.title}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
            {project.properties?.city}, {project.properties?.state} · {bids?.length || 0} bid{bids?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href={`/dashboard/pm/projects/${params.id}`}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
          style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
        >
          ← Project
        </Link>
      </div>

      {!bids?.length ? (
        <div className="rounded-xl py-16 text-center" style={CARD}>
          <p className="text-white font-medium">No bids yet</p>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>Contractors will be notified when a match is found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid: Bid & { user_profiles: { full_name: string; email: string; phone: string }; contractor_profiles: { company_name: string } }) => {
            const isLowest = bid.amount === lowestBid && bids.length > 1
            return (
              <div
                key={bid.id}
                className="rounded-xl p-5 transition-all duration-150"
                style={{
                  ...CARD,
                  ...(isLowest ? { borderColor: 'oklch(0.40 0.10 160)' } : {})
                }}
              >
                {isLowest && (
                  <div className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'oklch(0.65 0.14 160)' }}>
                    <span>★</span> Lowest Bid
                  </div>
                )}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-white">
                      {bid.contractor_profiles?.company_name || bid.user_profiles?.full_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
                      Submitted {new Date(bid.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={bid.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="rounded-lg p-3" style={{ background: 'oklch(0.20 0.022 252)' }}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'oklch(0.50 0.02 252)' }}>Bid Amount</p>
                    <p className="text-2xl font-bold" style={{ color: 'oklch(0.57 0.135 183)' }}>
                      ${bid.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'oklch(0.20 0.022 252)' }}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'oklch(0.50 0.02 252)' }}>Timeline</p>
                    <p className="text-2xl font-bold text-white">{bid.timeline_days}<span className="text-sm font-normal ml-1" style={{ color: 'oklch(0.55 0.02 252)' }}>days</span></p>
                  </div>
                </div>

                {bid.notes && (
                  <div className="mb-4 rounded-lg p-3" style={{ background: 'oklch(0.20 0.022 252)' }}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'oklch(0.50 0.02 252)' }}>Notes</p>
                    <p className="text-sm" style={{ color: 'oklch(0.78 0.01 252)' }}>{bid.notes}</p>
                  </div>
                )}

                {bid.status === 'submitted' && project.status === 'open' && (
                  <AwardBidButton bidId={bid.id} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
