import { ApiRequestError, getToken } from '@/api/http'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'

export interface TutorMessage {
  role: 'user' | 'ai'
  content: string
}

export interface TutorSession {
  id: string
  subject?: string | null
  created_date: string
  updated_date: string
}

export interface TutorUploadedImage {
  id: string
  mime_type: string
  size_bytes: number
  original_name: string
  created_date: string
}

export async function createTutorSession(subject?: string) {
  const res = await fetch(`${API_BASE}/tutor/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ subject }),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string }
    throw new ApiRequestError(res.status, json.message || 'Failed to create tutor session')
  }
  const json = await res.json() as { data?: TutorSession }
  if (!json.data) throw new ApiRequestError(500, 'Invalid tutor session response')
  return json.data
}

export async function listTutorSessions() {
  const res = await fetch(`${API_BASE}/tutor/sessions`, {
    headers: {
      ...authHeaders(),
    },
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string }
    throw new ApiRequestError(res.status, json.message || 'Failed to load tutor sessions')
  }
  const json = await res.json() as { data?: TutorSession[] }
  if (!json.data) throw new ApiRequestError(500, 'Invalid tutor sessions response')
  return json.data
}

export async function fetchTutorSession(sessionId: string) {
  const res = await fetch(`${API_BASE}/tutor/sessions/${sessionId}`, {
    headers: {
      ...authHeaders(),
    },
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string }
    throw new ApiRequestError(res.status, json.message || 'Failed to load tutor session')
  }
  const json = await res.json() as { data?: { session: TutorSession; messages: TutorMessage[] } }
  if (!json.data) throw new ApiRequestError(500, 'Invalid tutor session response')
  return json.data
}

export async function listTutorImages(sessionId: string) {
  const res = await fetch(`${API_BASE}/tutor/sessions/${sessionId}/images`, {
    headers: {
      ...authHeaders(),
    },
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string }
    throw new ApiRequestError(res.status, json.message || 'Failed to load tutor images')
  }
  const json = await res.json() as { data?: TutorUploadedImage[] }
  if (!json.data) throw new ApiRequestError(500, 'Invalid tutor images response')
  return json.data
}

export async function uploadTutorImages(sessionId: string, images: File[]) {
  if (!getToken()) {
    throw new ApiRequestError(401, 'Unauthorized')
  }
  const form = new FormData()
  for (const image of images) {
    form.append('images', image)
  }
  const res = await fetch(`${API_BASE}/tutor/sessions/${sessionId}/images`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
    },
    body: form,
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string }
    throw new ApiRequestError(res.status, json.message || 'Failed to upload tutor images')
  }
  const json = await res.json() as { data?: TutorUploadedImage[] }
  if (!json.data) throw new ApiRequestError(500, 'Invalid tutor upload response')
  return json.data
}

export interface StreamTutorChatOptions {
  sessionId: string
  message: string
  imageIds?: string[]
  onChunk: (text: string) => void
  onDone: () => void
  onError: (message: string) => void
  signal?: AbortSignal
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function streamTutorChat({
  sessionId,
  message,
  imageIds,
  onChunk,
  onDone,
  onError,
  signal,
}: StreamTutorChatOptions): Promise<void> {
  if (!getToken()) {
    throw new ApiRequestError(401, 'Unauthorized')
  }

  const res = await fetch(`${API_BASE}/tutor/sessions/${sessionId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...authHeaders(),
    },
    body: JSON.stringify({ message, image_ids: imageIds }),
    signal,
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string }
    throw new ApiRequestError(res.status, json.message || 'Failed to reach AI tutor')
  }

  const reader = res.body?.getReader()
  if (!reader) {
    throw new ApiRequestError(500, 'No response stream from AI tutor')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let finished = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue

      try {
        const data = JSON.parse(line.slice(6)) as { text?: string; done?: boolean; error?: string }
        if (data.error) {
          onError(data.error)
          finished = true
        } else if (data.done) {
          onDone()
          finished = true
        } else if (data.text) {
          onChunk(data.text)
        }
      } catch {
        /* skip malformed SSE lines */
      }
    }
  }

  if (!finished) {
    onDone()
  }
}
