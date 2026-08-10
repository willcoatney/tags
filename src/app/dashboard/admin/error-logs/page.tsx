'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface ErrorLog {
  id: string
  created_at: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  metadata: Record<string, unknown> | null
  route: string | null
  user_id: string | null
  organization_id: string | null
  resolved: boolean
}

interface FetchResult {
  logs: ErrorLog[]
  total: number
  page: number
  pages: number
}

type FilterTab = 'all' | 'critical' | 'high' | 'unresolved'

const SEVERITY_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  critical: { bg: 'oklch(0.18 0.08 25)',  color: 'oklch(0.70 0.20 25)',  border: 'oklch(0.30 0.12 25)',  label: 'Critical' },
  high:     { bg: 'oklch(0.18 0.07 55)',  color: 'oklch(0.72 0.18 55)',  border: 'oklch(0.30 0.11 55)',  label: 'High'     },
  medium:   { bg: 'oklch(0.18 0.06 75)',  color: 'oklch(0.72 0.18 75)',  border: 'oklch(0.28 0.10 75)',  label: 'Medium'   },
  low:      { bg: 'oklch(0.16 0.06 220)', color: 'oklch(0.62 0.14 220)', border: 'oklch(0.26 0.10 220)', label: 'Low'      },
}

const CATEGORY_COLORS: Record<string, string> = {
  stripe: 'oklch(0.65 0.15 280)',
  sms:    'oklch(0.65 0.15 183)',
  email:  'oklch(0.65 0.15 150)',
  db:     'oklch(0.65 0.15 25)',
  auth:   'oklch(0.72 0.18 75)',
  api:    'oklch(0.65 0.02 252)',
}

const CARD = { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }

