import { getApiBase } from '../config'

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
  const base = getApiBase()
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      phone_number: params.phoneNumber,
      user_text: params.userText,
      ...(params.callSid ? { call_sid: params.callSid } : {}),
    }),
    signal: params.signal,
  })
  return (await res.json()) as ChatResponse
}


