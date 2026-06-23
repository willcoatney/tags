'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
      style={{ background: '#0f766e', color: 'white' }}
    >
      🖨️ Print / Save as PDF
    </button>
  )
}
