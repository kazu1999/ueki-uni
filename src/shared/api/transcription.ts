import { getApiBase } from '../config'

export type TranscriptionResponse = {
  ok: boolean
  text?: string
  segments?: Array<{ start?: number; end?: number; text?: string }>
  error?: string
}

export async function getTranscription(recordingSid: string): Promise<TranscriptionResponse> {
  const base = getApiBase()
  const params = new URLSearchParams({ recording_sid: recordingSid, format: 'mp3' })
  const res = await fetch(`${base}/transcription?${params.toString()}`)
  let data: any = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) ? (data.error || data.message) : `HTTP ${res.status}`
    return { ok: false, error: String(msg) }
  }
  // Ensure ok flag exists
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Invalid response' }
  }
  if (typeof data.ok !== 'boolean') {
    data.ok = true
  }
  return data as TranscriptionResponse
}


