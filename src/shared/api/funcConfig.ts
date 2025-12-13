import { fetchJson } from '../auth-fetch'

export type FuncConfig = {
  tools: any[]
  instructions?: string
}

export async function getFuncConfig(): Promise<{ ok: boolean; config: FuncConfig }> {
  return fetchJson<{ ok: boolean; config: FuncConfig }>('/func-config')
}

export async function putFuncConfig(config: FuncConfig): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>('/func-config', {
    method: 'PUT',
    body: JSON.stringify({ config }),
  })
}


