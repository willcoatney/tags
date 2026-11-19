'use client'

import { useState } from 'react'

type Tab = 'bathtub' | 'roof'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'bathtub', label: 'Bathtub Replacement', icon: '🛁' },
  { id: 'roof', label: 'Roof Leak Repair', icon: '🏠' },
]

function BathtubShowcase() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'oklch(0.13 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)', background: 'oklch(0.16 0.022 252)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'oklch(0.57 0.135 183)' }} />
          <span className="text-xs font-semibold text-white">Generated Scope of Work</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.18 0.06 160)', color: 'oklch(0.70 0.13 160)' }}>● Ready</span>
      </div>

      <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="mb-3">
          <p className="text-sm font-bold text-white leading-tight">Bathtub Replacement</p>
          <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>Plumbing · 2 photos attached</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl overflow-hidden aspect-[4/3]" style={{ border: '1px solid oklch(0.27 0.022 252)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo-bathtub-1.jpg" alt="Bathtub — overhead view showing rusted drain" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-xl overflow-hidden aspect-[4/3]" style={{ border: '1px solid oklch(0.27 0.022 252)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo-bathtub-2.jpg" alt="Bathtub — side view showing rust and deterioration" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="rounded-lg px-3 py-2 text-xs italic" style={{ background: 'oklch(0.17 0.022 252)', color: 'oklch(0.62 0.02 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
          &ldquo;I need to remove and replace this bathtub. The bottom is completely rusted out around the drain.&rdquo;
        </div>
      </div>

      <div className="p-5 space-y-4 text-sm" style={{ color: 'oklch(0.72 0.015 252)' }}>
        <div>
          <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>Project Overview</p>
          <p className="leading-relaxed text-sm" style={{ color: 'oklch(0.65 0.015 252)' }}>Remove and replace existing 60&quot; alcove bathtub. Existing tub shows failed drain assembly and rust-through at the basin floor. Replacement tub to be installed in same location with new drain, overflow, and supply connections. <em>Note: If concealed moisture damage or subfloor deterioration is found during removal, additional remediation will be required before installation — see Exclusions.</em></p>
        </div>
        <div>
          <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>Scope of Work</p>
          <ol className="space-y-1.5 list-decimal list-inside text-sm" style={{ color: 'oklch(0.65 0.015 252)' }}>
            <li>Shut off water supply; confirm no active flow at supply valves</li>
            <li>Remove tub surround panels to expose wall flanges and plumbing access</li>
            <li>Disconnect drain assembly, overflow, and supply lines</li>
            <li>Remove existing tub; <strong className="text-white">inspect subfloor and wall backer for moisture damage</strong> — document findings before proceeding</li>
            <li>Set and secure new 60&quot; alcove tub per manufacturer specs and local plumbing code</li>
            <li>Reconnect drain assembly and supply connections; pressure-test before closing wall</li>
            <li>Reinstall surround panels; caulk all seams per manufacturer specs</li>
          </ol>
          <p className="text-xs mt-2 italic" style={{ color: 'oklch(0.52 0.015 252)' }}>Permit note: Plumbing modifications may require a permit in your jurisdiction — verify with local building department before work begins.</p>
        </div>
        <div>
          <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.65 0.10 25)' }}>Exclusions</p>
          <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.58 0.015 252)' }}>Structural subfloor repair beyond minor patching; wall tile replacement; mold remediation; fixture upgrades (faucet, showerhead) unless separately specified. Any concealed conditions discovered during demolition will be documented and quoted separately before proceeding.</p>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.30 0.08 145)' }}>
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide" style={{ background: 'oklch(0.20 0.07 145)', color: 'oklch(0.75 0.15 145)' }}>Estimated Project Cost</div>
          <table className="w-full text-sm">
            <tbody>
              {[['Materials', '$850'], ['Labor', '$1,200'], ['TOTAL', '$2,050']].map(([label, val], i) => (
                <tr key={label} style={{ background: i === 2 ? 'oklch(0.20 0.07 145)' : i % 2 === 0 ? 'oklch(0.15 0.04 145)' : 'oklch(0.16 0.04 145)', borderTop: i === 2 ? '1px solid oklch(0.30 0.08 145)' : undefined }}>
                  <td className={`px-4 py-2 text-xs ${i === 2 ? 'font-bold' : ''}`} style={{ color: i === 2 ? 'oklch(0.90 0.12 145)' : 'oklch(0.75 0.02 252)' }}>{label}</td>
                  <td className={`px-4 py-2 text-xs ${i === 2 ? 'font-bold' : ''} text-right`} style={{ color: i === 2 ? 'oklch(0.90 0.12 145)' : 'white' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          Generated in 3.8s · Ready for your review
        </div>
      </div>
    </div>
  )
}

function RoofLeakShowcase() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'oklch(0.13 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)', background: 'oklch(0.16 0.022 252)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'oklch(0.57 0.135 183)' }} />
          <span className="text-xs font-semibold text-white">Generated Scope of Work</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.18 0.06 160)', color: 'oklch(0.70 0.13 160)' }}>● Ready</span>
      </div>

      <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <div className="mb-3">
          <p className="text-sm font-bold text-white leading-tight">Roof Leak — Master Bedroom</p>
          <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>Roofing · 4 photos attached</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.27 0.022 252)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo-roof-1.jpg" alt="Roof — view from ground showing rear elevation" className="w-full h-24 object-cover" />
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.27 0.022 252)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo-roof-2.jpg" alt="Roof — flashing detail at chimney, potential leak origin" className="w-full h-24 object-cover" />
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.27 0.022 252)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo-ceiling-1.jpg" alt="Bedroom ceiling — water stain approx 2 ft wide" className="w-full h-24 object-cover" />
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.27 0.022 252)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo-ceiling-2.jpg" alt="Bedroom ceiling — close-up of stain edge with active moisture" className="w-full h-24 object-cover" />
          </div>
        </div>
        <div className="rounded-lg px-3 py-2 text-xs italic" style={{ background: 'oklch(0.17 0.022 252)', color: 'oklch(0.62 0.02 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
          &ldquo;Water stain on the bedroom ceiling, about 2 feet wide. Only leaks during heavy rain. Roof is about 12 years old.&rdquo;
        </div>
      </div>

      <div className="p-5 space-y-4 text-sm" style={{ color: 'oklch(0.72 0.015 252)' }}>
        <div>
          <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>Project Overview</p>
          <p className="leading-relaxed text-sm" style={{ color: 'oklch(0.65 0.015 252)' }}>Investigate and repair active roof leak affecting master bedroom ceiling. Based on symptoms — leak only during heavy rain, localized stain — the likely source is failed flashing, damaged shingles, or compromised underlayment. Full diagnosis requires on-site inspection. <em>Note: If attic moisture damage, mold, or structural rot is found during inspection, additional remediation will be required — see Exclusions.</em></p>
        </div>
        <div>
          <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.57 0.135 183)' }}>Scope of Work</p>
          <ol className="space-y-1.5 list-decimal list-inside text-sm" style={{ color: 'oklch(0.65 0.015 252)' }}>
            <li>Inspect roof surface above master bedroom for missing/lifted shingles and cracked flashing</li>
            <li>Check all pipe penetrations, vents, and valleys in affected area</li>
            <li>Inspect attic space for moisture damage, mold, or rot — <strong className="text-white">document all concealed conditions before proceeding</strong></li>
            <li>Remove and replace damaged shingles (est. 15–25 SF); replace failed step or counter flashing</li>
            <li>Install new self-adhering ice-and-water shield underlayment beneath repaired section</li>
            <li>Seal all penetrations with roofing-grade sealant</li>
            <li>Test repaired area with controlled water application before closing</li>
          </ol>
          <p className="text-xs mt-2 italic" style={{ color: 'oklch(0.52 0.015 252)' }}>Permit note: Structural roof repairs may require a permit in your jurisdiction — verify with local building department before work begins.</p>
        </div>
        <div>
          <p className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: 'oklch(0.65 0.10 25)' }}>Exclusions</p>
          <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.58 0.015 252)' }}>Interior ceiling/drywall repair and repainting; mold remediation; full roof replacement; gutters or fascia unless directly related to leak source. Any concealed conditions discovered during inspection will be documented and quoted separately before proceeding.</p>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.30 0.08 145)' }}>
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide" style={{ background: 'oklch(0.20 0.07 145)', color: 'oklch(0.75 0.15 145)' }}>Estimated Project Cost</div>
          <table className="w-full text-sm">
            <tbody>
              {[['Materials', '$620'], ['Labor', '$980'], ['TOTAL', '$1,600']].map(([label, val], i) => (
                <tr key={label} style={{ background: i === 2 ? 'oklch(0.20 0.07 145)' : i % 2 === 0 ? 'oklch(0.15 0.04 145)' : 'oklch(0.16 0.04 145)', borderTop: i === 2 ? '1px solid oklch(0.30 0.08 145)' : undefined }}>
                  <td className={`px-4 py-2 text-xs ${i === 2 ? 'font-bold' : ''}`} style={{ color: i === 2 ? 'oklch(0.90 0.12 145)' : 'oklch(0.75 0.02 252)' }}>{label}</td>
                  <td className={`px-4 py-2 text-xs ${i === 2 ? 'font-bold' : ''} text-right`} style={{ color: i === 2 ? 'oklch(0.90 0.12 145)' : 'white' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          Generated in 4.1s · Ready for your review
        </div>
      </div>
    </div>
  )
}

export default function ShowcaseTabs() {
  const [active, setActive] = useState<Tab>('bathtub')

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: active === tab.id ? 'oklch(0.57 0.135 183)' : 'oklch(0.20 0.022 252)',
              color: active === tab.id ? 'white' : 'oklch(0.60 0.02 252)',
              border: `1px solid ${active === tab.id ? 'oklch(0.57 0.135 183)' : 'oklch(0.27 0.025 252)'}`,
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active showcase */}
      {active === 'bathtub' ? <BathtubShowcase /> : <RoofLeakShowcase />}
    </div>
  )
}
