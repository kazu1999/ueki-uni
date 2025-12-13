import { useEffect, useState } from 'react'
import { authFetch } from '../shared/auth-fetch'
import { recordingUrl } from '../shared/api/recordings'

type Props = {
  sid: string
  format: 'mp3' | 'wav'
  style?: React.CSSProperties
}

export function AuthenticatedAudio({ sid, format, style }: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    let objUrl: string | null = null

    async function load() {
      try {
        setLoading(true)
        setError(null)
        // recordingUrl returns the full URL, but authFetch handles absolute URLs correctly
        // However, recordingUrl includes the base URL which authFetch also prepends if path is relative.
        // authFetch logic: if path starts with http, use it.
        const url = recordingUrl(sid, format)
        const res = await authFetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        if (active) {
          objUrl = URL.createObjectURL(blob)
          setSrc(objUrl)
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : String(e))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
      if (objUrl) URL.revokeObjectURL(objUrl)
    }
  }, [sid, format])

  if (loading) return <div className="muted" style={style}>Loading audio...</div>
  if (error) return <div style={{ color: '#b91c1c', ...style }}>Failed to load audio: {error}</div>
  if (!src) return null

  return <audio controls src={src} style={style} />
}

