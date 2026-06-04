'use client'

const CONTRACTOR_HIDDEN_SECTIONS = new Set([
  'Materials Required',
  'Labor Requirements',
  'Total Cost Summary',
])

interface Props {
  text: string
  streaming?: boolean
  hideCost?: boolean
  contractorView?: boolean
}

const SECTION_META: Record<string, { icon: string; accent: string; bg: string }> = {
  'Project Overview':       { icon: '📋', accent: 'oklch(0.57 0.135 183)', bg: 'oklch(0.18 0.06 183)' },
  'Scope of Work':          { icon: '🔨', accent: 'oklch(0.62 0.14 230)', bg: 'oklch(0.18 0.05 230)' },
  'Materials Required':     { icon: '📦', accent: 'oklch(0.65 0.14 160)', bg: 'oklch(0.17 0.05 160)' },
  'Labor Requirements':     { icon: '👷', accent: 'oklch(0.72 0.12 75)',  bg: 'oklch(0.20 0.06 75)'  },
  'Total Cost Summary':     { icon: '💰', accent: 'oklch(0.75 0.15 145)', bg: 'oklch(0.17 0.06 145)' },
  'Site Safety Requirements':{ icon: '⚠️', accent: 'oklch(0.75 0.14 55)', bg: 'oklch(0.20 0.06 55)'  },
  'Cleanup & Disposal':     { icon: '🧹', accent: 'oklch(0.65 0.08 252)', bg: 'oklch(0.18 0.04 252)' },
  'Warranty Expectations':  { icon: '🛡️', accent: 'oklch(0.62 0.12 300)', bg: 'oklch(0.18 0.05 300)' },
}

function parseTable(lines: string[]): { headers: string[]; rows: string[][] } | null {
  const tableLines = lines.filter(l => l.trim().startsWith('|'))
  if (tableLines.length < 2) return null
  const parseCells = (line: string) =>
    line.split('|').slice(1, -1).map(c => c.trim()).filter((_, i, arr) => !arr[i].match(/^[-: ]+$/))
  const parseRow = (line: string) =>
    line.split('|').slice(1, -1).map(c => c.trim())
  const rawHeaders = parseRow(tableLines[0])
  const rows = tableLines.slice(2).map(parseCells).filter(r => r.length > 0)
  // Align headers: if first header is empty and rows have one more col, prepend blank
  const colCount = rows[0]?.length || rawHeaders.filter(Boolean).length
  const nonEmpty = rawHeaders.filter(Boolean)
  const headers = rawHeaders.length < colCount && nonEmpty.length < colCount
    ? ['', ...nonEmpty]
    : rawHeaders
  return { headers, rows }
}

function renderContent(content: string, sectionTitle: string) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)

  // Special: cost table
  if (sectionTitle === 'Total Cost Summary') {
    const table = parseTable(lines)
    const note = lines.find(l => l.startsWith('>'))?.replace(/^>\s*⚠️?\s*/, '')
    if (table) {
      return (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.30 0.08 145)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'oklch(0.20 0.07 145)' }}>
                  {table.headers.map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'oklch(0.75 0.15 145)' }}>{h.replace(/\*/g, '')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => {
                  const isTotal = row[0]?.toLowerCase().includes('total')
                  return (
                    <tr key={i} style={{
                      background: isTotal ? 'oklch(0.20 0.07 145)' : i % 2 === 0 ? 'oklch(0.15 0.04 145)' : 'oklch(0.16 0.04 145)',
                      borderTop: isTotal ? '1px solid oklch(0.30 0.08 145)' : undefined,
                    }}>
                      {row.map((cell, j) => (
                        <td key={j} className={`px-4 py-2.5 ${isTotal ? 'font-bold' : 'font-medium'}`}
                          style={{ color: isTotal ? 'oklch(0.90 0.12 145)' : j === 0 ? 'oklch(0.75 0.02 252)' : 'white' }}>
                          {cell.replace(/\*/g, '')}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {note && (
            <p className="text-xs leading-relaxed px-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
              ⚠️ {note}
            </p>
          )}
        </div>
      )
    }
  }

  // Numbered list
  if (lines.some(l => /^\d+\./.test(l))) {
    return (
      <ol className="space-y-2">
        {lines.filter(l => /^\d+\./.test(l)).map((line, i) => {
          const text = line.replace(/^\d+\.\s*/, '')
          return (
            <li key={i} className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: SECTION_META['Scope of Work'].accent }}>
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: 'oklch(0.80 0.01 252)' }}>{text}</span>
            </li>
          )
        })}
      </ol>
    )
  }

  // Bullet list
  if (lines.some(l => l.startsWith('-') || l.startsWith('•'))) {
    return (
      <ul className="space-y-1.5">
        {lines.filter(l => l.startsWith('-') || l.startsWith('•')).map((line, i) => {
          const text = line.replace(/^[-•]\s*/, '')
          return (
            <li key={i} className="flex gap-2.5 items-start text-sm leading-relaxed"
              style={{ color: 'oklch(0.78 0.01 252)' }}>
              <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full"
                style={{ background: SECTION_META[sectionTitle]?.accent || 'oklch(0.57 0.135 183)' }} />
              {text}
            </li>
          )
        })}
      </ul>
    )
  }

  // Plain paragraphs
  return (
    <div className="space-y-2">
      {lines.filter(l => !l.startsWith('>')).map((line, i) => (
        <p key={i} className="text-sm leading-relaxed" style={{ color: 'oklch(0.78 0.01 252)' }}>{line}</p>
      ))}
    </div>
  )
}

