import { useEffect, useMemo, useState } from 'react'
import '../styles/calllogs.css'
import { getApiBase } from '../shared/config'

type PhonesResponse = { ok: boolean; phones?: string[]; items?: string[]; error?: string }
type CallsResponse = { ok: boolean; items?: CallItem[]; calls?: CallItem[]; next_token?: string; error?: string }
type CallItem = { ts: string; phone_number?: string; user_text?: string; assistant_text?: string }
type PhoneWithLatest = { phone: string; latestTs: string | null }

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
            const q = new URLSearchParams({ phone: p, limit: '1' })
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
          <div className="phones vertical">
            {phonesWithLatest.map(({ phone, latestTs }) => (
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
            {calls.map((item) => (
              <div className="log-card" key={`${item.ts}-${item.phone_number || ''}`}>
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
        </section>
      </div>
    </div>
  )
}


