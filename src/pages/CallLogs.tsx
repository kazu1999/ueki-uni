import { useEffect, useMemo, useState } from 'react'
import '../styles/calllogs.css'
import { getApiBase } from '../shared/config'

type PhonesResponse = { ok: boolean; phones?: string[]; items?: string[]; error?: string }
type CallsResponse = { ok: boolean; items?: CallItem[]; calls?: CallItem[]; next_token?: string; error?: string }
type CallItem = { ts: string; phone_number?: string; user_text?: string; assistant_text?: string; call_sid?: string }
type PhoneWithLatest = { phone: string; latestTs: string | null }
type GroupedItem = { key: string; phone: string; callSid: string | null; latestTs: string; count: number; sampleUser?: string; sampleAssistant?: string }
type ChatLogEvent = { timestamp?: number; ingestionTime?: number; message?: string; logStreamName?: string; eventId?: string }
type ChatLogsResponse = { ok: boolean; items?: ChatLogEvent[]; error?: string }

async function fetchJson<T>(baseUrl: string, path: string): Promise<T> {
  if (!baseUrl) throw new Error('API Base URL is empty')
  const resp = await fetch(`${baseUrl}${path}`)
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return resp.json() as Promise<T>
}

export default function CallLogsPage() {
  const apiBase = getApiBase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const [phonesWithLatest, setPhonesWithLatest] = useState<PhoneWithLatest[]>([])
  const [selectedPhone, setSelectedPhone] = useState<string>('')

  const [fromTs, setFromTs] = useState('')
  const [toTs, setToTs] = useState('')
  const [limit, setLimit] = useState<number>(50)

  const [calls, setCalls] = useState<CallItem[]>([])
  const [nextToken, setNextToken] = useState<string | null>(null)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [phoneFilter, setPhoneFilter] = useState<string>('')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [logsByKey, setLogsByKey] = useState<Record<string, ChatLogEvent[]>>({})
  const [logsLoadingKey, setLogsLoadingKey] = useState<string | null>(null)
  const [logsError, setLogsError] = useState<string>('')

  const limitClamped = useMemo(() => Math.max(1, Math.min(200, Number(limit) || 50)), [limit])

  async function loadCalls(reset: boolean) {
    try {
      if (!selectedPhone) throw new Error('Select phone')
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      params.set('phone', selectedPhone)
      const fromIso = toUtcIsoSeconds(fromTs)
      const toIso = toUtcIsoSeconds(toTs)
      if (fromIso) params.set('from', fromIso)
      if (toIso) params.set('to', toIso)
      params.set('limit', String(limitClamped))
      if (!reset && nextToken) params.set('next_token', nextToken)

      const data = await fetchJson<CallsResponse>(apiBase, `/calls?${params.toString()}`)
      if (!data.ok) throw new Error(data.error || 'Failed to load calls')
      const items = data.items || data.calls || []
      setNextToken(data.next_token || null)
      setCalls(prev => (reset ? items : [...prev, ...items]))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function loadPhonesWithLatest() {
    try {
      setLoading(true)
      setError('')
      const data = await fetchJson<PhonesResponse>(apiBase, '/phones')
      if (!data.ok) throw new Error(data.error || 'Failed to load phones')
      const list = (data.phones || data.items || []) as string[]
      const results = await Promise.allSettled(
        list.map(async (p) => {
          try {
            const q = new URLSearchParams({ phone: p, limit: '1', order: 'desc' })
            const resp = await fetchJson<CallsResponse>(apiBase, `/calls?${q.toString()}`)
            const items = resp.items || resp.calls || []
            const latest = items[0]?.ts || null
            return { phone: p, latestTs: latest } as PhoneWithLatest
          } catch {
            return { phone: p, latestTs: null } as PhoneWithLatest
          }
        })
      )
      const normalized: PhoneWithLatest[] = results
        .map(r => r.status === 'fulfilled' ? r.value : null)
        .filter((v): v is PhoneWithLatest => Boolean(v))
      normalized.sort((a, b) => {
        const ta = a.latestTs ? Date.parse(a.latestTs) : -Infinity
        const tb = b.latestTs ? Date.parse(b.latestTs) : -Infinity
        return tb - ta
      })
      setPhonesWithLatest(normalized)
      if (!selectedPhone && normalized.length) {
        setSelectedPhone(normalized[0].phone)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!apiBase) {
      setError('API Base URL is not configured')
      return
    }
    loadPhonesWithLatest().catch((e) => setError(e instanceof Error ? e.message : String(e)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase])

  useEffect(() => {
    if (!selectedPhone) return
    setNextToken(null)
    setCalls([])
    loadCalls(true).catch((e) => setError(e instanceof Error ? e.message : String(e)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPhone])

  function toUtcIsoSeconds(localDateTime: string): string | null {
    if (!localDateTime) return null
    const d = new Date(localDateTime)
    if (isNaN(d.getTime())) return null
    const iso = d.toISOString()
    return iso.slice(0, 19) + '+00:00'
  }

  function fmtLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0')
    const y = d.getFullYear()
    const m = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    const hh = pad(d.getHours())
    const mm = pad(d.getMinutes())
    return `${y}-${m}-${day}T${hh}:${mm}`
  }

  function setQuickRange(range: 'today' | '24h' | '7d' | 'clear') {
    const now = new Date()
    if (range === 'clear') {
      setFromTs('')
      setToTs('')
      return
    }
    if (range === 'today') {
      const from = new Date()
      from.setHours(0, 0, 0, 0)
      setFromTs(fmtLocal(from))
      setToTs(fmtLocal(now))
      return
    }
    if (range === '24h') {
      const from = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      setFromTs(fmtLocal(from))
      setToTs(fmtLocal(now))
      return
    }
    if (range === '7d') {
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      setFromTs(fmtLocal(from))
      setToTs(fmtLocal(now))
      return
    }
  }

  const grouped = useMemo<GroupedItem[]>(() => {
    const map = new Map<string, GroupedItem>()
    for (const it of calls) {
      const phone = it.phone_number || selectedPhone || ''
      const callSid = it.call_sid || null
      // group key: phone + callSid (if none, fallback to unique ts)
      const key = callSid ? `${phone}|${callSid}` : `${phone}|${it.ts}`
      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          key,
          phone,
          callSid,
          latestTs: it.ts,
          count: 1,
          sampleUser: it.user_text || undefined,
          sampleAssistant: it.assistant_text || undefined,
        })
      } else {
        existing.count += 1
        if (Date.parse(it.ts) > Date.parse(existing.latestTs)) {
          existing.latestTs = it.ts
          existing.sampleUser = it.user_text || existing.sampleUser
          existing.sampleAssistant = it.assistant_text || existing.sampleAssistant
        }
      }
    }
    const arr = Array.from(map.values())
    arr.sort((a, b) => Date.parse(b.latestTs) - Date.parse(a.latestTs))
    return arr
  }, [calls, selectedPhone])

  const groupedItems = useMemo(() => {
    const m = new Map<string, CallItem[]>()
    for (const it of calls) {
      const phone = it.phone_number || selectedPhone || ''
      const callSid = it.call_sid || null
      const key = callSid ? `${phone}|${callSid}` : `${phone}|${it.ts}`
      const arr = m.get(key) || []
      arr.push(it)
      m.set(key, arr)
    }
    // sort each group by ts ascending
    for (const [k, arr] of m.entries()) {
      arr.sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts))
      m.set(k, arr)
    }
    return m
  }, [calls, selectedPhone])

  async function toggleLogsForKey(key: string) {
    if (expandedLogs.has(key)) {
      setExpandedLogs(prev => {
        const ns = new Set(prev)
        ns.delete(key)
        return ns
      })
      return
    }
    setExpandedLogs(prev => new Set(prev).add(key))
    if (logsByKey[key]) return
    try {
      setLogsError('')
      setLogsLoadingKey(key)
      const items = groupedItems.get(key) || []
      const firstTs = items[0]?.ts
      const lastTs = items[items.length - 1]?.ts
      const firstMs = firstTs ? Date.parse(firstTs) : NaN
      const lastMs = lastTs ? Date.parse(lastTs) : NaN
      const padMin = 2
      let startMs = Date.now() - 5 * 60 * 1000
      let minutes = 10
      if (!isNaN(firstMs) && !isNaN(lastMs)) {
        startMs = Math.max(0, firstMs - padMin * 60 * 1000)
        const spanMin = Math.max(1, Math.ceil((lastMs - firstMs) / 60000))
        minutes = Math.min(60, spanMin + padMin * 2)
      }
      const q = new URLSearchParams({ startTimeMs: String(startMs), minutes: String(minutes), limit: '200' })
      const data = await fetchJson<ChatLogsResponse>(apiBase, `/chat-logs?${q.toString()}`)
      if (!data.ok) throw new Error(data.error || 'Failed to load logs')
      setLogsByKey(prev => ({ ...prev, [key]: data.items || [] }))
    } catch (e: unknown) {
      setLogsError(e instanceof Error ? e.message : String(e))
    } finally {
      setLogsLoadingKey(null)
    }
  }

  const displayPhones = useMemo(() => {
    const arr = [...phonesWithLatest]
    arr.sort((a, b) => {
      const ta = a.latestTs ? Date.parse(a.latestTs) : -Infinity
      const tb = b.latestTs ? Date.parse(b.latestTs) : -Infinity
      return tb - ta
    })
    const q = phoneFilter.trim()
    return q ? arr.filter(({ phone }) => phone.includes(q)) : arr
  }, [phonesWithLatest, phoneFilter])
  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Call Log Visualizer</h1>
        <span className="muted">DynamoDB: ueki-chatbot</span>
      </header>

      <section className="card toolbar">
        <span className="muted">{loading ? 'Loading…' : ''}</span>
        {error ? <span style={{ color: '#b91c1c' }}>{error}</span> : null}
      </section>

      <div className="grid">
        <section className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              placeholder="Filter phone (partial)"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              style={{ padding: 8 }}
            />
            <div className="phones vertical">
              {displayPhones.map(({ phone, latestTs }) => (
                <button
                  key={phone}
                  className={phone === selectedPhone ? 'phone active' : 'phone'}
                  onClick={() => setSelectedPhone(phone)}
                >
                  <div className="mono">{phone}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{latestTs || '-'}</div>
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="card">
          <div className="toolbar">
            <label>
              From (ISO8601)
              <input type="datetime-local" value={fromTs} onChange={e => setFromTs(e.target.value)} />
            </label>
            <label>
              To (ISO8601)
              <input type="datetime-local" value={toTs} onChange={e => setToTs(e.target.value)} />
            </label>
            <label>
              Limit
              <input
                type="number"
                value={limit}
                min={1}
                max={200}
                onChange={e => setLimit(Number(e.target.value))}
                style={{ width: 80 }}
              />
            </label>
            <button onClick={() => { setNextToken(null); setCalls([]); loadCalls(true) }} disabled={loading || !selectedPhone}>
              Load Calls
            </button>
            <button onClick={() => loadCalls(false)} disabled={loading || !nextToken}>
              Load More
            </button>
          </div>
          <div className="quickbar">
            <span className="muted">Quick range:</span>
            <button onClick={() => setQuickRange('today')}>Today</button>
            <button onClick={() => setQuickRange('24h')}>24h</button>
            <button onClick={() => setQuickRange('7d')}>7d</button>
            <button onClick={() => setQuickRange('clear')}>Clear</button>
          </div>

          <div className="logs">
            {grouped.map((g) => (
              <div className="log-card" key={g.key}>
                <div className="row">
                  <div className="muted">latest ts</div>
                  <div className="mono">{g.latestTs}</div>
                </div>
                <div className="row">
                  <div className="muted">phone</div>
                  <div className="mono">{g.phone}</div>
                </div>
                <div className="row">
                  <div className="muted">call_sid</div>
                  <div className="mono">{g.callSid || '-'}</div>
                </div>
                <div className="row">
                  <div className="muted">turns</div>
                  <div className="mono">{g.count}</div>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button onClick={() => setExpandedKey(expandedKey === g.key ? null : g.key)}>
                    {expandedKey === g.key ? 'Hide turns' : 'Show turns'}
                  </button>
                  <button onClick={() => toggleLogsForKey(g.key)} disabled={logsLoadingKey === g.key}>
                    {expandedLogs.has(g.key) ? 'Hide logs' : (logsLoadingKey === g.key ? 'Loading…' : 'Show logs')}
                  </button>
                </div>
                {expandedKey === g.key ? (
                  <div style={{ marginTop: 8 }}>
                    {(groupedItems.get(g.key) || []).map((item) => (
                      <div key={`${item.ts}-${item.phone_number || ''}`} style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 8 }}>
                        <div className="row">
                          <div className="muted">ts</div>
                          <div className="mono">{item.ts}</div>
                        </div>
                        <div className="row">
                          <div className="muted">user</div>
                          <div>{item.user_text || ''}</div>
                        </div>
                        <div className="row">
                          <div className="muted">assistant</div>
                          <div>{item.assistant_text || ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {expandedLogs.has(g.key) ? (
                  <div style={{ marginTop: 8 }}>
                    {logsError && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Logs Error: {logsError}</div>}
                    <pre style={{ background: '#f8fafc', padding: 12, whiteSpace: 'pre-wrap', textAlign: 'left', maxHeight: 300, overflow: 'auto' }}>
                      {(logsByKey[g.key] || []).map((ev) => {
                        const ts = ev.timestamp ? new Date(ev.timestamp).toISOString() : ''
                        return `${ts} ${ev.message || ''}`
                      }).join('\n') || '(no logs)'}
                    </pre>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}


