import { fetchJson } from '../auth-fetch'

export type ChatResponse = {
  ok: boolean
  reply?: string
  error?: string
}

export async function postChat(params: {
  phoneNumber: string
  userText: string
  callSid?: string
  signal?: AbortSignal
}): Promise<ChatResponse> {
  return fetchJson<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({
      phone_number: params.phoneNumber,
      user_text: params.userText,
      ...(params.callSid ? { call_sid: params.callSid } : {}),
    }),
    signal: params.signal,
  })
}


