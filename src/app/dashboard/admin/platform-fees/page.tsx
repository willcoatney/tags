'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// ── Types ────────────────────────────────────────────────────────────────

type FeeStatus = 'not_applicable' | 'charged' | 'pending' | 'failed' | 'waived'
type FilterTab = 'all' | 'charged' | 'pending' | 'failed'

interface FeeRow {
  bid_id: string
  project_title: string
  contractor_name: string
  contractor_email: string
  bid_amount: number
  platform_fee_cents: number | null
  platform_fee_status: FeeStatus
  platform_fee_charged_at: string | null
  platform_fee_failed_at: string | null
}

interface SummaryData {
  totalCollectedCents: number
  pendingCount: number
  failedCount: number
}

// ── Style constants ──────────────────────────────────────────────────────

const CARD = { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }

const FEE_STATUS_STYLES: Record<FeeStatus, { bg: string; color: string; border: string; label: string }> = {
  charged:        { bg: 'oklch(0.17 0.06 155)',  color: 'oklch(0.70 0.17 155)',  border: 'oklch(0.27 0.09 155)',  label: 'Charged'  },
  pending:        { bg: 'oklch(0.18 0.07 75)',   color: 'oklch(0.78 0.18 75)',   border: 'oklch(0.30 0.11 75)',   label: 'Pending'  },
  failed:         { bg: 'oklch(0.18 0.08 25)',   color: 'oklch(0.72 0.20 25)',   border: 'oklch(0.30 0.12 25)',   label: 'Failed'   },
  waived:         { bg: 'oklch(0.17 0.022 252)', color: 'oklch(0.55 0.02 252)',  border: 'oklch(0.25 0.022 252)', label: 'Waived'   },
  not_applicable: { bg: 'oklch(0.15 0.018 252)', color: 'oklch(0.45 0.015 252)', border: 'oklch(0.22 0.018 252)', label: 'N/A'      },
}

// ── Sub-components ───────────────────────────────────────────────────────

function FeeStatusBadge({ status }: { status: FeeStatus }) {
  const s = FEE_STATUS_STYLES[status]
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  )
}

function SummaryCard({ value, label, accent, warn }: { value: string; label: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={CARD}>
      <div className="text-3xl font-bold mb-1" style={{
        color: accent ? 'oklch(0.57 0.135 183)' : warn ? 'oklch(0.75 0.12 75)' : 'white',
      }}>
        {value}
      </div>
      <div className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>{label}</div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────

export default function PlatformFeesPage() {
  const [rows, setRows] = useState<FeeRow[]>([])
  const [summary, setSummary] = useState<SummaryData>({ totalCollectedCents: 0, pendingCount: 0, failedCount: 0 })
  const [filter, setFilter] = useState<FilterTab>('all')
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({})

  const fetchFees = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)

      const res = await fetch(`/api/admin/platform-fees?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { rows: FeeRow[]; summary: SummaryData }
      setRows(data.rows)
      setSummary(data.summary)
      setLastRefresh(new Date())
    } catch (e) {
      console.error('[platform-fees] fetch failed:', e)
      if (!silent) toast.error('Failed to load platform fees')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { void fetchFees() }, [fetchFees])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => void fetchFees(true), 30_000)
    return () => clearInterval(interval)
  }, [fetchFees])

  async function handleRetry(bidId: string) {
    setActionInProgress(prev => ({ ...prev, [bidId]: true }))
    try {
      const res = await fetch('/api/admin/retry-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId }),
      })
      const data = await res.json() as { result?: { status: string }; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Retry failed')
      const status = data.result?.status
      if (status === 'charged') {
        toast.success('Fee charged successfully!')
      } else if (status === 'pending') {
        toast.warning('Fee is pending — contractor has no payment method on file')
      } else {
        toast.error('Charge failed again — check error logs')
      }
      await fetchFees()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Retry failed')
    } finally {
      setActionInProgress(prev => ({ ...prev, [bidId]: false }))
    }
  }

  async function handleWaive(bidId: string) {
    if (!confirm('Waive this platform fee? This cannot be undone.')) return
    setActionInProgress(prev => ({ ...prev, [bidId]: true }))
    try {
      const res = await fetch('/api/admin/waive-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Waive failed')
      toast.success('Fee waived')
      await fetchFees()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Waive failed')
    } finally {
      setActionInProgress(prev => ({ ...prev, [bidId]: false }))
    }
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'charged', label: 'Charged' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
  ]

  const totalCollected = `$${(summary.totalCollectedCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Fees</h1>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
            1.5% per awarded bid · auto-refreshes every 30s ·{' '}
            <span style={{ color: 'oklch(0.45 0.015 252)' }}>
              last {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </p>
        </div>
        <button
          onClick={() => void fetchFees()}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
          style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
        >
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard value={totalCollected} label="Total Collected" accent />
        <SummaryCard value={String(summary.pendingCount)} label="Pending" warn={summary.pendingCount > 0} />
        <SummaryCard value={String(summary.failedCount)} label="Failed" warn={summary.failedCount > 0} />
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

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={CARD}>
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: 'oklch(0.50 0.02 252)' }}>Loading…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-3xl mb-3">💳</div>
            <p className="text-sm font-medium text-white">No fees found</p>
            <p className="text-xs mt-1" style={{ color: 'oklch(0.50 0.02 252)' }}>
              {filter === 'all' ? 'Platform fees appear here when bids are awarded.' : `No ${filter} fees.`}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
                {['Project', 'Contractor', 'Bid Amount', 'Fee', 'Status', 'Date', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'oklch(0.50 0.02 252)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isLast = i === rows.length - 1
                const busy = !!actionInProgress[row.bid_id]
                const canAct = row.platform_fee_status === 'failed' || row.platform_fee_status === 'pending'
                const dateVal = row.platform_fee_charged_at ?? row.platform_fee_failed_at
                const feeDisplay = row.platform_fee_cents != null
                  ? `$${(row.platform_fee_cents / 100).toFixed(2)}`
                  : '—'

                return (
                  <tr
                    key={row.bid_id}
                    className="transition-colors duration-100 hover:bg-slate-800/50"
                    style={{ borderBottom: !isLast ? '1px solid oklch(0.20 0.022 252)' : 'none' }}
                  >
                    <td className="px-4 py-3 text-white font-medium max-w-[180px] truncate">
                      {row.project_title}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{row.contractor_name || '—'}</p>
                      <p className="text-xs" style={{ color: 'oklch(0.50 0.02 252)' }}>{row.contractor_email}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'oklch(0.65 0.02 252)' }}>
                      ${row.bid_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{feeDisplay}</td>
                    <td className="px-4 py-3">
                      <FeeStatusBadge status={row.platform_fee_status} />
                    </td>
                    <td className="px-4 py-3">
                      {dateVal ? (
                        <div>
                          <p className="text-xs" style={{ color: 'oklch(0.55 0.02 252)' }}>
                            {new Date(dateVal).toLocaleDateString()}
                          </p>
                          <p className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>
                            {new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ) : (
                        <span style={{ color: 'oklch(0.40 0.015 252)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canAct ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => void handleRetry(row.bid_id)}
                            disabled={busy}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-40 transition-all"
                            style={{ background: 'oklch(0.57 0.135 183)' }}
                          >
                            {busy ? '…' : 'Retry'}
                          </button>
                          <button
                            onClick={() => void handleWaive(row.bid_id)}
                            disabled={busy}
                            className="px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-40 transition-all"
                            style={{ color: 'oklch(0.60 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
                          >
                            Waive
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'oklch(0.40 0.015 252)' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
