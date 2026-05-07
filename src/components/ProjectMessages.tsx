'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface Message {
  id: string
  message: string
  created_at: string
  sender_id: string
  user_profiles: { full_name: string; role: string }
}

interface Props {
  projectId: string
  currentUserId: string
  currentUserRole: string
}

export default function ProjectMessages({ projectId, currentUserId, currentUserRole }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function fetchMessages() {
    const res = await fetch(`/api/projects/${projectId}/messages`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 10000) // poll every 10s
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    const res = await fetch(`/api/projects/${projectId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text.trim() }),
    })
    if (res.ok) {
      setText('')
      await fetchMessages()
    } else {
      toast.error('Failed to send message')
    }
    setSending(false)
  }

  const roleLabel = (role: string) => role === 'pm' ? 'PM' : role === 'contractor' ? 'Contractor' : role

  return (
    <div className="flex flex-col" style={{ maxHeight: '400px' }}>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 min-h-[120px]"
        style={{ background: 'oklch(0.14 0.022 252)' }}>
        {loading ? (
          <p className="text-center text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs py-6" style={{ color: 'oklch(0.45 0.015 252)' }}>
            No messages yet. Ask a question or clarify scope.
          </p>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  {!isMe && (
                    <p className="text-xs mb-1 ml-1" style={{ color: 'oklch(0.50 0.02 252)' }}>
                      {msg.user_profiles?.full_name || roleLabel(msg.user_profiles?.role)}
                      <span className="ml-1 capitalize" style={{ color: 'oklch(0.40 0.015 252)' }}>
                        · {roleLabel(msg.user_profiles?.role)}
                      </span>
                    </p>
                  )}
                  <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: isMe ? 'oklch(0.57 0.135 183)' : 'oklch(0.20 0.022 252)',
                      color: isMe ? 'white' : 'oklch(0.82 0.01 252)',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    }}>
                    {msg.message}
                  </div>
                  <p className={`text-xs mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}
                    style={{ color: 'oklch(0.40 0.015 252)' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 p-3 border-t"
        style={{ borderColor: 'oklch(0.22 0.022 252)', background: 'oklch(0.16 0.022 252)' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={currentUserRole === 'contractor' ? 'Ask a question about the scope…' : 'Message the contractor…'}
          className="flex-1 rounded-xl px-4 py-2 text-sm outline-none"
          style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
          disabled={sending}
        />
        <button type="submit" disabled={sending || !text.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: 'oklch(0.57 0.135 183)' }}>
          {sending ? '…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
