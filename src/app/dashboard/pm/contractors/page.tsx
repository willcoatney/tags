'use client'

import { useState, useEffect } from 'react'
import { PROJECT_TYPE_LABELS, type ProjectType } from '@/lib/types'

interface Contractor {
  id: string
  userId: string
  companyName: string
  services: ProjectType[]
  serviceStates: string[]
  rating: { avg: number; count: number } | null
}

const CARD = { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }

function StarRating({ avg, count }: { avg: number; count: number }) {
  const full = Math.floor(avg)
  const half = avg - full >= 0.5
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <span key={i} className="text-sm" style={{ color: i <= full ? 'oklch(0.80 0.18 75)' : i === full + 1 && half ? 'oklch(0.65 0.15 75)' : 'oklch(0.30 0.02 252)' }}>★</span>
        ))}
      </div>
      <span className="text-xs" style={{ color: 'oklch(0.55 0.02 252)' }}>{avg.toFixed(1)} ({count} review{count !== 1 ? 's' : ''})</span>
    </div>
  )
}

export default function ContractorDirectoryPage() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  useEffect(() => {
    const url = activeFilter === 'all' ? '/api/pm/contractors' : `/api/pm/contractors?service=${activeFilter}`
    setLoading(true)
    fetch(url).then(r => r.json()).then(data => {
      setContractors(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [activeFilter])

  const serviceTypes = Object.entries(PROJECT_TYPE_LABELS) as [ProjectType, string][]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Contractor Directory</h1>
        <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
          Browse approved contractors on TAGS. Filter by service type to find the right fit.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{
            background: activeFilter === 'all' ? 'oklch(0.57 0.135 183)' : 'oklch(0.20 0.022 252)',
            color: activeFilter === 'all' ? 'white' : 'oklch(0.60 0.02 252)',
            border: `1px solid ${activeFilter === 'all' ? 'transparent' : 'oklch(0.27 0.022 252)'}`,
          }}>
          All
        </button>
        {serviceTypes.map(([type, label]) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: activeFilter === type ? 'oklch(0.57 0.135 183)' : 'oklch(0.20 0.022 252)',
              color: activeFilter === type ? 'white' : 'oklch(0.60 0.02 252)',
              border: `1px solid ${activeFilter === type ? 'transparent' : 'oklch(0.27 0.022 252)'}`,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-sm" style={{ color: 'oklch(0.45 0.015 252)' }}>Loading contractors…</div>
      ) : contractors.length === 0 ? (
        <div className="rounded-xl py-14 text-center" style={CARD}>
          <p className="text-white font-medium mb-1">No contractors found</p>
          <p className="text-sm" style={{ color: 'oklch(0.45 0.015 252)' }}>
            {activeFilter === 'all' ? 'No approved contractors on the platform yet.' : `No approved contractors for ${PROJECT_TYPE_LABELS[activeFilter as ProjectType]} yet.`}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {contractors.map(c => (
            <div key={c.id} className="rounded-xl p-5" style={CARD}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-white">{c.companyName}</h3>
                  {c.rating ? (
                    <div className="mt-1"><StarRating avg={c.rating.avg} count={c.rating.count} /></div>
                  ) : (
                    <p className="text-xs mt-1" style={{ color: 'oklch(0.40 0.015 252)' }}>No reviews yet</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {c.services.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: 'oklch(0.22 0.04 183)', color: 'oklch(0.65 0.10 183)' }}>
                    {PROJECT_TYPE_LABELS[s]}
                  </span>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>
                Serves: {c.serviceStates.length > 0 ? c.serviceStates.join(', ') : 'No states listed'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
