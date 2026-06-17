import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { getToken } from '@/api/client'
import { apiGet } from '@/api/http'
import { useAuth } from '@/hooks/use-auth'

export const MESSAGE_UNREAD_QUERY_KEY = 'message-unread-count'

export function useMessageUnreadCount() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?.id) return
    const token = getToken()
    if (!token) return

    const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'
    const socketUrl = apiBase.startsWith('http') ? new URL(apiBase).origin : window.location.origin

    const socket = io(socketUrl, { auth: { token: `Bearer ${token}` } })
    socket.on('message:new', () => {
      queryClient.invalidateQueries({ queryKey: [MESSAGE_UNREAD_QUERY_KEY] })
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient, user?.id])

  return useQuery({
    queryKey: [MESSAGE_UNREAD_QUERY_KEY, user?.id],
    queryFn: async () => {
      const res = await apiGet<{ count: number }>('/messages/unread-count')
      return res.count
    },
    enabled: !!user?.id,
    refetchInterval: 30_000,
  })
}

export function invalidateMessageUnread(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [MESSAGE_UNREAD_QUERY_KEY] })
}
