import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/StatusBadge'
import { PROJECT_TYPE_LABELS } from '@/lib/types'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')

  const [
    { data: allProjects },
    { data: allUsers },
    { data: allBids },
    { data: pendingContractors },
  ] = await Promise.all([
    admin.from('projects').select('*, properties(name, city, state), bids(id)').order('created_at', { ascending: false }).limit(50),
    admin.from('user_profiles').select('*, organizations(name)').order('created_at', { ascending: false }),
    admin.from('bids').select('id, status'),
    admin.from('contractor_profiles').select('*, user_profiles(full_name, email)').eq('approval_status', 'pending'),
  ])

  const statusCounts = {
    draft: allProjects?.filter(p => p.status === 'draft').length || 0,
    open: allProjects?.filter(p => p.status === 'open').length || 0,
    awarded: allProjects?.filter(p => p.status === 'awarded').length || 0,
    completed: allProjects?.filter(p => p.status === 'completed').length || 0,
  }
  const totalBids = allBids?.length || 0
  const awardedBids = allBids?.filter(b => b.status === 'awarded').length || 0
  const conversionRate = totalBids ? ((awardedBids / totalBids) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open Projects', value: statusCounts.open },
          { label: 'Total Bids', value: totalBids },
          { label: 'Conversion Rate', value: `${conversionRate}%` },
          { label: 'Pending Contractors', value: pendingContractors?.length || 0 },
        ].map(stat => (
          <Card key={stat.label} className="bg-slate-900 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-teal-400">{stat.value}</div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Contractors */}
      {(pendingContractors?.length || 0) > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">⚠ Pending Contractor Approvals ({pendingContractors?.length})</h2>
            <Button asChild variant="outline" className="border-slate-600 text-slate-300">
              <Link href="/dashboard/admin/contractors">View All</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {pendingContractors?.slice(0, 3).map(contractor => (
              <Card key={contractor.id} className="bg-slate-900 border-yellow-700 border">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{contractor.company_name}</p>
                      <p className="text-slate-400 text-sm">
                        {(contractor.user_profiles as { full_name?: string; email?: string })?.full_name} •{' '}
                        Services: {contractor.services?.map((s: string) => PROJECT_TYPE_LABELS[s as keyof typeof PROJECT_TYPE_LABELS]).join(', ')} •{' '}
                        ZIPs: {contractor.service_zip_codes?.join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form action={`/api/contractors/${contractor.id}/approve`} method="POST">
                        <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                      </form>
                      <form action={`/api/contractors/${contractor.id}/reject`} method="POST">
                        <Button type="submit" size="sm" variant="destructive">Reject</Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Projects */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">All Projects</h2>
        <Card className="bg-slate-900 border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Property', 'Title', 'Type', 'Status', 'Bids', 'Created'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allProjects?.map(project => (
                  <tr key={project.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-300">{project.properties?.name}</td>
                    <td className="px-4 py-3 text-white">{project.title}</td>
                    <td className="px-4 py-3 text-slate-300">{PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]}</td>
                    <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                    <td className="px-4 py-3 text-slate-300">{project.bids?.length || 0}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(project.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* All Users */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">All Users</h2>
        <Card className="bg-slate-900 border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Name', 'Email', 'Role', 'Organization', 'Joined'].map(h => (
                    <th key={h} className="text-left text-slate-400 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allUsers?.map(u => (
                  <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-white">{u.full_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{u.email}</td>
                    <td className="px-4 py-3"><span className="capitalize text-slate-300">{u.role}</span></td>
                    <td className="px-4 py-3 text-slate-300">{(u.organizations as { name?: string })?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
