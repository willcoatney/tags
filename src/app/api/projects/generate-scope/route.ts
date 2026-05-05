import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set')
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const { projectId, projectType, description, propertyAddress, photoUrls } = await req.json()

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const photoBlocks = (photoUrls || []).map((url: string) => ({
      type: 'image' as const,
      source: { type: 'url' as const, url },
    }))

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          ...photoBlocks,
          {
            type: 'text',
            text: `You are a professional construction estimator writing a Scope of Work for a multifamily property repair job.

Project Type: ${projectType}
Property: ${propertyAddress}
Issue Description (from property manager): ${description}

Generate a professional Scope of Work a licensed contractor can act on immediately. Use this exact structure:

## Project Overview
[2-3 sentences summarizing the job professionally]

## Scope of Work
[Numbered list of specific tasks in order]

## Materials Required
[Bullet list of materials and quantities where determinable]

## Labor Requirements
[Trade skills needed, crew size estimate, special equipment]

## Site Safety Requirements
[Relevant OSHA or safety considerations]

## Cleanup & Disposal
[Debris removal, haul-away, site restoration]

## Warranty Expectations
[Standard warranty language for this type of work]

Rules:
- Do NOT include pricing or cost estimates
- Write for a licensed contractor, not a homeowner
- Be specific and technical where photos allow
- If photos are unclear, note what contractor should inspect on-site`,
          },
        ],
      }],
    })

    const sow = (response.content[0] as { type: string; text: string }).text

    if (projectId) {
      const admin = createAdminClient()
      await admin.from('projects').update({
        scope_of_work: sow,
        scope_generated_at: new Date().toISOString(),
      }).eq('id', projectId)
    }

    return NextResponse.json({ sow })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('SOW generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
