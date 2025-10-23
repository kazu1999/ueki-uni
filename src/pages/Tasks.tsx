import { useEffect, useMemo, useState } from 'react'
import { createTask, deleteTask, listTasks, updateTask, type Task } from '../shared/api/tasks'

export default function TasksPage() {
  const [items, setItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<{ name: string; phone_number?: string; address?: string; start_datetime?: string; request?: string }>({ name: '' })
  const [editing, setEditing] = useState<Task | null>(null)
  const [editForm, setEditForm] = useState<{ phone_number?: string; address?: string; start_datetime?: string; request?: string }>({})

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
                  <button onClick={() => { setEditing(it); setEditForm({
                    phone_number: it.phone_number || '',
                    address: it.address || '',
                    start_datetime: it.start_datetime || it.start_date || '',
                    request: it.request || it.requirement || '',
                  }) }}>Edit</button>
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

      {editing ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onKeyDown={(e) => { if (e.key === 'Escape') setEditing(null) }}
        >
          <div style={{ background: '#fff', borderRadius: 8, minWidth: 520, maxWidth: '90vw', padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Edit: {editing.name}</h2>
              <button onClick={() => setEditing(null)}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>
                <div style={{ fontSize: 12, color: '#6b7280' }}>phone_number</div>
                <input value={editForm.phone_number || ''} onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })} />
              </label>
              <label>
                <div style={{ fontSize: 12, color: '#6b7280' }}>address</div>
                <input value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>start_datetime (YYYY-MM-DD HH:MM)</div>
                <input value={editForm.start_datetime || ''} onChange={(e) => setEditForm({ ...editForm, start_datetime: e.target.value })} />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>request</div>
                <textarea rows={4} value={editForm.request || ''} onChange={(e) => setEditForm({ ...editForm, request: e.target.value })} />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setEditing(null)} disabled={loading}>Cancel</button>
              <button onClick={async () => {
                if (!editing) return
                setLoading(true)
                setError('')
                try {
                  await updateTask(editing.name, {
                    phone_number: editForm.phone_number,
                    address: editForm.address,
                    start_datetime: editForm.start_datetime,
                    request: editForm.request,
                  })
                  setEditing(null)
                  await refresh()
                } catch (e) {
                  setError(e instanceof Error ? e.message : String(e))
                } finally {
                  setLoading(false)
                }
              }} disabled={loading}>Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


