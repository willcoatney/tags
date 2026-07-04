import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StatusBadge from '@/components/StatusBadge'
import AwardBidButton from '@/components/AwardBidButton'
import ProjectMessages from '@/components/ProjectMessages'
import { PROJECT_TYPE_LABELS, type ProjectType } from '@/lib/types'

const CARD = { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }

export default async function BidDetailPage({ params }: { params: { id: string; bidId: string } }) {
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

  const { data: bid } = await admin.from('bids')
    .select('*, user_profiles(id, full_name, email, phone)')
    .eq('id', params.bidId)
    .eq('project_id', params.id)
    .single()
  if (!bid) notFound()

  const contractorUserId: string = bid.contractor_user_id

  const { data: contractorProfile } = await admin.from('contractor_profiles')
    .select('company_name, services, service_states, license_url, insurance_url, w9_url, coi_expiration_date')
    .eq('user_id', contractorUserId)
    .single()

  // COI status for PM warning
  const coiExpired = contractorProfile?.coi_expiration_date
    ? new Date(contractorProfile.coi_expiration_date) < new Date()
    : false
  const coiExpiringSoon = !coiExpired && contractorProfile?.coi_expiration_date
    ? Math.ceil((new Date(contractorProfile.coi_expiration_date).getTime() - Date.now()) / 86400000) <= 30
    : false

  const { data: ratings } = await admin.from('ratings')
    .select('rating, comment, created_at')
    .eq('contractor_user_id', contractorUserId)
    .order('created_at', { ascending: false })

  const avgRating = ratings?.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs mb-1" style={{ color: 'oklch(0.50 0.02 252)' }}>
            <Link href={`/dashboard/pm/projects/${params.id}/bids`} className="hover:underline">← All Bids</Link>
            <span className="mx-1">·</span>{project.title}
          </p>
          <h1 className="text-xl font-bold text-white">
            {contractorProfile?.company_name || bid.user_profiles?.full_name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={bid.status} />
            {avgRating !== null && (
              <span className="text-sm" style={{ color: 'oklch(0.80 0.18 75)' }}>
                {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))} {avgRating.toFixed(1)} ({ratings!.length})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bid amounts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={CARD}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'oklch(0.50 0.02 252)' }}>Bid Amount</p>
          <p className="text-3xl font-bold" style={{ color: 'oklch(0.57 0.135 183)' }}>${bid.amount.toLocaleString()}</p>
        </div>
        <div className="rounded-xl p-4" style={CARD}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'oklch(0.50 0.02 252)' }}>Timeline</p>
          <p className="text-3xl font-bold text-white">{bid.timeline_days}<span className="text-base font-normal ml-1" style={{ color: 'oklch(0.55 0.02 252)' }}>days</span></p>
        </div>
      </div>

      {/* Bid notes */}
      {bid.notes && (
        <div className="rounded-xl p-4" style={CARD}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'oklch(0.50 0.02 252)' }}>Contractor Notes</p>
          <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.78 0.01 252)' }}>{bid.notes}</p>
        </div>
      )}

      {/* Contractor info */}
      <div className="rounded-xl p-4 space-y-3" style={CARD}>
        <p className="text-xs uppercase tracking-wider" style={{ color: 'oklch(0.50 0.02 252)' }}>Contractor Info</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          {bid.user_profiles?.email && (
            <>
              <span style={{ color: 'oklch(0.55 0.02 252)' }}>Email</span>
              <span className="text-white">{bid.user_profiles.email}</span>
            </>
          )}
          {bid.user_profiles?.phone && (
            <>
              <span style={{ color: 'oklch(0.55 0.02 252)' }}>Phone</span>
              <span className="text-white">{bid.user_profiles.phone}</span>
            </>
          )}
          {(contractorProfile?.services?.length ?? 0) > 0 && (
            <>
              <span style={{ color: 'oklch(0.55 0.02 252)' }}>Services</span>
              <span className="text-white">
                {contractorProfile!.services.map((s: ProjectType) => PROJECT_TYPE_LABELS[s]).join(', ')}
              </span>
            </>
          )}
          {(contractorProfile?.service_states?.length ?? 0) > 0 && (
            <>
              <span style={{ color: 'oklch(0.55 0.02 252)' }}>States</span>
              <span className="text-white">{contractorProfile!.service_states.join(', ')}</span>
            </>
          )}
        </div>
        {/* COI / compliance warnings */}
        {coiExpired && (
          <div className="rounded-lg px-3 py-2.5 text-sm flex items-start gap-2"
            style={{ background: 'oklch(0.16 0.07 25)', border: '1px solid oklch(0.30 0.12 25)', color: 'oklch(0.75 0.18 25)' }}>
            <span>⚠️</span>
            <span>
              <strong>COI Expired</strong> — This contractor&apos;s certificate of insurance expired on{' '}
              {new Date(contractorProfile!.coi_expiration_date!).toLocaleDateString()}.
              Verify active coverage before awarding this bid.
            </span>
          </div>
        )}
        {coiExpiringSoon && (
          <div className="rounded-lg px-3 py-2.5 text-sm flex items-start gap-2"
            style={{ background: 'oklch(0.16 0.06 75)', border: '1px solid oklch(0.28 0.12 75)', color: 'oklch(0.78 0.18 75)' }}>
            <span>⚠️</span>
            <span>
              <strong>COI Expiring Soon</strong> — Expires{' '}
              {new Date(contractorProfile!.coi_expiration_date!).toLocaleDateString()}.
              Confirm renewal before work starts.
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-1 flex-wrap">
          {contractorProfile?.license_url && (
            <a href={contractorProfile.license_url} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: 'oklch(0.20 0.04 183)', color: 'oklch(0.65 0.10 183)', border: '1px solid oklch(0.30 0.08 183)' }}>
              View License
            </a>
          )}
          {contractorProfile?.insurance_url && (
            <a href={contractorProfile.insurance_url} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: 'oklch(0.20 0.04 183)', color: 'oklch(0.65 0.10 183)', border: '1px solid oklch(0.30 0.08 183)' }}>
              View COI
            </a>
          )}
          {contractorProfile?.w9_url && (
            <a href={contractorProfile.w9_url} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: 'oklch(0.20 0.04 183)', color: 'oklch(0.65 0.10 183)', border: '1px solid oklch(0.30 0.08 183)' }}>
              View W-9
            </a>
          )}
        </div>
      </div>

      {/* Past ratings */}
      {ratings && ratings.length > 0 && (
        <div className="rounded-xl p-4" style={CARD}>
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'oklch(0.50 0.02 252)' }}>Past Reviews</p>
          <div className="space-y-2">
            {ratings.slice(0, 3).map((r, i) => (
              <div key={i} className="text-sm">
                <span style={{ color: 'oklch(0.80 0.18 75)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                {r.comment && <p className="mt-0.5" style={{ color: 'oklch(0.65 0.02 252)' }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Award button */}
      {bid.status === 'submitted' && project.status === 'open' && (
        <AwardBidButton bidId={bid.id} />
      )}

      {/* Private message thread */}
      <div className="rounded-xl overflow-hidden" style={CARD}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
          <p className="text-sm font-semibold text-white">💬 Messages</p>
          <p className="text-xs mt-0.5" style={{ color: 'oklch(0.50 0.02 252)' }}>
            Private thread between you and {contractorProfile?.company_name || bid.user_profiles?.full_name}.
          </p>
        </div>
        <ProjectMessages
          projectId={project.id}
          currentUserId={user.id}
          currentUserRole="pm"
          contractorUserId={contractorUserId}
        />
      </div>
    </div>
  )
}
