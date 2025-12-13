import { fetchAuthSession } from 'aws-amplify/auth'
import { getApiBase } from './config'

type FetchOptions = RequestInit & {
  skipAuth?: boolean
}

export async function authFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth, ...init } = options
  const headers = new Headers(init.headers || {})

  if (!skipAuth) {
    try {
      const session = await fetchAuthSession()
      const token = session.tokens?.idToken?.toString()
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
        // Also send tenant_id if available in payload, though Lambda extracts it from token.
        // It's safer to rely on token verification in Lambda.
      }
    } catch (e) {
      console.warn('Failed to fetch auth session', e)
    }
  }

  // Ensure Content-Type is json if body is present and not FormData
  if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const baseUrl = getApiBase()
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`

  return fetch(url, {
    ...init,
    headers,
  })
}

export async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const res = await authFetch(path, options)
  if (!res.ok) {
    // try to parse error message
    let errMsg = `HTTP ${res.status}`
    try {
      const data = await res.json()
      if (data.error) errMsg = data.error
    } catch {
      // ignore
    }
    throw new Error(errMsg)
  }
  return res.json() as Promise<T>
}

