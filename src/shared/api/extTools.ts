import { fetchJson } from '../auth-fetch'

export type ExtTool = {
  name: string
  description?: string
  method?: string
  url: string
  headers?: Record<string, string>
  body?: string
  parameters?: any
  timeout?: number
}

export type ExtToolsConfig = { ext_tools: ExtTool[] }

export async function getExtTools(): Promise<{ ok: boolean; config?: ExtToolsConfig; error?: string }> {
  return fetchJson<{ ok: boolean; config?: ExtToolsConfig; error?: string }>('/ext-tools')
}

export async function putExtTools(config: ExtToolsConfig): Promise<{ ok: boolean; error?: string }> {
  return fetchJson<{ ok: boolean; error?: string }>('/ext-tools', {
    method: 'PUT',
    body: JSON.stringify({ config }),
  })
}