function SeverityBadge({ severity }: { severity: string }) {
  const s = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.low
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium uppercase tracking-wide"
      style={{ background: 'oklch(0.20 0.022 252)', color: CATEGORY_COLORS[category] ?? 'oklch(0.65 0.02 252)' }}>
      {category}
    </span>
  )
}

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [resolving, setResolving] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' })
      if (filter === 'critical') params.set('severity', 'critical')
      if (filter === 'high') params.set('severity', 'high')
      if (filter === 'unresolved') params.set('resolved', 'false')

      const res = await fetch(`/api/admin/error-logs?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: FetchResult = await res.json()
      setLogs(data.logs)
      setTotal(data.total)
      setPages(data.pages)
      setLastRefresh(new Date())
    } catch (e) {
      console.error('[error-logs] fetch failed:', e)
      if (!silent) toast.error('Failed to load error logs')
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  // Initial load + when filter/page changes
  useEffect(() => {
    void fetchLogs()
  }, [fetchLogs])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => void fetchLogs(true), 30_000)
    return () => clearInterval(interval)
  }, [fetchLogs])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1)
    setSelected(new Set())
  }, [filter])

  async function handleBulkResolve() {
    if (selected.size === 0) return
    setResolving(true)
    try {
      const res = await fetch('/api/admin/error-logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      if (!res.ok) throw new Error('Failed to resolve')
      toast.success(`Resolved ${selected.size} log${selected.size > 1 ? 's' : ''}`)
      setSelected(new Set())
      await fetchLogs()
    } catch (e) {
      toast.error('Failed to mark as resolved')
      console.error(e)
    } finally {
      setResolving(false)
    }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    const unresolvedIds = logs.filter(l => !l.resolved).map(l => l.id)
    if (selected.size === unresolvedIds.length && unresolvedIds.length > 0) {
      setSelected(new Set())
    } else {
      setSelected(new Set(unresolvedIds))
    }
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'critical', label: '🔴 Critical' },
    { key: 'high', label: '🟠 High' },
    { key: 'unresolved', label: 'Unresolved' },
  ]

  const unresolvedCount = logs.filter(l => !l.resolved).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Error Logs</h1>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
            {total.toLocaleString()} total · auto-refreshes every 30s ·{' '}
            <span style={{ color: 'oklch(0.45 0.015 252)' }}>
              last {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </p>
        </div>
        <button
          onClick={() => void fetchLogs()}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
          style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
        >
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1">
        {TABS.map(tab => {
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150"
              style={{
                color: active ? 'white' : 'oklch(0.60 0.025 252)',
                background: active ? 'oklch(0.22 0.022 252)' : 'transparent',
                border: active ? '1px solid oklch(0.30 0.025 252)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'oklch(0.16 0.06 183)', border: '1px solid oklch(0.28 0.10 183)' }}>
          <span className="text-sm font-medium" style={{ color: 'oklch(0.65 0.14 183)' }}>
            {selected.size} selected
          </span>
          <button
            onClick={handleBulkResolve}
            disabled={resolving}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: 'oklch(0.57 0.135 183)' }}
          >
            {resolving ? 'Resolving…' : 'Mark Resolved'}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm"
            style={{ color: 'oklch(0.50 0.02 252)' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={CARD}>
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: 'oklch(0.50 0.02 252)' }}>Loading…</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-3xl mb-3">✅</div>
            <p className="text-sm font-medium text-white">No errors found</p>
            <p className="text-xs mt-1" style={{ color: 'oklch(0.50 0.02 252)' }}>
              {filter === 'all' ? 'The platform is running clean.' : 'No errors match this filter.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === unresolvedCount && unresolvedCount > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                    style={{ accentColor: 'oklch(0.57 0.135 183)' }}
                  />
                </th>
                {['Timestamp', 'Category', 'Severity', 'Message', 'Route', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'oklch(0.50 0.02 252)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => {
                const isExpanded = !!expanded[log.id]
                const isSelected = selected.has(log.id)
                const isLast = i === logs.length - 1

                return [
                  <tr
                    key={log.id}
                    onClick={() => setExpanded(e => ({ ...e, [log.id]: !e[log.id] }))}
                    className="cursor-pointer transition-colors duration-100 hover:bg-white/5"
                    style={{
                      borderBottom: (!isExpanded && !isLast) ? '1px solid oklch(0.20 0.022 252)' : 'none',
                      background: isSelected ? 'oklch(0.16 0.06 183 / 0.3)' : undefined,
                    }}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {!log.resolved && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(log.id)}
                          style={{ accentColor: 'oklch(0.57 0.135 183)' }}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'oklch(0.50 0.02 252)' }}>
                      <div className="text-xs">{new Date(log.created_at).toLocaleDateString()}</div>
                      <div className="text-xs">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={log.category} />
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={log.severity} />
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-white text-sm truncate">{log.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      {log.route ? (
                        <span className="text-xs font-mono" style={{ color: 'oklch(0.55 0.02 252)' }}>
                          {log.route}
                        </span>
                      ) : (
                        <span style={{ color: 'oklch(0.40 0.015 252)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.resolved ? (
                        <span className="text-xs font-medium" style={{ color: 'oklch(0.60 0.13 155)' }}>Resolved</span>
                      ) : (
                        <span className="text-xs font-medium" style={{ color: 'oklch(0.65 0.15 25)' }}>Open</span>
                      )}
                    </td>
                  </tr>,
                  isExpanded ? (
                    <tr key={`${log.id}-detail`}
                      style={{ borderBottom: !isLast ? '1px solid oklch(0.20 0.022 252)' : 'none' }}>
                      <td />
                      <td colSpan={6} className="px-4 pb-4 pt-0">
                        <div className="rounded-xl p-4 space-y-3"
                          style={{ background: 'oklch(0.14 0.022 252)', border: '1px solid oklch(0.20 0.022 252)' }}>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1"
                              style={{ color: 'oklch(0.50 0.02 252)' }}>Full Message</p>
                            <p className="text-sm text-white">{log.message}</p>
                          </div>
                          {log.metadata && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide mb-1"
                                style={{ color: 'oklch(0.50 0.02 252)' }}>Metadata / Stack Trace</p>
                              <pre className="text-xs rounded-lg p-3 overflow-x-auto"
                                style={{
                                  background: 'oklch(0.11 0.018 252)',
                                  color: 'oklch(0.70 0.10 183)',
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}>
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>
                            {log.user_id && <span>User: <code className="text-white">{log.user_id}</code></span>}
                            {log.organization_id && <span>Org: <code className="text-white">{log.organization_id}</code></span>}
                            <span>ID: <code style={{ color: 'oklch(0.55 0.02 252)' }}>{log.id}</code></span>
                          </div>
                          {!log.resolved && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                setResolving(true)
                                try {
                                  const res = await fetch('/api/admin/error-logs', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ids: [log.id] }),
                                  })
                                  if (!res.ok) throw new Error('Failed')
                                  toast.success('Marked as resolved')
                                  await fetchLogs()
                                } catch {
                                  toast.error('Failed to resolve')
                                } finally {
                                  setResolving(false)
                                }
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all"
                              style={{ background: 'oklch(0.22 0.06 155)' }}
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : null
                ]
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'oklch(0.50 0.02 252)' }}>
            Page {page} of {pages} · {total.toLocaleString()} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-40"
              style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-40"
              style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
