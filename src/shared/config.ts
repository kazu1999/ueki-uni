export function getApiBase(): string {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/$/, '')
  }
  // Fallback to dev proxy prefix
  return '/api'
}


