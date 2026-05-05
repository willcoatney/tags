import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/StatusBadge'
import { PROJECT_TYPE_LABELS } from '@/lib/types'

export default async function PMDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'pm') redirect('/login')

  const { data: projects } = await admin.from('projects')
    .select('*, properties(name, city, state), bids(id)')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  const { data: properties } = await admin.from('properties')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  const awardedCount = projects?.filter(p => p.status === 'awarded').length || 0
  const totalBids = projects?.reduce((sum, p) => sum + (p.bids?.length || 0), 0) || 0

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Projects', value: projects?.length || 0 },
          { label: 'Open Bids', value: totalBids },
          { label: 'Awarded Jobs', value: awardedCount },
        ].map(stat => (
          <Card key={stat.label} className="bg-slate-900 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-teal-400">{stat.value}</div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link href="/dashboard/pm/projects/new">+ New Project</Link>
          </Button>
        </div>

        {!projects?.length ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No projects yet.</p>
              <Button asChild className="mt-4 bg-teal-600 hover:bg-teal-700">
                <Link href="/dashboard/pm/projects/new">Post Your First Project</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map(project => (
              <Card key={project.id} className="bg-slate-900 border-slate-700 hover:border-slate-500 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-white">{project.title}</h3>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]} •{' '}
                        {project.properties?.name} ({project.properties?.city}, {project.properties?.state}) •{' '}
                        {project.bids?.length || 0} bid{project.bids?.length !== 1 ? 's' : ''} •{' '}
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="border-slate-600 text-slate-300">
                        <Link href={`/dashboard/pm/projects/${project.id}`}>View</Link>
                      </Button>
                      {project.status === 'open' && (
                        <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                          <Link href={`/dashboard/pm/projects/${project.id}/bids`}>
                            Review Bids ({project.bids?.length || 0})
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Properties */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties?.map(prop => (
            <Card key={prop.id} className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">{prop.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">{prop.address}</p>
                <p className="text-slate-400 text-sm">{prop.city}, {prop.state} {prop.zip}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-slate-800 border-slate-700 border-dashed">
            <CardContent className="py-8 flex items-center justify-center">
              <Button asChild variant="ghost" className="text-teal-400 hover:text-teal-300">
                <Link href="/dashboard/pm/projects/new">+ Add Property</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
