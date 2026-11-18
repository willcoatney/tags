import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSampleBySlug, SAMPLE_SCOPES } from '@/lib/sample-scopes'
import SOWViewer from '@/components/SOWViewer'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return SAMPLE_SCOPES.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sample = getSampleBySlug(params.slug)
  if (!sample) return {}
  return {
    title: `${sample.title} — Sample Scope of Work | TAGS`,
    description: sample.metaDescription,
  }
}

export default function SampleScopePage({ params }: { params: { slug: string } }) {
  const sample = getSampleBySlug(params.slug)
  if (!sample) notFound()

  const otherSamples = SAMPLE_SCOPES.filter(s => s.slug !== params.slug).slice(0, 3)

  return (
    <div style={{ background: 'oklch(0.13 0.022 252)', minHeight: '100vh', color: 'oklch(0.96 0.008 252)' }}>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ background: 'oklch(0.13 0.022 252 / 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tags-logo.jpg" alt="TAGS" className="h-9 max-w-[120px] object-contain rounded-md" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/samples" className="text-sm" style={{ color: 'oklch(0.57 0.135 183)' }}>← All Samples</Link>
          <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'oklch(0.57 0.135 183)' }}>
            Start Free →
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: 'oklch(0.18 0.06 183)', color: 'oklch(0.72 0.12 183)', border: '1px solid oklch(0.28 0.08 183)' }}>
              Sample Scope of Work
            </span>
            <span className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>{sample.projectType}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{sample.title}</h1>
          <div className="rounded-xl p-4" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'oklch(0.55 0.02 252)' }}>Example project description</p>
            <p className="text-sm italic leading-relaxed" style={{ color: 'oklch(0.68 0.015 252)' }}>&ldquo;{sample.exampleDescription}&rdquo;</p>
          </div>
        </div>

        {/* SOW */}
        <div className="rounded-2xl overflow-hidden mb-10" style={{ border: '1px solid oklch(0.22 0.022 252)' }}>
          <div className="px-5 py-3 flex items-center gap-2"
            style={{ background: 'oklch(0.16 0.022 252)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.57 0.135 183)' }} />
            <span className="text-sm font-semibold text-white">Generated Scope of Work</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'oklch(0.18 0.06 160)', color: 'oklch(0.70 0.13 160)', border: '1px solid oklch(0.28 0.08 160)' }}>
              Sample Only
            </span>
          </div>
          <div className="p-5 md:p-8" style={{ background: 'oklch(0.14 0.022 252)' }}>
            <SOWViewer text={sample.sow} />
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center mb-10"
          style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.30 0.08 183)' }}>
          <h2 className="text-2xl font-bold text-white mb-2">Get a custom scope for your actual project</h2>
          <p className="mb-2" style={{ color: 'oklch(0.60 0.025 252)' }}>
            Upload photos and describe your repair. TAGS generates a professional SOW tailored to your specific project — in under 60 seconds.
          </p>
          <p className="text-sm mb-6" style={{ color: 'oklch(0.48 0.02 252)' }}>
            Property managers: 3 free SOWs to start. Homeowners: $20 per scope.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register/pm"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'oklch(0.57 0.135 183)' }}>
              Start Free — Property Manager →
            </Link>
            <Link href="/register/homeowner"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium"
              style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.75 0.015 252)' }}>
              Homeowner SOW — $20 →
            </Link>
          </div>
        </div>

        {/* Other samples */}
        {otherSamples.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-white mb-3">More sample scopes</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {otherSamples.map(s => (
                <Link key={s.slug} href={`/samples/${s.slug}`}
                  className="rounded-xl p-4 transition-all duration-150 hover:border-[oklch(0.35_0.08_183)]"
                  style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
                  <p className="font-medium text-white text-sm mb-1">{s.title}</p>
                  <p className="text-xs" style={{ color: 'oklch(0.55 0.02 252)' }}>{s.projectType}</p>
                </Link>
              ))}
            </div>
            <div className="mt-3 text-center">
              <Link href="/samples" className="text-sm" style={{ color: 'oklch(0.57 0.135 183)' }}>
                View all sample scopes →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
