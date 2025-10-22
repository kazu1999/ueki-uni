import { getApiBase } from '../config'

export type FuncConfig = {
  tools: any[]
  instructions?: string
}

export async function getFuncConfig(): Promise<{ ok: boolean; config: FuncConfig }> {
  const base = getApiBase()
  const res = await fetch(`${base}/func-config`)
  return res.json()
}

export async function putFuncConfig(config: FuncConfig): Promise<{ ok: boolean }> {
  const base = getApiBase()
  const res = await fetch(`${base}/func-config`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ config }),
  })
  return res.json()
}


