'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import { PROJECT_TYPE_LABELS, type Project, type ProjectStatus } from '@/lib/types'

type ProjectWithMeta = Project & {
  orgName?: string
}

interface Props {
  projects: ProjectWithMeta[]
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' },
  { value: 'cancelled', label: 'Cancelled' },
]

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export default function AMProjectsFeed({ projects }: Props) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [orgFilter, setOrgFilter] = useState('all')

  const uniqueOrgs = Array.from(new Set(projects.map(p => p.orgName).filter(Boolean))) as string[]

  const filtered = projects.filter(p => {
    const statusMatch = statusFilter === 'all' || p.status === statusFilter
    const orgMatch = orgFilter === 'all' || p.orgName === orgFilter
    return statusMatch && orgMatch
  })

  const selectStyle = {
    background: 'oklch(0.20 0.022 252)',
    border: '1px solid oklch(0.27 0.025 252)',
    color: 'oklch(0.82 0.01 252)',
    borderRadius: '0.5rem',
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {uniqueOrgs.length > 0 && (
          <select
            value={orgFilter}
            onChange={e => setOrgFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Properties</option>
            {uniqueOrgs.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        )}

        <span className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Project cards */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl py-12 text-center"
          style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}
        >
          <p className="text-white font-medium">No projects match these filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(project => {
            const property = project.properties as { name: string; city: string } | undefined
            return (
              <Link
                key={project.id}
                href={`/dashboard/pm/projects/${project.id}`}
                className="block rounded-xl px-5 py-4 transition-all duration-150"
                style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'oklch(0.32 0.025 252)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'oklch(0.22 0.022 252)')}
              >
                {project.orgName && (
                  <p className="text-xs mb-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
                    {project.orgName}
                  </p>
                )}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-semibold text-white">{project.title}</span>
                  <StatusBadge status={project.status as ProjectStatus} />
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'oklch(0.20 0.022 252)', color: 'oklch(0.65 0.02 252)' }}
                  >
                    {PROJECT_TYPE_LABELS[project.project_type]}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
                  {property && `${property.name} · ${property.city} · `}
                  {project.bids?.length ?? 0} bid{(project.bids?.length ?? 0) !== 1 ? 's' : ''}
                  {' · '}{timeAgo(project.created_at)}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
