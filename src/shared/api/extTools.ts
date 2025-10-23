import { getApiBase } from '../config'

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
  const base = getApiBase()
  const res = await fetch(`${base}/ext-tools`, { method: 'GET' })
  return res.json()
}

export async function putExtTools(config: ExtToolsConfig): Promise<{ ok: boolean; error?: string }> {
  const base = getApiBase()
  const res = await fetch(`${base}/ext-tools`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ config }),
  })
  return res.json()
}


