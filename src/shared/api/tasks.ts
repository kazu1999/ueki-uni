import { fetchJson } from '../auth-fetch'

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
  return fetchJson<{ ok: boolean; items: Task[] }>('/tasks')
}

export async function createTask(task: {
  name: string
  phone_number?: string
  address?: string
  start_datetime?: string
  request?: string
}): Promise<{ ok: boolean; item: Task }> {
  return fetchJson<{ ok: boolean; item: Task }>('/task', {
    method: 'POST',
    body: JSON.stringify(task),
  })
}

export async function updateTask(
  name: string,
  patch: { phone_number?: string; address?: string; start_datetime?: string; request?: string }
): Promise<{ ok: boolean; item: Task }> {
  return fetchJson<{ ok: boolean; item: Task }>(`/task/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  })
}

export async function deleteTask(name: string): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>(`/task/${encodeURIComponent(name)}`, { method: 'DELETE' })
}


