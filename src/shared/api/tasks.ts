import { getApiBase } from '../config'

export type Task = {
  name: string
  phone_number?: string
  address?: string
  start_datetime?: string
  request?: string
  // fallback for legacy keys
  requirement?: string
  start_date?: string
  created_at?: string
  updated_at?: string
}

export async function listTasks(): Promise<{ ok: boolean; items: Task[] }> {
  const base = getApiBase()
  const res = await fetch(`${base}/tasks`)
  return res.json()
}

export async function createTask(task: {
  name: string
  phone_number?: string
  address?: string
  start_datetime?: string
  request?: string
}): Promise<{ ok: boolean; item: Task }> {
  const base = getApiBase()
  const res = await fetch(`${base}/task`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(task),
  })
  return res.json()
}

export async function updateTask(
  name: string,
  patch: { phone_number?: string; address?: string; start_datetime?: string; request?: string }
): Promise<{ ok: boolean; item: Task }> {
  const base = getApiBase()
  const res = await fetch(`${base}/task/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(patch),
  })
  return res.json()
}

export async function deleteTask(name: string): Promise<{ ok: boolean }> {
  const base = getApiBase()
  const res = await fetch(`${base}/task/${encodeURIComponent(name)}`, { method: 'DELETE' })
  return res.json()
}


