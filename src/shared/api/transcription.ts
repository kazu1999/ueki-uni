import { fetchJson } from '../auth-fetch'

export type TranscriptionResponse = {
  ok: boolean
  text?: string
  segments?: Array<{ start?: number; end?: number; text?: string }>
  error?: string
}

export async function getTranscription(recordingSid: string): Promise<TranscriptionResponse> {
  const params = new URLSearchParams({ recording_sid: recordingSid, format: 'mp3' })
  return fetchJson<TranscriptionResponse>(`/transcription?${params.toString()}`)
}


