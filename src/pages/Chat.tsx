import { useCallback, useMemo, useRef, useState } from 'react'
import '../styles/chat.css'
import { postChat } from '../shared/api/chat'

type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export default function ChatPage() {
  const [phone, setPhone] = useState('')
  const [callSid, setCallSid] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const canSend = useMemo(() => {
    return phone.trim().length > 0 && callSid.trim().length > 0 && input.trim().length > 0 && !isSending
  }, [phone, callSid, input, isSending])

  const onSend = useCallback(async () => {
    if (!canSend) return
    setError(null)
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input.trim(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSending(true)
    const ac = new AbortController()
    abortRef.current = ac
    try {
      const res = await postChat({ phoneNumber: phone.trim(), userText: userMessage.text, callSid: callSid.trim() || undefined, signal: ac.signal })
      if (!res.ok) {
        throw new Error(res.error ?? 'Failed to send')
      }
      const assistantText = res.reply ?? ''
      if (assistantText) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', text: assistantText },
        ])
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
    } finally {
      setIsSending(false)
      abortRef.current = null
    }
  }, [canSend, phone, input])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }, [onSend])

  const onCancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return (
    <div className="container">
      <h1>Chat</h1>
      <div className="controls">
        <label>
          Phone (必須)
          <input
            type="tel"
            placeholder="09012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label>
          Call SID (必須)
          <input
            type="text"
            placeholder="CALL-SID-XXXX"
            value={callSid}
            onChange={(e) => setCallSid(e.target.value)}
          />
        </label>
      </div>

      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.role}`}>
            <div className="bubble">{m.text}</div>
          </div>
        ))}
        {isSending && (
          <div className="message assistant">
            <div className="bubble">送信中...</div>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="composer">
        <textarea
          placeholder="メッセージを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
        />
        <div className="actions">
          <button onClick={onSend} disabled={!canSend}>送信</button>
          {isSending && <button onClick={onCancel}>中止</button>}
        </div>
      </div>
    </div>
  )
}


