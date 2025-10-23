import { useEffect, useMemo, useState } from 'react'
import { getExtTools, putExtTools, type ExtToolsConfig } from '../shared/api/extTools'

export default function ExtToolsPage() {
  const [text, setText] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    getExtTools()
      .then((res) => {
        if (!res.ok) throw new Error(res.error || 'failed to load')
        setText(JSON.stringify(res.config || { ext_tools: [] }, null, 2))
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  const preview = useMemo(() => {
    try {
      const obj = JSON.parse(text || '{}')
      return (
        <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left', margin: 0 }}>
          {JSON.stringify(obj, null, 2)}
        </pre>
      )
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      return <div style={{ color: 'red' }}>Invalid JSON: {msg}</div>
    }
  }, [text])

  async function onSave() {
    setSaving(true)
    setError('')
    try {
      const cfg = JSON.parse(text || '{}') as ExtToolsConfig
      if (!cfg || typeof cfg !== 'object' || !('ext_tools' in cfg)) {
        throw new Error('config.ext_tools is required')
      }
      const res = await putExtTools(cfg)
      if (!res.ok) throw new Error(res.error || 'save failed')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const sample = `{
  "ext_tools": [
    {
      "name": "create_calendar_event",
      "description": "Create a Google Calendar event at the given time",
      "method": "POST",
      "url": "https://www.googleapis.com/calendar/v3/calendars/{{calendar_id}}/events",
      "headers": {
        "Authorization": "Bearer {{api_key}}",
        "Content-Type": "application/json"
      },
      "body": "{\n  \"summary\": \"{{summary}}\",\n  \"start\": { \"dateTime\": \"{{start_datetime}}\", \"timeZone\": \"Asia/Tokyo\" },\n  \"end\": { \"dateTime\": \"{{end_datetime}}\", \"timeZone\": \"Asia/Tokyo\" }\n}",
      "parameters": {
        "type": "object",
        "properties": {
          "api_key": { "type": "string" },
          "calendar_id": { "type": "string" },
          "summary": { "type": "string" },
          "start_datetime": { "type": "string" },
          "end_datetime": { "type": "string" }
        },
        "required": ["api_key", "calendar_id", "summary", "start_datetime", "end_datetime"],
        "additionalProperties": false
      },
      "timeout": 10
    }
  ]
}`

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h1>External APIs (ext-tools)</h1>
      {loading ? <div>Loading...</div> : null}
      {error ? <div style={{ color: 'red', marginBottom: 8 }}>{error}</div> : null}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={24}
        style={{ width: '100%', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
        placeholder='{"ext_tools": [...]}'>
      </textarea>
      <div style={{ marginTop: 8 }}>
        <button onClick={onSave} disabled={saving}>保存</button>
      </div>
      <details style={{ marginTop: 12 }}>
        <summary>プレビュー（整形）</summary>
        <div style={{ background: '#f8fafc', padding: 12, overflow: 'auto', textAlign: 'left' }}>
          {preview}
        </div>
      </details>
      <details style={{ marginTop: 12 }}>
        <summary>サンプル（Google Calendar: 予定作成）</summary>
        <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{sample}</pre>
      </details>
    </div>
  )
}


