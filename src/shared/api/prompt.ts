export type PromptGetResponse = { ok: true; id: string; content: string } | { ok: false; error: string }
export type PromptPutResponse = { ok: true } | { ok: false; error: string }

import { fetchJson } from '../auth-fetch'

export async function getPrompt(): Promise<PromptGetResponse> {
  return fetchJson<PromptGetResponse>('/prompt')
}

export async function putPrompt(content: string): Promise<PromptPutResponse> {
  return fetchJson<PromptPutResponse>('/prompt', {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}
