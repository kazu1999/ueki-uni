export type PromptGetResponse = { ok: true; id: string; content: string } | { ok: false; error: string }
export type PromptPutResponse = { ok: true } | { ok: false; error: string }

import { getApiBase } from '../config'

export async function getPrompt(): Promise<PromptGetResponse> {
  const base = getApiBase()
  const res = await fetch(`${base}/prompt`)
  return res.json()
}

export async function putPrompt(content: string): Promise<PromptPutResponse> {
  const base = getApiBase()
  const res = await fetch(`${base}/prompt`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  return res.json()
}
