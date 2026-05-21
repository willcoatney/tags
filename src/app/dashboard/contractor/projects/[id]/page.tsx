'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SOWViewer from '@/components/SOWViewer'
import ProjectMessages from '@/components/ProjectMessages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PROJECT_TYPE_LABELS } from '@/lib/types'
import ContractorMarkDoneButton from '@/components/ContractorMarkDoneButton'

interface Project {
  id: string
  title: string
  project_type: string
  description: string
  budget_min: number | null
  budget_max: number | null
  scope_of_work: string | null
  status: string
  created_at: string
  properties: { city: string; state: string }
  project_photos: { id: string; public_url: string }[]
}

export default function ContractorProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [alreadyBid, setAlreadyBid] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [form, setForm] = useState({ amount: '', timeline_days: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/contractor/projects/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setProject(data.project)
        setAlreadyBid(data.alreadyBid)
        setCurrentUserId(data.userId || '')
      })
  }, [params.id])

  async function handleBid(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/contractor/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: params.id,
        amount: parseFloat(form.amount),
        timeline_days: parseInt(form.timeline_days),
        notes: form.notes || null,
      }),
    })
    if (res.ok) {
      toast.success('Bid submitted!')
      router.push('/dashboard/contractor')
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to submit bid')
      setSubmitting(false)
    }
  }

  if (!project) return <div className="text-slate-400 p-8">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          <p className="text-slate-400 mt-1">
            {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]} •{' '}
            {project.properties?.city}, {project.properties?.state} •{' '}
            {project.budget_min || project.budget_max
              ? `Budget: $${project.budget_min?.toLocaleString() || '?'} – $${project.budget_max?.toLocaleString() || '?'}`
              : 'Budget not specified'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ContractorMarkDoneButton projectId={params.id} status={project.status} />
          <Button asChild variant="outline" className="border-slate-600 text-slate-300">
            <Link href="/dashboard/contractor">← Back</Link>
          </Button>
        </div>
      </div>

      {project.project_photos?.length > 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader><CardTitle className="text-white text-base">Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {project.project_photos.map(photo => (
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

      {/* Message thread */}
      {currentUserId && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader><CardTitle className="text-white text-base">💬 Messages</CardTitle></CardHeader>
          <CardContent className="p-0">
            <ProjectMessages
              projectId={params.id}
              currentUserId={currentUserId}
              currentUserRole="contractor"
            />
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">{alreadyBid ? 'Bid Already Submitted' : 'Submit Your Bid'}</CardTitle>
        </CardHeader>
        <CardContent>
          {alreadyBid ? (
            <p className="text-slate-400">
              {(project.status === 'awarded' || project.status === 'work_complete')
                ? 'You won this bid! Use the button above to mark work done when finished.'
                : 'You have already submitted a bid on this project.'}
            </p>
          ) : (
            <form onSubmit={handleBid} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Your Price ($)</Label>
                  <Input type="number" min="0" step="0.01" required value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Estimated Timeline (days)</Label>
                  <Input type="number" min="1" required value={form.timeline_days}
                    onChange={e => setForm(p => ({ ...p, timeline_days: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Notes / Questions <span className="text-slate-500">optional</span></Label>
                <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3} className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-teal-600 hover:bg-teal-700">
                {submitting ? 'Submitting...' : 'Submit Bid'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
