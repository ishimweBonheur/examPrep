import { User } from 'lucide-react'
import { formatDate } from '@/lib/format-date'
import { cn } from '@/lib/utils'
import { MessageUploads } from '@/components/chat/MessageUploads'
import type { ChatMessage } from '@/api/messages'

interface ChatMessageListProps {
  messages: ChatMessage[]
  currentUserId?: string
  emptyTitle?: string
  emptySubtitle?: string
  bottomRef?: React.RefObject<HTMLDivElement | null>
}

export function ChatMessageList({
  messages,
  currentUserId,
  emptyTitle = 'No messages yet',
  emptySubtitle = 'Send a message to start the conversation.',
  bottomRef,
}: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-primary/40" />
        </div>
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="text-xs mt-1">{emptySubtitle}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-1">
      {messages.map((msg) => {
        const isMe = msg.sender_id === currentUserId
        const hasContent = !!msg.content?.trim()
        const hasUploads = !!msg.uploads?.length

        return (
          <div
            key={msg.id}
            className={cn('flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300', isMe ? 'justify-end' : 'justify-start')}
          >
            {!isMe && (
              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center shrink-0 mt-1 ring-1 ring-primary/10">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={cn('max-w-[78%] flex flex-col', isMe ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 shadow-sm transition-all',
                  isMe
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted/80 border border-border/60 rounded-bl-md',
                  !hasContent && hasUploads && 'py-2'
                )}
              >
                {hasContent && (
                  <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', isMe ? 'text-primary-foreground' : 'text-foreground')}>
                    {msg.content}
                  </p>
                )}
                {hasUploads && <MessageUploads uploads={msg.uploads!} />}
              </div>
              <p className={cn('text-[11px] text-muted-foreground mt-1 px-1', isMe && 'text-right')}>
                {msg.sender_name && !isMe ? `${msg.sender_name} · ` : ''}
                {formatDate(msg.created_date, 'relative')}
              </p>
            </div>
            {isMe && (
              <div className="w-8 h-8 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-full flex items-center justify-center shrink-0 mt-1 ring-1 ring-secondary/10">
                <User className="w-4 h-4 text-secondary" />
              </div>
            )}
          </div>
        )
      })}
      {bottomRef && <div ref={bottomRef} />}
    </div>
  )
}
