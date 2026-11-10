import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import SOWViewer from '@/components/SOWViewer'
import { PROJECT_TYPE_LABELS, JOB_CATEGORY_LABELS, type JobCategory } from '@/lib/types'

export default async function PMProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') redirect('/login')

  const { data: project } = await admin.from('projects')
    .select('*, properties(*), project_photos(*)')
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)
    .single()

  if (!project) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            {project.unit_number && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'oklch(0.20 0.06 183)', color: 'oklch(0.72 0.12 183)', border: '1px solid oklch(0.30 0.08 183)' }}>
                Unit {project.unit_number}
              </span>
            )}
            <StatusBadge status={project.status} />
          </div>
          <p className="text-slate-400 mt-1">
            {project.job_category && (
              <span className="mr-2 font-medium" style={{ color: 'oklch(0.72 0.12 183)' }}>
                {JOB_CATEGORY_LABELS[project.job_category as JobCategory]}
              </span>
            )}
            {project.job_category && <span className="mr-2">·</span>}
            {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]} •{' '}
            {project.properties?.name} — {project.properties?.address}, {project.properties?.city}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {(project.status === 'draft' || project.status === 'open') && (
            <Link
              href={`/dashboard/pm/projects/${project.id}/edit`}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.82 0.01 252)', background: 'oklch(0.20 0.022 252)' }}
            >
              ✏️ Edit
            </Link>
          )}
          {project.scope_of_work && (
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.82 0.01 252)', background: 'oklch(0.20 0.022 252)' }}
            >
              🖨️ Print SOW
            </button>
          )}
          <Link
            href="/dashboard/pm"
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
          >
            ← Back
          </Link>
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

      {/* Project photos */}
      {project.project_photos?.filter((p: { photo_type?: string }) => !p.photo_type || p.photo_type === 'pre_work').length > 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader><CardTitle className="text-white text-base">📷 Project Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {project.project_photos
                .filter((p: { photo_type?: string }) => !p.photo_type || p.photo_type === 'pre_work')
                .map((photo: { id: string; public_url: string }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={photo.id} src={photo.public_url} alt="" className="w-32 h-32 object-cover rounded border border-slate-600" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {project.scope_of_work && (
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-5">
            <SOWViewer text={project.scope_of_work} />
          </CardContent>
        </Card>
      )}

      {!project.scope_of_work && (
        <div className="rounded-xl p-6 text-center" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
          <p className="text-sm mb-3" style={{ color: 'oklch(0.55 0.02 252)' }}>No Scope of Work generated yet.</p>
          <Link
            href={`/dashboard/pm/projects/${project.id}/edit`}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'oklch(0.57 0.135 183)' }}
          >
            Generate SOW
          </Link>
        </div>
      )}
    </div>
  )
}
