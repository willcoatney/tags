import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/StatusBadge'
import { PROJECT_TYPE_LABELS } from '@/lib/types'

export default async function PMProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') redirect('/login')

  const { data: project } = await admin.from('projects')
    .select('*, properties(*), project_photos(*), bids(*, user_profiles(full_name, email), contractor_profiles(company_name))')
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)
    .single()

  if (!project) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-slate-400 mt-1">
            {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]} •{' '}
            {project.properties?.name} — {project.properties?.address}, {project.properties?.city}
          </p>
        </div>
        <div className="flex gap-2">
          {project.status === 'open' && (
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href={`/dashboard/pm/projects/${project.id}/bids`}>Review Bids ({project.bids?.length || 0})</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="border-slate-600 text-slate-300">
            <Link href="/dashboard/pm">← Back</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader><CardTitle className="text-white text-base">Description</CardTitle></CardHeader>
          <CardContent><p className="text-slate-300 whitespace-pre-wrap">{project.description}</p></CardContent>
        </Card>
        {(project.budget_min || project.budget_max) && (
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader><CardTitle className="text-white text-base">Budget</CardTitle></CardHeader>
            <CardContent>
              <p className="text-teal-400 text-lg font-semibold">
                {project.budget_min ? `$${project.budget_min.toLocaleString()}` : ''}{' '}
                {project.budget_min && project.budget_max ? '–' : ''}{' '}
                {project.budget_max ? `$${project.budget_max.toLocaleString()}` : ''}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {project.project_photos?.length > 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader><CardTitle className="text-white text-base">Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {project.project_photos.map((photo: { id: string; public_url: string }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={photo.id} src={photo.public_url} alt="" className="w-32 h-32 object-cover rounded border border-slate-600" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {project.scope_of_work && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader><CardTitle className="text-white text-base">Scope of Work</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-slate-300 whitespace-pre-wrap text-sm font-sans leading-relaxed">{project.scope_of_work}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
