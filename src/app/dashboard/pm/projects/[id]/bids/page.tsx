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
    .select('*, user_profiles(full_name, email, phone)')
    .eq('project_id', params.id)
    .order('amount', { ascending: true })

  // Fetch contractor profiles separately (no direct FK from bids → contractor_profiles)
  const bidderIds = (bids || []).map(b => b.contractor_user_id)
  const { data: contractorProfiles } = bidderIds.length > 0
    ? await admin.from('contractor_profiles').select('user_id, company_name, services').in('user_id', bidderIds)
    : { data: [] }
  const contractorMap = Object.fromEntries((contractorProfiles || []).map(cp => [cp.user_id, cp]))

  // Fetch avg ratings for each contractor
  const contractorIds = Array.from(new Set((bids || []).map(b => b.contractor_user_id)))
  const { data: allRatings } = contractorIds.length > 0
    ? await admin.from('ratings').select('contractor_user_id, rating').in('contractor_user_id', contractorIds)
    : { data: [] }

  const ratingMap: Record<string, { avg: number; count: number }> = {}
  for (const r of (allRatings || [])) {
    if (!ratingMap[r.contractor_user_id]) ratingMap[r.contractor_user_id] = { avg: 0, count: 0 }
    ratingMap[r.contractor_user_id].count++
    ratingMap[r.contractor_user_id].avg += r.rating
  }
  for (const id of Object.keys(ratingMap)) {
    ratingMap[id].avg = ratingMap[id].avg / ratingMap[id].count
  }

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
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/pm/projects/${params.id}/bids/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150"
            style={{ background: 'oklch(0.22 0.06 183)', color: 'oklch(0.70 0.12 183)', border: '1px solid oklch(0.30 0.08 183)' }}
          >
            📄 Export PDF
          </Link>
          <Link
            href={`/dashboard/pm/projects/${params.id}`}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
            style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
          >
            ← Project
          </Link>
        </div>
      </div>

      {/* Comparison table */}
      {(bids?.length || 0) > 1 && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'oklch(0.55 0.02 252)' }}>Side-by-Side Comparison</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'oklch(0.50 0.02 252)' }}>Contractor</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'oklch(0.50 0.02 252)' }}>Amount</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'oklch(0.50 0.02 252)' }}>Timeline</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'oklch(0.50 0.02 252)' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {bids?.map((bid, i) => {
                  const r = ratingMap[bid.contractor_user_id]
                  const isLowest = i === 0
                  const cp = contractorMap[bid.contractor_user_id]
                  return (
                    <tr key={bid.id} className="transition-colors hover:bg-slate-800/30"
                      style={{ borderBottom: i < (bids.length - 1) ? '1px solid oklch(0.20 0.022 252)' : 'none' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: isLowest ? 'oklch(0.65 0.14 160)' : 'white' }}>
                        {cp?.company_name || bid.user_profiles?.full_name}
                        {isLowest && <span className="ml-2 text-xs">★ lowest</span>}
                      </td>
                      <td className="px-4 py-2.5 font-bold" style={{ color: 'oklch(0.57 0.135 183)' }}>${bid.amount.toLocaleString()}</td>
                      <td className="px-4 py-2.5" style={{ color: 'oklch(0.65 0.02 252)' }}>{bid.timeline_days}d</td>
                      <td className="px-4 py-2.5" style={{ color: 'oklch(0.80 0.18 75)' }}>
                        {r ? `${'★'.repeat(Math.round(r.avg))}${'☆'.repeat(5 - Math.round(r.avg))} (${r.count})` : <span style={{ color: 'oklch(0.40 0.015 252)' }}>No ratings yet</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!bids?.length ? (
        <div className="rounded-xl py-16 text-center" style={CARD}>
          <p className="text-white font-medium">No bids yet</p>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>Contractors will be notified when a match is found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid: Bid & { user_profiles: { full_name: string; email: string; phone: string } }) => {
            const isLowest = bid.amount === lowestBid && bids.length > 1
            const r = ratingMap[bid.contractor_user_id]
            const cp = contractorMap[bid.contractor_user_id]
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
                      {cp?.company_name || bid.user_profiles?.full_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs" style={{ color: 'oklch(0.55 0.02 252)' }}>
                        Submitted {new Date(bid.submitted_at).toLocaleDateString()}
                      </p>
                      {r && (
                        <span className="text-xs font-medium" style={{ color: 'oklch(0.80 0.18 75)' }}>
                          {'★'.repeat(Math.round(r.avg))} {r.avg.toFixed(1)} ({r.count})
                        </span>
                      )}
                    </div>
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

                <Link
                  href={`/dashboard/pm/projects/${params.id}/bids/${bid.id}`}
                  className="mt-3 w-full flex items-center justify-center h-9 rounded-lg text-xs font-medium transition-colors duration-150"
                  style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
                >
                  View Details & Messages →
                </Link>

                {bid.status === 'submitted' && project.status === 'open' && (
                  <div className="mt-5 pt-4" style={{ borderTop: '1px solid oklch(0.25 0.022 252)' }}>
                    <p className="text-xs mb-2 font-medium" style={{ color: 'oklch(0.50 0.02 252)' }}>
                      ⚠️ Awarding is permanent — all other bids will be rejected
                    </p>
                    <AwardBidButton bidId={bid.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
