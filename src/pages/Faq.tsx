import { useEffect, useMemo, useState } from 'react'
import { FaqForm } from '../widgets/FaqForm'
import { Pagination } from '../widgets/Pagination'
import { createFaq, deleteFaq, listFaqs, updateFaq } from '../shared/api/faq'
import type { FaqItem } from '../shared/types/faq'

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [editing, setEditing] = useState<FaqItem | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await listFaqs()
      setItems(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q
      ? items.filter(
          (it) => it.question.toLowerCase().includes(q) || it.answer.toLowerCase().includes(q)
        )
      : items
    return [...base].sort(
      (a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)
    )
  }, [items, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>FAQ Manager</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <input
          type="text"
          placeholder="検索: 質問/回答"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => refresh()} disabled={loading}>
          Reload
        </button>
      </div>

      <details style={{ marginBottom: 16 }}>
        <summary>新規作成</summary>
        <div style={{ marginTop: 8 }}>
          <FaqForm
            mode="create"
            onSubmit={async ({ question, answer }) => {
              setLoading(true)
              setError(null)
              try {
                await createFaq({ question, answer })
                await refresh()
              } catch (e) {
                setError(e instanceof Error ? e.message : String(e))
              } finally {
                setLoading(false)
              }
            }}
          />
        </div>
      </details>

      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>Error: {error}</div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Question</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Answer</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8, width: 200 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((it) => (
            <tr key={it.question}>
              <td style={{ borderBottom: '1px solid #eee', padding: 8, verticalAlign: 'top' }}>
                <div style={{ fontWeight: 600 }}>{it.question}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  created: {it.created_at} / updated: {it.updated_at}
                </div>
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8, whiteSpace: 'pre-wrap' }}>{it.answer}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                {editing?.question === it.question ? (
                  <FaqForm
                    mode="edit"
                    initialQuestion={it.question}
                    initialAnswer={editing.answer}
                    onSubmit={async ({ question, answer }) => {
                      setLoading(true)
                      setError(null)
                      try {
                        await updateFaq(question, { answer })
                        setEditing(null)
                        await refresh()
                      } catch (e) {
                        setError(e instanceof Error ? e.message : String(e))
                      } finally {
                        setLoading(false)
                      }
                    }}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditing(it)} disabled={loading}>Edit</button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete: ${it.question}?`)) return
                        setLoading(true)
                        setError(null)
                        try {
                          await deleteFaq(it.question)
                          await refresh()
                        } catch (e) {
                          setError(e instanceof Error ? e.message : String(e))
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}


