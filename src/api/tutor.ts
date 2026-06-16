import { ApiRequestError, getToken } from '@/api/http'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'

export interface TutorMessage {
  role: 'user' | 'ai'
  content: string
}

export interface StreamTutorChatOptions {
  messages: TutorMessage[]
  subject?: string
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
  messages,
  subject,
  onChunk,
  onDone,
  onError,
  signal,
}: StreamTutorChatOptions): Promise<void> {
  if (!getToken()) {
    throw new ApiRequestError(401, 'Unauthorized')
  }

  const res = await fetch(`${API_BASE}/tutor/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...authHeaders(),
    },
    body: JSON.stringify({ messages, subject }),
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
