import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getToken } from '@/api/client'
import { apiGet } from '@/api/http'
import {
  fetchConversationMessages,
  markMessageRead,
  sendChatMessage,
  type ChatMessage,
} from '@/api/messages'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { io, Socket } from 'socket.io-client'
import { ChatComposer } from '@/components/chat/ChatComposer'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { invalidateMessageUnread } from '@/hooks/use-message-unread'

interface Recipient {
  id: string
  full_name: string
  role: string
}

export default function Messages() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: recipient } = useQuery<Recipient>({
    queryKey: ['chat-recipient'],
    queryFn: () => apiGet('/messages/admin-recipient'),
    enabled: !!user?.id,
    staleTime: 60_000,
  })

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['messages', user?.id, recipient?.id],
    queryFn: async () => {
      if (!recipient?.id) return []
      return fetchConversationMessages({ otherUserId: recipient.id, limit: 200 })
    },
    enabled: !!user?.id && !!recipient?.id,
    refetchInterval: 5000,
  })

  useEffect(() => {
    if (!user?.id) return
    const token = getToken()
    if (!token) return

    const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'
    const socketUrl = apiBase.startsWith('http') ? new URL(apiBase).origin : window.location.origin

    const socket: Socket = io(socketUrl, { auth: { token: `Bearer ${token}` } })
    socket.on('message:new', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', user.id] })
      invalidateMessageUnread(queryClient)
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const unread = messages.filter((m) => m.receiver_id === user?.id && !m.is_read)
    unread.forEach((m) => {
      markMessageRead(m.id)
        .then(() => invalidateMessageUnread(queryClient))
        .catch(() => {})
    })
  }, [messages, queryClient, user?.id])

  const handleSend = async (payload: { content: string; files: File[]; onProgress?: (pct: number) => void }) => {
    if (!recipient?.id) return
    await sendChatMessage({
      receiverId: recipient.id,
      content: payload.content,
      files: payload.files,
      onProgress: payload.onProgress,
    })
    queryClient.invalidateQueries({ queryKey: ['messages'] })
    invalidateMessageUnread(queryClient)
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="font-heading font-extrabold text-2xl text-foreground flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-primary" /> Messages
        </h1>
        <p className="text-muted-foreground mt-1">
          Chat with {recipient?.full_name ?? 'your teacher'} for help.
        </p>
      </div>

      <Card className="flex-1 border border-border/80 overflow-hidden flex flex-col shadow-sm bg-gradient-to-b from-background to-muted/20">
        <ScrollArea className="flex-1 p-4">
          <ChatMessageList
            messages={messages}
            currentUserId={user?.id}
            emptyTitle="No messages yet"
            emptySubtitle="Send a message to your teacher!"
            bottomRef={bottomRef}
          />
        </ScrollArea>

        <ChatComposer
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          disabled={!recipient?.id}
          placeholder="Type your message..."
        />
      </Card>
    </div>
  )
}
