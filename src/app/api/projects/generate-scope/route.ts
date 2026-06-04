import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set')
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500 })
  }

  const { projectId, projectType, description, propertyAddress, unitNumber, photoUrls } = await req.json()

  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const photoBlocks = (photoUrls || []).map((url: string) => ({
    type: 'image' as const,
    source: { type: 'url' as const, url },
  }))

  const datePrepared = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          temperature: 0,
          messages: [{
            role: 'user',
            content: [
              ...photoBlocks,
              {
                type: 'text',
                text: `You are a professional construction estimator writing a Scope of Work for a multifamily property repair job.

Project Type: ${projectType}
Property: ${propertyAddress}${unitNumber ? `\nUnit: ${unitNumber}` : ''}
Issue Description (from property manager): ${description}
Date Prepared: ${datePrepared}

Generate a professional Scope of Work a licensed contractor can act on immediately. Use this exact structure:

**Date Prepared:** ${datePrepared}

## Project Overview
[2-3 sentences summarizing the job professionally]

## Scope of Work
[Numbered list of specific tasks in order]

## Materials Required
[Bullet list with estimated quantity and unit cost for each item, e.g. "- 12x 4'x8' drywall sheets — ~$15/sheet (~$180)"]

## Labor Requirements
[Trade skills needed, crew size, and estimated hours only — do NOT include cost figures here, those go in Total Cost Summary]

---

## Total Cost Summary
| | Estimated Cost |
|---|---|
| Materials | $X |
| Labor | $X |
| Profit Margin (30%) | $X |
| **TOTAL** | **$X** |

> ⚠️ This estimate is for budgeting purposes only. Final pricing is determined by contractor bids. Costs reflect current regional market rates and may vary based on site conditions, material availability, and contractor overhead.

## Site Safety Requirements
[Relevant OSHA or safety considerations]

## Cleanup & Disposal
[Debris removal, haul-away, site restoration]

## Warranty Expectations
[Standard warranty language for this type of work]

Rules:
- Write for a licensed contractor, not a homeowner
- Be specific and technical where photos allow
- If photos are unclear, note what contractor should inspect on-site
- Use contractor/trade pricing for materials (not retail), then add 12% to the materials subtotal for waste, overages, and price fluctuation. Round to nearest $5.
- Use these base labor rates by trade ($/hr, US national average, 2025):
  • Plumber: $95/hr | Electrician: $105/hr | HVAC Tech: $100/hr | Drywall/Painter: $65/hr | Flooring: $70/hr | Roofer: $80/hr | General Labor: $55/hr | Carpenter: $75/hr | Landscaper: $50/hr
  Estimate hours from the scope steps, then add 25% to the labor subtotal for mobilization, supervision, and scheduling overhead. Round to nearest $5.
- Always present a single cost figure — never a range. Use the calculated totals with buffers applied. Do not hedge or qualify the numbers.
- In the Total Cost Summary: calculate the Profit Margin as exactly 30% of the combined Materials + Labor subtotal. Round to nearest $5. The TOTAL is Materials + Labor + Profit Margin.
- The Total Cost Summary table MUST always appear at the end — never omit it`,
              },
            ],
          }],
        })

        let fullText = ''

        for await (const event of messageStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullText += event.delta.text
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }

        // Save completed SOW to Supabase
        if (projectId && fullText) {
          const admin = createAdminClient()
          await admin.from('projects').update({
            scope_of_work: fullText,
            scope_generated_at: new Date().toISOString(),
          }).eq('id', projectId)
        }

        controller.close()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('SOW generation error:', message)
        controller.enqueue(encoder.encode(`\n\n__SOW_ERROR__: ${message}`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
