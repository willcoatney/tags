import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StatusBadge from '@/components/StatusBadge'
import { PROJECT_TYPE_LABELS, type ProjectType } from '@/lib/types'

const CARD = { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }

export default async function ContractorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'contractor') redirect('/login')

  const { data: contractorProfile } = await admin.from('contractor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!contractorProfile) redirect('/login')

  if (contractorProfile.approval_status === 'pending') {
    return (
      <div className="max-w-lg mx-auto mt-20">
        <div className="rounded-2xl p-10 text-center" style={CARD}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'oklch(0.22 0.06 75)' }}>
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Application Under Review</h2>
          <p style={{ color: 'oklch(0.55 0.02 252)' }}>
            Your account is pending admin approval. You&apos;ll receive an SMS when approved — usually within 24 hours.
          </p>
        </div>
      </div>
    )
  }

  if (contractorProfile.approval_status === 'rejected') {
    return (
      <div className="max-w-lg mx-auto mt-20">
        <div className="rounded-2xl p-10 text-center" style={CARD}>
          <h2 className="text-xl font-bold text-white mb-2">Application Not Approved</h2>
          <p style={{ color: 'oklch(0.55 0.02 252)' }}>Your application was not approved at this time.</p>
        </div>
      </div>
    )
  }

  const { data: allOpenProjects } = await admin.from('projects')
    .select('*, properties(city, state, zip)')
    .eq('status', 'open')
    .in('project_type', contractorProfile.services)

  const availableProjects = (allOpenProjects || []).filter(p =>
    contractorProfile.service_zip_codes.includes(p.properties?.zip)
  )

  const { data: myBids } = await admin.from('bids')
    .select('*, projects(title, project_type, status)')
    .eq('contractor_user_id', user.id)
    .order('submitted_at', { ascending: false })

  function timeAgo(date: string) {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    if (days === 0) return 'today'
    return `${days}d ago`
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{contractorProfile.company_name}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
            Approved contractor · {contractorProfile.service_zip_codes?.length || 0} service area{contractorProfile.service_zip_codes?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: availableProjects.length, label: 'Available Projects', accent: true },
          { value: myBids?.length || 0, label: 'Bids Submitted' },
          { value: myBids?.filter(b => b.status === 'awarded').length || 0, label: 'Jobs Awarded' },
        ].map(stat => (
          <div key={stat.label} className="stat-card rounded-xl p-5" style={CARD}>
            <div className="text-3xl font-bold mb-1" style={{ color: stat.accent ? 'oklch(0.57 0.135 183)' : 'white' }}>
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Available Projects */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Available Projects</h2>
        {!availableProjects.length ? (
          <div className="rounded-xl py-12 text-center" style={CARD}>
            <p className="text-white font-medium mb-1">No matching projects right now</p>
            <p className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>
              You&apos;ll get an SMS when a project matching your services and area is posted.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableProjects.map(project => (
              <div key={project.id} className="rounded-xl px-5 py-4 transition-all duration-150 hover:border-[oklch(0.32_0.025_252)]" style={CARD}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white truncate">{project.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.22 0.022 252)', color: 'oklch(0.60 0.025 252)' }}>
                        {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
                      {project.properties?.city}, {project.properties?.state}
                      {(project.budget_min || project.budget_max) && ` · $${project.budget_min?.toLocaleString() || '?'}–$${project.budget_max?.toLocaleString() || '?'}`}
                      {` · ${timeAgo(project.created_at)}`}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/contractor/projects/${project.id}`}
                    className="shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all duration-150 active:scale-[0.98]"
                    style={{ background: 'oklch(0.57 0.135 183)' }}
                  >
                    View & Bid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Bids */}
      {(myBids?.length || 0) > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">My Bids</h2>
          <div className="space-y-2">
            {myBids!.map(bid => (
              <div key={bid.id} className="rounded-xl px-5 py-4" style={CARD}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{bid.projects?.title}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
                      ${bid.amount.toLocaleString()} · {bid.timeline_days} days · {new Date(bid.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={bid.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
