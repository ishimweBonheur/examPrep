import { useMemo, useState, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base44, getToken } from '@/api/client'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, User, Users } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { io, Socket } from 'socket.io-client'
import {
  fetchConversationMessages,
  markMessageRead,
  sendChatMessage,
  type ChatMessage,
} from '@/api/messages'
import { ChatComposer } from '@/components/chat/ChatComposer'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { invalidateMessageUnread } from '@/hooks/use-message-unread'

interface Student {
  id: string
  full_name?: string
  email: string
  role: string
}

export default function AdminMessages() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: allMessages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['admin-all-messages'],
    queryFn: async () => {
      const msgs = await base44.entities.Message.list('-created_date', 500)
      return msgs as ChatMessage[]
    },
    refetchInterval: 5000,
  })

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['admin-students'],
    queryFn: () => base44.entities.User.list(),
  })

  useEffect(() => {
    if (!user?.id) return
    const token = getToken()
    if (!token) return

    const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'
    const socketUrl = apiBase.startsWith('http') ? new URL(apiBase).origin : window.location.origin

    const socket: Socket = io(socketUrl, { auth: { token: `Bearer ${token}` } })
    socket.on('message:new', () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-messages'] })
      if (selectedStudent?.id) {
        queryClient.invalidateQueries({ queryKey: ['admin-conversation', selectedStudent.id] })
      }
      invalidateMessageUnread(queryClient)
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient, selectedStudent?.id, user?.id])

  const studentList = students.filter((s) => s.role !== 'admin')
  const conversationStudents = studentList.filter((s) =>
    allMessages.some((m) => m.sender_id === s.id || m.receiver_id === s.id)
  )
  const sortedStudents = [
    ...conversationStudents,
    ...studentList.filter((s) => !conversationStudents.find((cs) => cs.id === s.id)),
  ]

  const { data: selectedMessages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['admin-conversation', selectedStudent?.id, user?.id],
    queryFn: async () => {
      if (!selectedStudent?.id || !user?.id) return []
      return fetchConversationMessages({ otherUserId: selectedStudent.id, limit: 200 })
    },
    enabled: !!selectedStudent?.id && !!user?.id,
    refetchInterval: 5000,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedMessages])

  useEffect(() => {
    if (!selectedStudent || !user?.id) return
    const unread = selectedMessages.filter((m) => m.sender_id === selectedStudent.id && !m.is_read)
    unread.forEach((m) => {
      markMessageRead(m.id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['admin-all-messages'] })
          invalidateMessageUnread(queryClient)
        })
        .catch(() => {})
    })
  }, [queryClient, selectedMessages, selectedStudent, user?.id])

  const getUnreadCount = (studentId: string): number =>
    allMessages.filter((m) => m.sender_id === studentId && m.receiver_id === user?.id && !m.is_read).length

  const handleSend = async (payload: { content: string; files: File[]; onProgress?: (pct: number) => void }) => {
    if (!selectedStudent?.id) return
    await sendChatMessage({
      receiverId: selectedStudent.id,
      content: payload.content,
      files: payload.files,
      onProgress: payload.onProgress,
    })
    queryClient.invalidateQueries({ queryKey: ['admin-all-messages'] })
    queryClient.invalidateQueries({ queryKey: ['admin-conversation', selectedStudent.id] })
    invalidateMessageUnread(queryClient)
  }

  const totalUnread = useMemo(
    () => allMessages.filter((m) => m.receiver_id === user?.id && !m.is_read).length,
    [allMessages, user?.id]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Student Messages</h1>
        <p className="text-muted-foreground mt-1">
          Chat with students — send text, images, and voice notes.
          {totalUnread > 0 && (
            <Badge className="ml-2 bg-primary text-white border-0">{totalUnread} unread</Badge>
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        <Card className="border border-border/80 overflow-hidden shadow-sm">
          <div className="p-3 border-b border-border bg-muted/30">
            <p className="font-medium text-sm text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Students ({sortedStudents.length})
            </p>
          </div>
          <ScrollArea className="h-[calc(100%-3rem)]">
            <div className="p-2 space-y-1">
              {sortedStudents.map((s) => {
                const unread = getUnreadCount(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200',
                      selectedStudent?.id === s.id
                        ? 'bg-primary/10 border border-primary/20 shadow-sm'
                        : 'hover:bg-muted/80 border border-transparent'
                    )}
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary/15 to-primary/5 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{s.full_name || s.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                    {unread > 0 && (
                      <Badge className="bg-primary text-white border-0 text-xs shrink-0">{unread}</Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </Card>

        <Card className="md:col-span-2 border border-border/80 overflow-hidden flex flex-col shadow-sm bg-gradient-to-b from-background to-muted/20">
          {selectedStudent ? (
            <>
              <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedStudent.full_name || selectedStudent.email}</p>
                  <p className="text-xs text-muted-foreground">{selectedStudent.email}</p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <ChatMessageList
                  messages={selectedMessages}
                  currentUserId={user?.id}
                  emptyTitle="No messages yet"
                  emptySubtitle="Start the conversation with this student."
                  bottomRef={bottomRef}
                />
              </ScrollArea>
              <ChatComposer
                input={input}
                onInputChange={setInput}
                onSend={handleSend}
                placeholder="Type your reply..."
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a student to start chatting.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
