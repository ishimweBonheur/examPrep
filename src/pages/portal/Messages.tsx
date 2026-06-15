import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/format-date';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  sender_name?: string;
  sender_role?: string;
  is_read?: boolean;
  created_date: string;
}

interface User {
  id: string;
  full_name?: string;
  role?: string;
}

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_id: user?.id }, '-created_date', 100);
      const received = await base44.entities.Message.filter({ receiver_id: user?.id }, '-created_date', 100);
      const all = [...sent, ...received].sort((a: Message, b: Message) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());
      return all;
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark unread as read
  useEffect(() => {
    const unread = messages.filter((m: Message) => m.receiver_id === user?.id && !m.is_read);
    unread.forEach((m: Message) => {
      base44.entities.Message.update(m.id, { is_read: true });
    });
  }, [messages, user?.id]);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim()) return;

    // Get admins to find first admin to message
    const admins = await base44.entities.User.filter({ role: 'admin' });
    const adminId = admins.length > 0 ? admins[0].id : null;

    if (!adminId) {
      return;
    }

    await base44.entities.Message.create({
      sender_id: user?.id,
      sender_name: user?.full_name || 'Student',
      receiver_id: adminId,
      content: input.trim(),
      sender_role: user?.role === 'admin' ? 'admin' : 'student',
    });
    setInput('');
    queryClient.invalidateQueries({ queryKey: ['messages'] });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="font-heading font-extrabold text-2xl text-foreground flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-primary" /> Messages
        </h1>
        <p className="text-muted-foreground mt-1">Chat with the admin/teacher for help.</p>
      </div>

      <Card className="flex-1 border border-border overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No messages yet. Send a message to your teacher!</p>
              </div>
            )}
            {messages.map((msg: Message) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isMe ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      isMe ? 'bg-primary text-white' : 'bg-muted border border-border'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${isMe ? 'text-right' : ''}`}>
                      {msg.sender_name} · {formatDate(msg.created_date, 'relative')}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="rounded-xl"
            />
            <Button onClick={sendMessage} disabled={!input.trim()} className="bg-primary rounded-xl shrink-0">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}