export default function SOWViewer({ text, streaming = false, hideCost = false, contractorView = false }: Props) {
  if (!text) return null

  // Extract date prepared
  const dateMatch = text.match(/\*\*Date Prepared:\*\*\s*(.+)/i)
  const datePrepared = dateMatch?.[1]?.trim()

  // Split into sections by ## headings
  const rawSections = text.split(/\n(?=## )/)
  const sections: { title: string; content: string }[] = []

  for (const raw of rawSections) {
    const lines = raw.trim().split('\n')
    const heading = lines[0]?.replace(/^##\s*/, '').trim()
    if (!heading || heading.startsWith('**Date')) continue
    const content = lines.slice(1).join('\n').trim()
    if (heading && content) sections.push({ title: heading, content })
  }

  // If streaming and no sections parsed yet, show raw
  if (streaming && sections.length === 0) {
    return (
      <pre className="text-slate-300 whitespace-pre-wrap text-sm font-sans leading-relaxed">{text}</pre>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3"
        style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-none" style={{ background: 'oklch(0.57 0.135 183)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'oklch(0.57 0.135 183)' }}>
            Scope of Work
          </span>
        </div>
        {datePrepared && (
          <span className="text-xs px-2.5 py-1 rounded-full" style={{
            background: 'oklch(0.20 0.022 252)',
            color: 'oklch(0.55 0.02 252)',
            border: '1px solid oklch(0.27 0.025 252)',
          }}>
            📅 {datePrepared}
          </span>
        )}
      </div>

      {/* Sections */}
      {sections.filter(({ title }) => {
        if (contractorView && CONTRACTOR_HIDDEN_SECTIONS.has(title)) return false
        if (hideCost && title === 'Total Cost Summary') return false
        return true
      }).map(({ title, content }) => {
        const meta = SECTION_META[title] || { icon: '📄', accent: 'oklch(0.65 0.02 252)', bg: 'oklch(0.18 0.022 252)' }
        const isCost = title === 'Total Cost Summary'
        return (
          <div key={title} className="rounded-xl overflow-hidden"
            style={{
              border: `1px solid ${isCost ? 'oklch(0.30 0.08 145)' : 'oklch(0.22 0.022 252)'}`,
              background: isCost ? 'oklch(0.15 0.05 145)' : 'oklch(0.16 0.022 252)',
            }}>
            {/* Section header */}
            <div className="flex items-center gap-2.5 px-4 py-3"
              style={{ borderBottom: `1px solid ${isCost ? 'oklch(0.25 0.07 145)' : 'oklch(0.20 0.022 252)'}` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0"
                style={{ background: meta.bg }}>
                {meta.icon}
              </div>
              <h3 className="font-semibold text-sm" style={{ color: isCost ? 'oklch(0.90 0.12 145)' : 'white' }}>
                {title}
              </h3>
            </div>
            {/* Section content */}
            <div className="px-4 py-3">
              {renderContent(content, title)}
            </div>
          </div>
        )
      })}

      {streaming && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'oklch(0.57 0.135 183)' }} />
          Generating…
        </div>
      )}
    </div>
  )
}
