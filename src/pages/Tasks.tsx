import { useEffect, useMemo, useState } from 'react'
import { createTask, deleteTask, listTasks, updateTask, type Task } from '../shared/api/tasks'

export default function TasksPage() {
  const [items, setItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<{ name: string; phone_number?: string; address?: string; start_datetime?: string; request?: string }>({ name: '' })

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const res = await listTasks()
      setItems(res.items || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q
      ? items.filter(it =>
          it.name.toLowerCase().includes(q) ||
          (it.request || it.requirement || '').toLowerCase().includes(q) ||
          (it.phone_number || '').includes(q)
        )
      : items
    return [...base].sort((a, b) => Date.parse(b.updated_at || b.created_at || '') - Date.parse(a.updated_at || a.created_at || ''))
  }, [items, search])

  return (
    <div style={{ padding: 16 }}>
      <h1>Tasks</h1>
      {error ? <div style={{ color: 'red' }}>{error}</div> : null}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input placeholder="検索" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={() => refresh()} disabled={loading}>Reload</button>
      </div>

      <details style={{ marginBottom: 12 }}>
        <summary>新規作成</summary>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: 8, marginTop: 8 }}>
          <input placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="phone_number" value={form.phone_number || ''} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          <input placeholder="address" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input placeholder="start_datetime (YYYY-MM-DD HH:MM)" value={form.start_datetime || ''} onChange={(e) => setForm({ ...form, start_datetime: e.target.value })} />
          <input placeholder="request" value={form.request || ''} onChange={(e) => setForm({ ...form, request: e.target.value })} />
          <button onClick={async () => {
            setLoading(true)
            setError('')
            try {
              await createTask({
                name: form.name.trim(),
                phone_number: form.phone_number,
                address: form.address,
                start_datetime: form.start_datetime,
                request: form.request,
              })
              setForm({ name: '' })
              await refresh()
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e))
            } finally {
              setLoading(false)
            }
          }} disabled={loading || !form.name.trim()}>作成</button>
        </div>
      </details>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Name</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Phone</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Address</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Start Datetime</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Request</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8, width: 220 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((it) => (
            <tr key={it.name}>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{it.name}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{it.phone_number || ''}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{it.address || ''}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{it.start_datetime || it.start_date || ''}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{it.request || it.requirement || ''}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={async () => {
                    const req = prompt('request', it.request || it.requirement || '')
                    if (req === null) return
                    const sd = prompt('start_datetime (YYYY-MM-DD HH:MM)', it.start_datetime || it.start_date || '')
                    if (sd === null) return
                    const ph = prompt('phone_number', it.phone_number || '')
                    if (ph === null) return
                    const adr = prompt('address', it.address || '')
                    if (sd === null) return
                    setLoading(true)
                    setError('')
                    try {
                      await updateTask(it.name, { request: req, start_datetime: sd, phone_number: ph || undefined, address: adr || undefined })
                      await refresh()
                    } catch (e) {
                      setError(e instanceof Error ? e.message : String(e))
                    } finally {
                      setLoading(false)
                    }
                  }}>Edit</button>
                  <button onClick={async () => {
                    if (!confirm(`Delete ${it.name}?`)) return
                    setLoading(true)
                    setError('')
                    try {
                      await deleteTask(it.name)
                      await refresh()
                    } catch (e) {
                      setError(e instanceof Error ? e.message : String(e))
                    } finally {
                      setLoading(false)
                    }
                  }}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


