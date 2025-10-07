import { useEffect, useState } from 'react'
import { getPrompt, putPrompt } from '../shared/api/prompt'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function PromptPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    getPrompt()
      .then((res) => {
        if (!mounted) return
        if (res.ok) {
          setContent(res.content || '')
        } else {
          setError(res.error)
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  async function onSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await putPrompt(content)
      if (!res.ok) throw new Error('failed to save')
      setSavedAt(new Date().toLocaleString())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 960 }}>
      <h1>System Prompt (Markdown)</h1>
      {loading ? <div>Loading...</div> : null}
      {error ? <div style={{ color: 'red', marginBottom: 8 }}>{error}</div> : null}
      <div style={{ marginTop: 8 }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={24}
          style={{ width: '100%', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', whiteSpace: 'pre-wrap' }}
          placeholder="# System Prompt\n\n- Markdown で記述..."
        />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <button onClick={onSave} disabled={saving}>保存</button>
        {savedAt && <span style={{ color: '#6b7280' }}>保存時刻: {savedAt}</span>}
      </div>
      <details style={{ marginTop: 16 }}>
        <summary>プレビュー（Markdown）</summary>
        <div style={{ background: '#f8fafc', padding: 12, overflow: 'auto' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </details>
    </div>
  )
}


