import { useEffect, useState } from 'react'
import { getFuncConfig, putFuncConfig } from '../shared/api/funcConfig'

export default function FuncConfigPage() {
  const [text, setText] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [msg, setMsg] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    getFuncConfig()
      .then((res) => {
        if (!res.ok) throw new Error('failed')
        setText(JSON.stringify(res.config, null, 2))
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  async function onSave() {
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const cfg = JSON.parse(text)
      const res = await putFuncConfig(cfg)
      if (!res.ok) throw new Error('save failed')
      setMsg('保存しました')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  function onFormat() {
    setError('')
    setMsg('')
    try {
      const obj = JSON.parse(text || '{}')
      setText(JSON.stringify(obj, null, 2))
      setMsg('整形しました')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const preview = (() => {
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
  })()

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h1>Function Calling Config</h1>
      {loading ? <div>Loading...</div> : null}
      {error ? <div style={{ color: 'red', marginBottom: 8 }}>{error}</div> : null}
      {msg ? <div style={{ color: '#059669', marginBottom: 8 }}>{msg}</div> : null}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={24}
        style={{ width: '100%', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
        placeholder='{"tools": [...], "instructions": "..."}'
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={onFormat} style={{ marginRight: 8 }}>整形</button>
        <button onClick={onSave} disabled={saving}>保存</button>
      </div>
      <details style={{ marginTop: 12 }}>
        <summary>プレビュー（JSON 整形）</summary>
        <div style={{ background: '#f8fafc', padding: 12, overflow: 'auto', textAlign: 'left' }}>
          {preview}
        </div>
      </details>
      <details style={{ marginTop: 12 }}>
        <summary>サンプル（Tasks CRUD）</summary>
        <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{`{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "list_tasks",
        "description": "List all tasks",
        "parameters": {
          "type": "object",
          "properties": {},
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "create_task",
        "description": "Create a task",
        "parameters": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "requirement": {
              "type": "string"
            },
            "start_date": {
              "type": "string"
            }
          },
          "required": [
            "name"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "get_task",
        "description": "Get a task by name",
        "parameters": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            }
          },
          "required": [
            "name"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "update_task",
        "description": "Update a task fields",
        "parameters": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "requirement": {
              "type": "string"
            },
            "start_date": {
              "type": "string"
            }
          },
          "required": [
            "name"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "delete_task",
        "description": "Delete a task",
        "parameters": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            }
          },
          "required": [
            "name"
          ],
          "additionalProperties": false
        }
      }
    }
  ]
}`}</pre>
      </details>
    </div>
  )
}


