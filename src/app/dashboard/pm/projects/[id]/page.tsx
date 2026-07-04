import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import PublishProjectButton from '@/components/PublishProjectButton'
import SOWViewer from '@/components/SOWViewer'
import CompleteProjectButton from '@/components/CompleteProjectButton'
import LeaveReviewButton from '@/components/LeaveReviewButton'
import { PROJECT_TYPE_LABELS, JOB_CATEGORY_LABELS, type JobCategory } from '@/lib/types'
import PreBidQA from '@/components/PreBidQA'

export default async function PMProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') redirect('/login')

  const { data: project } = await admin.from('projects')
    .select('*, properties(*), project_photos(*), bids(id, status, contractor_user_id)')
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)
    .single()

  if (!project) notFound()

  // For completed projects, fetch awarded contractor name + check for existing rating
  const awardedBid = project.bids?.find((b: { status: string; contractor_user_id: string }) => b.status === 'awarded')
  let contractorName = 'the contractor'
  let existingRating = null

  if (project.status === 'completed' && awardedBid) {
    const [{ data: cp }, { data: rating }] = await Promise.all([
      admin.from('contractor_profiles').select('company_name').eq('user_id', awardedBid.contractor_user_id).maybeSingle(),
      admin.from('ratings').select('id').eq('project_id', project.id).eq('rated_by', user.id).maybeSingle(),
    ])
    if (cp?.company_name) contractorName = cp.company_name
    existingRating = rating
  }

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
          {project.status === 'draft' && project.scope_of_work && (
            <PublishProjectButton projectId={project.id} />
          )}
          {(project.status === 'draft' || project.status === 'open') && (
            <Link
              href={`/dashboard/pm/projects/${project.id}/edit`}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.82 0.01 252)', background: 'oklch(0.20 0.022 252)' }}
            >
              ✏️ Edit
            </Link>
          )}
          {project.status === 'draft' && !project.scope_of_work && (
            <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'oklch(0.22 0.06 75)', color: 'oklch(0.75 0.12 75)' }}>
              Generate a SOW before posting
            </span>
          )}
          {project.status === 'open' && (
            <Link
              href={`/dashboard/pm/projects/${project.id}/bids`}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'oklch(0.57 0.135 183)' }}
            >
              Review Bids ({project.bids?.length || 0})
            </Link>
          )}
          {project.status === 'awarded' && (
            <CompleteProjectButton projectId={project.id} />
          )}
          {project.status === 'completed' && awardedBid && !existingRating && (
            <LeaveReviewButton
              projectId={project.id}
              contractorUserId={awardedBid.contractor_user_id}
              contractorName={contractorName}
            />
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

      {/* Pre-work photos */}
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

      {/* Completion photos — shown when contractor has uploaded them */}
      {project.project_photos?.filter((p: { photo_type?: string }) => p.photo_type === 'completion').length > 0 && (
        <Card className="bg-slate-900 border-slate-700" style={{ borderColor: 'oklch(0.35 0.10 160)' }}>
          <CardHeader>
            <CardTitle className="text-white text-base">✅ Completion Photos</CardTitle>
            <p className="text-xs mt-0.5 text-slate-400">Uploaded by the contractor upon job completion.</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {project.project_photos
                .filter((p: { photo_type?: string }) => p.photo_type === 'completion')
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

      {/* Pre-bid Q&A — visible for open projects */}
      {project.status === 'open' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
            <p className="text-sm font-semibold text-white">💬 Pre-Bid Questions</p>
            <p className="text-xs mt-0.5" style={{ color: 'oklch(0.50 0.02 252)' }}>
              Questions from contractors before they submit a bid.
            </p>
          </div>
          <PreBidQA projectId={project.id} currentUserId={user.id} />
        </div>
      )}
    </div>
  )
}
