import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StatusBadge from '@/components/StatusBadge'
import InviteContractorModal from '@/components/InviteContractorModal'
import ConnectToPortfolio from '@/components/ConnectToPortfolio'
import { PROJECT_TYPE_LABELS } from '@/lib/types'

const S = {
  card: { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' },
  cardHover: 'transition-all duration-150 hover:border-[oklch(0.32_0.025_252)]',
}

function StatCard({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <div className="stat-card rounded-xl p-5" style={S.card}>
      <div className="text-3xl font-bold mb-1" style={{ color: accent ? 'oklch(0.57 0.135 183)' : 'white' }}>
        {value}
      </div>
      <div className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>{label}</div>
    </div>
  )
}

export default async function PMDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'pm') redirect('/login')

  const { data: projects } = await admin.from('projects')
    .select('*, properties(name, city, state), bids(id, status, contractor_user_id, amount)')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  // Collect contractor IDs from awarded bids so we can show names on cards
  const awardedContractorIdSet = new Set<string>()
  for (const p of projects || []) {
    for (const b of (p.bids || []) as { status: string; contractor_user_id: string; amount: number }[]) {
      if (b.status === 'awarded' && b.contractor_user_id) {
        awardedContractorIdSet.add(b.contractor_user_id)
      }
    }
  }
  const awardedContractorIds = Array.from(awardedContractorIdSet)

  const contractorNameMap: Record<string, string> = {}
  if (awardedContractorIds.length > 0) {
    const { data: contractorProfiles } = await admin.from('user_profiles')
      .select('id, full_name')
      .in('id', awardedContractorIds)
    for (const cp of contractorProfiles || []) {
      contractorNameMap[cp.id] = cp.full_name || 'Contractor'
    }
  }

  const { data: properties } = await admin.from('properties')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  // Check if PM is already in a portfolio
  const { data: portfolioMembership } = await admin
    .from('portfolio_organizations')
    .select('id')
    .eq('organization_id', profile.organization_id)
    .maybeSingle()

  const totalBids = projects?.reduce((sum, p) => sum + (p.bids?.length || 0), 0) || 0
  const completedCount = projects?.filter(p => p.status === 'completed').length || 0
  const openCount = projects?.filter(p => p.status === 'open').length || 0
  const avgBidsPerProject = projects?.filter(p => p.status !== 'draft').length
    ? (totalBids / projects.filter(p => p.status !== 'draft').length).toFixed(1)
    : '—'

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {profile.full_name ? `${profile.full_name.split(' ')[0]}'s Dashboard` : 'Dashboard'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
            Manage your repair projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InviteContractorModal />
          <Link
            href="/dashboard/pm/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'oklch(0.57 0.135 183)' }}
          >
            <span className="text-base leading-none">+</span>
            New Project
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={openCount} label="Open for Bids" accent />
        <StatCard value={totalBids} label="Total Bids Received" />
        <StatCard value={avgBidsPerProject} label="Avg Bids / Project" />
        <StatCard value={completedCount} label="Completed" />
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Projects</h2>

        {!projects?.length ? (
          <div className="rounded-xl flex flex-col items-center justify-center py-16 text-center" style={S.card}>
            <div className="text-4xl mb-3">🏗</div>
            <p className="font-medium text-white mb-1">No projects yet</p>
            <p className="text-sm mb-4" style={{ color: 'oklch(0.55 0.02 252)' }}>Post your first repair project and get bids from vetted contractors.</p>
            <Link href="/dashboard/pm/projects/new"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'oklch(0.57 0.135 183)' }}>
              Post First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(project => (
              <div
                key={project.id}
                className={`rounded-xl px-5 py-4 ${S.cardHover}`}
                style={S.card}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-semibold text-white truncate">{project.title}</h3>
                      <StatusBadge status={project.status} />
                      {(() => {
                        const awardedBid = project.bids?.find((b: { status: string; contractor_user_id: string; amount: number }) => b.status === 'awarded')
                        const contractorName = awardedBid ? contractorNameMap[awardedBid.contractor_user_id] : null
                        const awardedAmount = awardedBid?.amount
                        return contractorName ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.22 0.04 145)', color: 'oklch(0.72 0.12 145)' }}>
                            🔨 {contractorName}{awardedAmount != null ? ` · $${Number(awardedAmount).toLocaleString()}` : ''}
                          </span>
                        ) : null
                      })()}
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
                      {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]}
                      {project.properties && ` · ${project.properties.name} · ${project.properties.city}`}
                      {` · ${project.bids?.length || 0} bid${project.bids?.length !== 1 ? 's' : ''}`}
                      {` · ${timeAgo(project.created_at)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/pm/projects/${project.id}`}
                      className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
                      style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
                    >
                      View
                    </Link>
                    {project.status === 'open' && (project.bids?.length || 0) > 0 && (
                      <Link
                        href={`/dashboard/pm/projects/${project.id}/bids`}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all duration-150"
                        style={{ background: 'oklch(0.57 0.135 183)' }}
                      >
                        Review Bids ({project.bids?.length})
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Properties */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {properties?.map(prop => (
            <div key={prop.id} className="rounded-xl p-4" style={S.card}>
              <p className="font-medium text-white text-sm">{prop.name}</p>
              <p className="text-xs mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
                {prop.address}<br />{prop.city}, {prop.state} {prop.zip}
              </p>
            </div>
          ))}
          <Link
            href="/dashboard/pm/projects/new"
            className="rounded-xl p-4 flex items-center justify-center transition-colors duration-150"
            style={{ border: '1px dashed oklch(0.27 0.025 252)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'oklch(0.57 0.135 183)' }}>+ Add Property</span>
          </Link>
        </div>
      </div>

      {/* Portfolio connection — only show if not already in one */}
      {!portfolioMembership && <ConnectToPortfolio />}
    </div>
  )
}
