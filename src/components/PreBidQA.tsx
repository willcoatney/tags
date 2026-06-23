'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Message {
  id: string
  message: string
  created_at: string
  sender_id: string
  contractor_user_id: string
  channel: 'app' | 'sms'
  user_profiles: { full_name: string; role: string }
}

interface ContractorThread {
  contractorUserId: string
  contractorName: string
  messages: Message[]
}

interface Props {
  projectId: string
  currentUserId: string
}

export default function PreBidQA({ projectId, currentUserId }: Props) {
  const [threads, setThreads] = useState<ContractorThread[]>([])
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [sending, setSending] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  async function fetchMessages() {
    const res = await fetch(`/api/projects/${projectId}/messages`)
    if (res.ok) {
      const data: Message[] = await res.json()
      const grouped: Record<string, Message[]> = {}
      for (const msg of data) {
        if (!grouped[msg.contractor_user_id]) grouped[msg.contractor_user_id] = []
        grouped[msg.contractor_user_id].push(msg)
      }
      const built: ContractorThread[] = Object.entries(grouped).map(([uid, msgs]) => {
        const contractorMsg = msgs.find(m => m.user_profiles?.role === 'contractor')
        const contractorName = contractorMsg?.user_profiles?.full_name || 'Contractor'
        return { contractorUserId: uid, contractorName, messages: msgs }
      })
      setThreads(built)
      if (built.length === 1) {
        setExpanded(e => ({ ...e, [built[0].contractorUserId]: e[built[0].contractorUserId] ?? true }))
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function handleReply(contractorUserId: string) {
    const text = replies[contractorUserId]?.trim()
    if (!text) return
    setSending(s => ({ ...s, [contractorUserId]: true }))
    const res = await fetch(`/api/projects/${projectId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, contractorUserId }),
    })
    if (res.ok) {
      setReplies(r => ({ ...r, [contractorUserId]: '' }))
      await fetchMessages()
    } else {
      toast.error('Failed to send reply')
    }
    setSending(s => ({ ...s, [contractorUserId]: false }))
  }

  if (loading) {
    return <p className="text-xs text-center py-6" style={{ color: 'oklch(0.45 0.015 252)' }}>Loading…</p>
  }

  if (threads.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm font-medium" style={{ color: 'oklch(0.55 0.02 252)' }}>No questions yet</p>
        <p className="text-xs mt-1" style={{ color: 'oklch(0.40 0.015 252)' }}>
          Contractors can ask questions about this project before submitting a bid.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-4">
      {threads.map(thread => {
        const isOpen = !!expanded[thread.contractorUserId]
        const lastMsg = thread.messages[thread.messages.length - 1]
        const awaitingReply = lastMsg?.user_profiles?.role === 'contractor'

        return (
          <div key={thread.contractorUserId} className="rounded-xl overflow-hidden"
            style={{
              border: `1px solid ${awaitingReply ? 'oklch(0.38 0.10 183)' : 'oklch(0.22 0.022 252)'}`,
              background: 'oklch(0.17 0.022 252)',
            }}>

            <button
              onClick={() => setExpanded(e => ({ ...e, [thread.contractorUserId]: !isOpen }))}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'oklch(0.22 0.06 183)', color: 'oklch(0.70 0.12 183)' }}>
                  {thread.contractorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{thread.contractorName}</p>
                  <p className="text-xs truncate" style={{ color: 'oklch(0.50 0.02 252)' }}>
                    {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''} · {new Date(lastMsg.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {awaitingReply && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                    style={{ background: 'oklch(0.22 0.08 183)', color: 'oklch(0.65 0.14 183)' }}>
                    Needs reply
                  </span>
                )}
                <span className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {isOpen && (
              <div style={{ borderTop: '1px solid oklch(0.22 0.022 252)' }}>
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto"
                  style={{ background: 'oklch(0.14 0.022 252)' }}>
                  {thread.messages.map(msg => {
                    const isMe = msg.sender_id === currentUserId
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[85%]">
                          {!isMe && (
                            <p className="text-xs mb-1 ml-1" style={{ color: 'oklch(0.50 0.02 252)' }}>
                              {msg.user_profiles?.full_name || thread.contractorName}
                            </p>
                          )}
                          <div className="px-3.5 py-2 text-sm leading-relaxed"
                            style={{
                              background: isMe ? 'oklch(0.57 0.135 183)' : 'oklch(0.20 0.022 252)',
                              color: isMe ? 'white' : 'oklch(0.82 0.01 252)',
                              borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            }}>
                            {msg.message}
                          </div>
                          <p className={`text-xs mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'}`}
                            style={{ color: 'oklch(0.40 0.015 252)' }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <form
                  onSubmit={e => { e.preventDefault(); handleReply(thread.contractorUserId) }}
                  className="flex gap-2 p-3"
                  style={{ borderTop: '1px solid oklch(0.22 0.022 252)', background: 'oklch(0.16 0.022 252)' }}
                >
                  <input
                    value={replies[thread.contractorUserId] || ''}
                    onChange={e => setReplies(r => ({ ...r, [thread.contractorUserId]: e.target.value }))}
                    placeholder={`Reply to ${thread.contractorName}…`}
                    className="flex-1 rounded-xl px-3.5 py-2 text-sm outline-none"
                    style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
                    disabled={!!sending[thread.contractorUserId]}
                  />
                  <button
                    type="submit"
                    disabled={!!sending[thread.contractorUserId] || !replies[thread.contractorUserId]?.trim()}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
                    style={{ background: 'oklch(0.57 0.135 183)' }}
                  >
                    {sending[thread.contractorUserId] ? '…' : 'Reply'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
