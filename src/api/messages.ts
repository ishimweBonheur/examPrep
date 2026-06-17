import { ApiRequestError, getToken } from '@/api/http'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'

export interface ChatUpload {
  id: string
  purpose: string
  mime_type: string
  size_bytes: number
  original_name: string
  created_date: string
}

export interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  conversation_id: string
  content: string
  sender_name?: string
  sender_role?: string
  is_read?: boolean
  delivered_date?: string
  created_date: string
  uploads?: ChatUpload[]
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function parseJsonSafe(resText: string): unknown {
  try {
    return JSON.parse(resText) as unknown
  } catch {
    return {}
  }
}

export async function fetchConversationMessages(params: { otherUserId: string; limit?: number }) {
  const qs = new URLSearchParams()
  qs.set('other_user_id', params.otherUserId)
  qs.set('sort', 'created_date')
  qs.set('limit', String(params.limit ?? 200))

  const res = await fetch(`${API_BASE}/messages?${qs.toString()}`, {
    headers: {
      ...authHeaders(),
    },
  })

  const json = await res.json().catch(() => ({})) as { data?: ChatMessage[]; message?: string }
  if (!res.ok) throw new ApiRequestError(res.status, json.message || 'Failed to load messages')
  return json.data ?? []
}

export async function markMessageRead(messageId: string) {
  const res = await fetch(`${API_BASE}/messages/${messageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ is_read: true }),
  })
  const json = await res.json().catch(() => ({})) as { message?: string }
  if (!res.ok) throw new ApiRequestError(res.status, json.message || 'Failed to update message')
}

export async function sendChatMessage(params: {
  receiverId: string
  content?: string
  subject?: string
  files?: File[]
  onProgress?: (pct: number) => void
}) {
  const token = getToken()
  if (!token) {
    throw new ApiRequestError(401, 'Unauthorized')
  }

  const form = new FormData()
  form.append('receiver_id', params.receiverId)
  form.append('content', params.content ?? '')
  form.append('subject', params.subject ?? 'Chat')
  for (const f of params.files ?? []) {
    form.append('files', f)
  }

  const xhr = new XMLHttpRequest()
  const promise = new Promise<ChatMessage>((resolve, reject) => {
    xhr.open('POST', `${API_BASE}/messages/send`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return
      const pct = Math.round((evt.loaded / evt.total) * 100)
      params.onProgress?.(pct)
    }
    xhr.onerror = () => reject(new ApiRequestError(0, 'Network error'))
    xhr.onload = () => {
      const json = parseJsonSafe(xhr.responseText) as { data?: ChatMessage; message?: string; success?: boolean }
      if (xhr.status >= 200 && xhr.status < 300 && json.data) {
        resolve(json.data)
      } else {
        reject(new ApiRequestError(xhr.status || 500, json.message || 'Failed to send message'))
      }
    }
    xhr.send(form)
  })

  return promise
}

export async function fetchPrivateFile(fileId: string) {
  const token = getToken()
  if (!token) throw new ApiRequestError(401, 'Unauthorized')

  const res = await fetch(`${API_BASE}/files/${fileId}`, {
    headers: {
      ...authHeaders(),
    },
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string }
    throw new ApiRequestError(res.status, json.message || 'Failed to load file')
  }

  const blob = await res.blob()
  const mime = res.headers.get('Content-Type') || blob.type || 'application/octet-stream'
  return { blob, mime }
}
