import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/StatusBadge'
import { PROJECT_TYPE_LABELS, type ProjectType } from '@/lib/types'

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

  // Pending approval gate
  if (contractorProfile.approval_status === 'pending') {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="py-12">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-white mb-2">Application Under Review</h2>
            <p className="text-slate-400">Your account is pending admin approval. You&apos;ll receive an SMS when approved.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (contractorProfile.approval_status === 'rejected') {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="py-12">
            <h2 className="text-xl font-bold text-white mb-2">Application Not Approved</h2>
            <p className="text-slate-400">Your application was not approved at this time.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get available projects: matching service type AND zip
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{contractorProfile.company_name}</h1>
          <p className="text-slate-400 text-sm mt-1">Contractor Dashboard</p>
        </div>
      </div>

      {/* Available Projects */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Available Projects ({availableProjects.length})</h2>
        {!availableProjects.length ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="py-8 text-center text-slate-400">
              No matching projects in your service area right now. Check back soon.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {availableProjects.map(project => (
              <Card key={project.id} className="bg-slate-900 border-slate-700 hover:border-slate-500 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-white">{project.title}</h3>
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        {project.properties?.city}, {project.properties?.state} •{' '}
                        {project.budget_min || project.budget_max
                          ? `$${project.budget_min?.toLocaleString() || '?'} – $${project.budget_max?.toLocaleString() || '?'}`
                          : 'Budget not specified'} •{' '}
                        Posted {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild className="bg-teal-600 hover:bg-teal-700">
                      <Link href={`/dashboard/contractor/projects/${project.id}`}>View & Bid</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Bids */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">My Bids</h2>
        {!myBids?.length ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="py-8 text-center text-slate-400">No bids submitted yet.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myBids.map(bid => (
              <Card key={bid.id} className="bg-slate-900 border-slate-700">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{bid.projects?.title}</p>
                      <p className="text-slate-400 text-sm">
                        ${bid.amount.toLocaleString()} • {bid.timeline_days} days •{' '}
                        {new Date(bid.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={bid.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
