export interface FaqItem {
  question: string
  answer: string
  created_at: string
  updated_at: string
}

export interface ApiOkResponse {
  ok: true
}

export interface ApiErrorResponse {
  ok: false
  error: string
}

export type ApiBasicResponse = ApiOkResponse | ApiErrorResponse

export interface ListFaqsResponse extends ApiOkResponse {
  items: FaqItem[]
}

export interface GetFaqResponse extends ApiOkResponse {
  item: FaqItem
}


