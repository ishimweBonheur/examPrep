import type { PublicStats, Achievement } from '@/types'

const TOKEN_KEY = 'examprep_auth_token'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'

export class ApiRequestError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
    this.name = 'ApiRequestError'
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({})) as ApiEnvelope<T> & { message?: string; details?: unknown }
  if (!res.ok) {
    throw new ApiRequestError(res.status, json.message || res.statusText || 'Request failed', json.details)
  }
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data
  }
  return json as T
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...authHeaders(),
    },
  })
  return parseResponse<T>(res)
}

export async function apiPost<T>(path: string, body?: unknown, requireAuth = true): Promise<T> {
  if (requireAuth && !getToken()) {
    throw new ApiRequestError(401, 'Unauthorized')
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return parseResponse<T>(res)
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  })
  return parseResponse<T>(res)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(),
    },
  })
  return parseResponse<T>(res)
}

export async function apiUpload(file: File): Promise<{ file_url: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  })
  const data = await parseResponse<{ file_url: string }>(res)
  if (data.file_url.startsWith('/')) {
    const origin = API_BASE.startsWith('http') ? new URL(API_BASE).origin : window.location.origin
    return { file_url: `${origin}${data.file_url}` }
  }
  return data
}

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export interface EntityApi<T> {
  list(sortField?: string, limit?: number): Promise<T[]>
  filter(queryObj: Record<string, unknown>, sortField?: string, limit?: number): Promise<T[]>
  create(data: Record<string, unknown>): Promise<T>
  update(id: string, data: Record<string, unknown>): Promise<T>
  delete(id: string): Promise<{ success: boolean }>
}

export function createHttpEntityApi<T>(resource: string): EntityApi<T> {
  return {
    list(sortField?: string, limit?: number) {
      const query = buildQuery({
        sort: sortField,
        limit,
      })
      return apiGet<T[]>(`/${resource}${query}`)
    },

    filter(queryObj: Record<string, unknown>, sortField?: string, limit?: number) {
      const query = buildQuery({
        ...queryObj,
        sort: sortField,
        limit,
      })
      return apiGet<T[]>(`/${resource}${query}`)
    },

    create(data: Record<string, unknown>) {
      return apiPost<T>(`/${resource}`, data)
    },

    update(id: string, data: Record<string, unknown>) {
      return apiPatch<T>(`/${resource}/${id}`, data)
    },

    delete(id: string) {
      return apiDelete<{ success: boolean }>(`/${resource}/${id}`)
    },
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function fetchPublicStats() {
  return apiGet<PublicStats>('/stats')
}

export function fetchUserAchievements(userId: string) {
  return apiGet<Achievement[]>(`/achievements/user/${userId}`)
}
