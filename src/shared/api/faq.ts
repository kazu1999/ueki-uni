import { fetchJson } from '../auth-fetch'
import type { ApiBasicResponse, GetFaqResponse, ListFaqsResponse } from '../types/faq'

export async function listFaqs(): Promise<ListFaqsResponse> {
  return fetchJson<ListFaqsResponse>('/faqs')
}

export async function getFaq(question: string): Promise<GetFaqResponse> {
  const encoded = encodeURIComponent(question)
  return fetchJson<GetFaqResponse>(`/faq/${encoded}`)
}

export async function createFaq(input: { question: string; answer: string }): Promise<ApiBasicResponse> {
  return fetchJson<ApiBasicResponse>('/faq', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateFaq(question: string, input: { answer: string }): Promise<ApiBasicResponse> {
  const encoded = encodeURIComponent(question)
  return fetchJson<ApiBasicResponse>(`/faq/${encoded}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteFaq(question: string): Promise<ApiBasicResponse> {
  const encoded = encodeURIComponent(question)
  return fetchJson<ApiBasicResponse>(`/faq/${encoded}`, { method: 'DELETE' })
}


