import { getApiBase } from '../config'
import type { ApiBasicResponse, GetFaqResponse, ListFaqsResponse } from '../types/faq'

function base(): string {
  return getApiBase().replace(/\/$/, '')
}

async function handleJson<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) {
    const message = (data && (data as any).error) ? (data as any).error : `HTTP ${res.status}`
    throw new Error(message)
  }
  return data as T
}

export async function listFaqs(): Promise<ListFaqsResponse> {
  const url = `${base()}/faqs`
  const res = await fetch(url, { method: 'GET' })
  return handleJson<ListFaqsResponse>(res)
}

export async function getFaq(question: string): Promise<GetFaqResponse> {
  const encoded = encodeURIComponent(question)
  const url = `${base()}/faq/${encoded}`
  const res = await fetch(url, { method: 'GET' })
  return handleJson<GetFaqResponse>(res)
}

export async function createFaq(input: { question: string; answer: string }): Promise<ApiBasicResponse> {
  const url = `${base()}/faq`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleJson<ApiBasicResponse>(res)
}

export async function updateFaq(question: string, input: { answer: string }): Promise<ApiBasicResponse> {
  const encoded = encodeURIComponent(question)
  const url = `${base()}/faq/${encoded}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleJson<ApiBasicResponse>(res)
}

export async function deleteFaq(question: string): Promise<ApiBasicResponse> {
  const encoded = encodeURIComponent(question)
  const url = `${base()}/faq/${encoded}`
  const res = await fetch(url, { method: 'DELETE' })
  return handleJson<ApiBasicResponse>(res)
}


