import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PROJECT_TYPE_LABELS, type ProjectType } from '@/lib/types'
import PrintButton from './PrintButton'

export default async function BidsPrintPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('organization_id, role, full_name').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') redirect('/login')

  const { data: project } = await admin.from('projects')
    .select('*, properties(*), project_photos(*)')
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)
    .single()
  if (!project) notFound()

  const { data: bids } = await admin.from('bids')
    .select('*, user_profiles(full_name, email, phone)')
    .eq('project_id', params.id)
    .order('amount', { ascending: true })

  const bidList = bids || []

  const bidderIds = bidList.map((b: { contractor_user_id: string }) => b.contractor_user_id)
  const { data: contractorProfiles } = bidderIds.length > 0
    ? await admin.from('contractor_profiles').select('user_id, company_name, services, service_states').in('user_id', bidderIds)
    : { data: [] }
  const contractorMap = Object.fromEntries((contractorProfiles || []).map((cp: { user_id: string; company_name: string; services: string[]; service_states: string[] }) => [cp.user_id, cp]))

  const contractorIds = Array.from(new Set(bidList.map((b: { contractor_user_id: string }) => b.contractor_user_id)))
  const { data: allRatings } = contractorIds.length > 0
    ? await admin.from('ratings').select('contractor_user_id, rating').in('contractor_user_id', contractorIds as string[])
    : { data: [] }
  const ratingMap: Record<string, { avg: number; count: number }> = {}
  for (const r of (allRatings || [])) {
    if (!ratingMap[r.contractor_user_id]) ratingMap[r.contractor_user_id] = { avg: 0, count: 0 }
    ratingMap[r.contractor_user_id].count++
    ratingMap[r.contractor_user_id].avg += r.rating
  }
  for (const id of Object.keys(ratingMap)) {
    ratingMap[id].avg = ratingMap[id].avg / ratingMap[id].count
  }

  const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const lowestAmount = bidList.length > 0 ? Math.min(...bidList.map((b: { amount: number }) => b.amount)) : null

  // Parse SOW to get just the Project Overview section
  let sowOverview: string | null = null
  if (project.scope_of_work) {
    const match = project.scope_of_work.match(/1\.\s*Project Overview[\s\S]*?(?=\n2\.|$)/i)
    sowOverview = match ? match[0].replace(/^1\.\s*Project Overview\s*/i, '').trim() : null
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f1f5f9;
          margin: 0;
          padding: 0;
          color: #0f172a;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page-wrap {
          max-width: 850px;
          margin: 32px auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
          overflow: hidden;
        }

        .doc-header {
          background: #0f766e;
          padding: 36px 48px 32px;
          color: white;
        }

        .doc-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .brand {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.85;
          margin-bottom: 6px;
        }

        .doc-title {
          font-size: 26px;
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 4px;
        }

        .doc-subtitle {
          font-size: 14px;
          opacity: 0.75;
          margin: 0;
        }

        .doc-meta {
          font-size: 12px;
          opacity: 0.70;
          text-align: right;
          line-height: 1.6;
        }

        .project-info-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }

        .info-cell {
          background: #f8fafc;
          padding: 16px 24px;
        }

        .info-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .doc-body {
          padding: 36px 48px 48px;
        }

        .section {
          margin-bottom: 36px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          color: #64748b;
          margin: 0 0 14px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }

        /* SOW overview */
        .sow-text {
          font-size: 13.5px;
          line-height: 1.7;
          color: #334155;
          background: #f8fafc;
          border-left: 3px solid #0f766e;
          padding: 14px 18px;
          border-radius: 0 6px 6px 0;
          margin: 0;
        }

        /* Comparison table */
        .bid-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .bid-table thead tr {
          background: #f1f5f9;
        }

        .bid-table th {
          text-align: left;
          padding: 10px 14px;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #64748b;
          border-bottom: 2px solid #e2e8f0;
        }

        .bid-table td {
          padding: 11px 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          vertical-align: top;
        }

        .bid-table tr:last-child td {
          border-bottom: none;
        }

        .bid-table tr.lowest-row td {
          background: #f0fdf4;
        }

        .amount-cell {
          font-weight: 700;
          color: #0f766e;
          font-size: 14px;
        }

        .lowest-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          color: #15803d;
          background: #dcfce7;
          padding: 2px 7px;
          border-radius: 999px;
          margin-left: 6px;
          vertical-align: middle;
        }

        .awarded-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          color: #0369a1;
          background: #e0f2fe;
          padding: 2px 7px;
          border-radius: 999px;
          margin-left: 6px;
          vertical-align: middle;
        }

        /* Individual bid cards */
        .bid-card {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          margin-bottom: 16px;
          overflow: hidden;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .bid-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .bid-card-name {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .bid-card-company {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .bid-card-amount {
          font-size: 22px;
          font-weight: 700;
          color: #0f766e;
          text-align: right;
        }

        .bid-card-timeline {
          font-size: 12px;
          color: #64748b;
          text-align: right;
          margin-top: 2px;
        }

        .bid-card-body {
          padding: 16px 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 24px;
          font-size: 13px;
        }

        .bid-field-label {
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #94a3b8;
          margin-bottom: 3px;
        }

        .bid-field-value {
          color: #1e293b;
          font-size: 13px;
        }

        .bid-notes {
          grid-column: 1 / -1;
          background: #f8fafc;
          border-radius: 6px;
          padding: 10px 14px;
        }

        .stars {
          color: #f59e0b;
          font-size: 13px;
        }

        .no-bids {
          text-align: center;
          padding: 40px;
          color: #64748b;
          font-size: 14px;
        }

        /* Footer */
        .doc-footer {
          padding: 20px 48px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: #94a3b8;
        }

        /* Action bar (screen only) */
        .action-bar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .action-bar-left {
          font-size: 13px;
          color: #94a3b8;
        }

        .action-bar-left a {
          color: #94a3b8;
          text-decoration: none;
        }

        .action-bar-left a:hover {
          color: white;
        }

        /* Print overrides */
        @media print {
          @page {
            size: letter portrait;
            margin: 0.65in 0.75in;
          }

          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .action-bar {
            display: none !important;
          }

          .page-wrap {
            max-width: 100%;
            margin: 0;
            box-shadow: none;
            border-radius: 0;
          }

          .doc-header {
            background: #0f766e !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .bid-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .bid-table {
            break-inside: auto;
          }

          .bid-table tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .doc-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
          }
        }
      `}} />

      {/* Action bar — screen only */}
      <div className="action-bar no-print">
        <span className="action-bar-left">
          <a href={`/dashboard/pm/projects/${params.id}/bids`}>← Back to Bids</a>
          <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
          <span>{project.title}</span>
        </span>
        <PrintButton />
      </div>

      <div className="page-wrap">
        {/* Document header */}
        <div className="doc-header">
          <div className="doc-header-top">
            <div>
              <div className="brand">TAGS — tagyourproject.com</div>
              <h1 className="doc-title">Bid Summary Report</h1>
              <p className="doc-subtitle">{project.title}</p>
            </div>
            <div className="doc-meta">
              Generated {generatedDate}<br />
              {bidList.length} bid{bidList.length !== 1 ? 's' : ''} received<br />
              Prepared by {profile.full_name || 'Property Manager'}
            </div>
          </div>
        </div>

        {/* Project info bar */}
        <div className="project-info-bar">
          <div className="info-cell">
            <div className="info-label">Property</div>
            <div className="info-value">{project.properties?.name}</div>
          </div>
          <div className="info-cell">
            <div className="info-label">Address</div>
            <div className="info-value">
              {project.properties?.address}, {project.properties?.city}, {project.properties?.state}
            </div>
          </div>
          <div className="info-cell">
            <div className="info-label">Project Type</div>
            <div className="info-value">
              {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
              {project.unit_number ? ` · Unit ${project.unit_number}` : ''}
            </div>
          </div>
        </div>

        <div className="doc-body">

          {/* SOW Overview */}
          {sowOverview && (
            <div className="section">
              <div className="section-title">Scope of Work — Project Overview</div>
              <p className="sow-text">{sowOverview}</p>
            </div>
          )}

          {/* Bid Comparison Table */}
          {bidList.length > 0 ? (
            <>
              <div className="section">
                <div className="section-title">Bid Comparison</div>
                <table className="bid-table">
                  <thead>
                    <tr>
                      <th>Contractor</th>
                      <th>Bid Amount</th>
                      <th>Timeline</th>
                      <th>Rating</th>
                      <th>Submitted</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(bidList as Array<{ id: string; contractor_user_id: string; amount: number; timeline_days: number; submitted_at: string; status: string; user_profiles: { full_name: string } }>).map((bid) => {
                      const cp = contractorMap[bid.contractor_user_id]
                      const r = ratingMap[bid.contractor_user_id]
                      const isLowest = bid.amount === lowestAmount && bidList.length > 1
                      const isAwarded = bid.status === 'awarded'
                      return (
                        <tr key={bid.id} className={isLowest ? 'lowest-row' : ''}>
                          <td>
                            <span style={{ fontWeight: 600 }}>
                              {cp?.company_name || bid.user_profiles?.full_name}
                            </span>
                          </td>
                          <td className="amount-cell">
                            ${bid.amount.toLocaleString()}
                            {isLowest && <span className="lowest-badge">Lowest</span>}
                            {isAwarded && <span className="awarded-badge">Awarded</span>}
                          </td>
                          <td>{bid.timeline_days} days</td>
                          <td>
                            {r ? (
                              <span>
                                <span className="stars">{'★'.repeat(Math.round(r.avg))}{'☆'.repeat(5 - Math.round(r.avg))}</span>
                                <span style={{ color: '#64748b', fontSize: 12 }}> {r.avg.toFixed(1)}</span>
                              </span>
                            ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                          </td>
                          <td style={{ color: '#64748b' }}>
                            {new Date(bid.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ textTransform: 'capitalize', color: isAwarded ? '#0369a1' : '#64748b' }}>
                            {bid.status}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Individual Bid Cards */}
              <div className="section">
                <div className="section-title">Bid Details</div>
                {(bidList as Array<{ id: string; contractor_user_id: string; amount: number; timeline_days: number; submitted_at: string; status: string; notes: string | null; user_profiles: { full_name: string; email: string; phone: string } }>).map((bid) => {
                  const cp = contractorMap[bid.contractor_user_id]
                  const r = ratingMap[bid.contractor_user_id]
                  const isLowest = bid.amount === lowestAmount && bidList.length > 1

                  return (
                    <div key={bid.id} className="bid-card">
                      <div className="bid-card-header">
                        <div>
                          <div className="bid-card-name">
                            {cp?.company_name || bid.user_profiles?.full_name}
                            {isLowest && <span className="lowest-badge" style={{ marginLeft: 8 }}>Lowest Bid</span>}
                            {bid.status === 'awarded' && <span className="awarded-badge" style={{ marginLeft: 8 }}>Awarded</span>}
                          </div>
                          {cp?.company_name && bid.user_profiles?.full_name && (
                            <div className="bid-card-company">Contact: {bid.user_profiles.full_name}</div>
                          )}
                        </div>
                        <div>
                          <div className="bid-card-amount">${bid.amount.toLocaleString()}</div>
                          <div className="bid-card-timeline">{bid.timeline_days} day{bid.timeline_days !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      <div className="bid-card-body">
                        {bid.user_profiles?.email && (
                          <div>
                            <div className="bid-field-label">Email</div>
                            <div className="bid-field-value">{bid.user_profiles.email}</div>
                          </div>
                        )}
                        {bid.user_profiles?.phone && (
                          <div>
                            <div className="bid-field-label">Phone</div>
                            <div className="bid-field-value">{bid.user_profiles.phone}</div>
                          </div>
                        )}
                        {cp?.services && cp.services.length > 0 && (
                          <div>
                            <div className="bid-field-label">Services</div>
                            <div className="bid-field-value">{cp.services.join(', ')}</div>
                          </div>
                        )}
                        {cp?.service_states && cp.service_states.length > 0 && (
                          <div>
                            <div className="bid-field-label">Licensed States</div>
                            <div className="bid-field-value">{cp.service_states.join(', ')}</div>
                          </div>
                        )}
                        <div>
                          <div className="bid-field-label">TAGS Rating</div>
                          <div className="bid-field-value">
                            {r ? (
                              <span>
                                <span className="stars">{'★'.repeat(Math.round(r.avg))}{'☆'.repeat(5 - Math.round(r.avg))}</span>
                                {' '}{r.avg.toFixed(1)} ({r.count} review{r.count !== 1 ? 's' : ''})
                              </span>
                            ) : 'No ratings yet'}
                          </div>
                        </div>
                        <div>
                          <div className="bid-field-label">Submitted</div>
                          <div className="bid-field-value">
                            {new Date(bid.submitted_at).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        {bid.notes && (
                          <div className="bid-notes">
                            <div className="bid-field-label">Contractor Notes</div>
                            <div className="bid-field-value" style={{ marginTop: 4, lineHeight: 1.6 }}>{bid.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="no-bids">No bids have been submitted for this project yet.</div>
          )}
        </div>

        {/* Footer */}
        <div className="doc-footer">
          <span>TAGS — The Apartment Guys System · tagyourproject.com</span>
          <span>Generated {generatedDate} · Confidential</span>
        </div>
      </div>
    </>
  )
}
