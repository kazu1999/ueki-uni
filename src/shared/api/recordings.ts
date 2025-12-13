import { getApiBase } from '../config'
import { fetchJson } from '../auth-fetch'

export type RecordingItem = {
  sid: string
  duration?: string
  date_created?: string
  media_format?: 'mp3' | 'wav'
}

export async function listRecordings(callSid: string): Promise<{ ok: boolean; items: RecordingItem[]; error?: string }> {
  const q = new URLSearchParams({ call_sid: callSid })
  return fetchJson<{ ok: boolean; items: RecordingItem[]; error?: string }>(`/recordings?${q.toString()}`)
}

export function recordingUrl(recordingSid: string, format: 'mp3' | 'wav' = 'mp3'): string {
  const base = getApiBase()
  const u = new URL(`${base}/recording/${encodeURIComponent(recordingSid)}`, window.location.href)
  u.searchParams.set('format', format)
  return u.toString()
}


