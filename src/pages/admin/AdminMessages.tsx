import { useMemo, useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, User, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';

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

interface Student {
  id: string;
  full_name?: string;
  email: string;
  role: string;
}

export default function AdminMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [input, setInput] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: allMessages = [] } = useQuery<Message[]>({
    queryKey: ['admin-all-messages'],
    queryFn: async () => {
      const msgs = await base44.entities.Message.list('-created_date', 500);
      return msgs;
    },
    refetchInterval: 5000,
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['admin-students'],
    queryFn: () => base44.entities.User.list(),
  });

  // Group messages by student
  const studentList = students.filter((s: Student) => s.role !== 'admin');
  const conversationStudents = studentList.filter((s: Student) => {
    return allMessages.some((m: Message) => m.sender_id === s.id || m.receiver_id === s.id);
  });

  // Show students with conversations first, then all others
  const sortedStudents = [
    ...conversationStudents,
    ...studentList.filter((s: Student) => !conversationStudents.find((cs: Student) => cs.id === s.id)),
  ];

  const selectedMessages = useMemo(() => (
    selectedStudent
      ? allMessages.filter((m: Message) =>
          (m.sender_id === selectedStudent.id && m.receiver_id === user?.id) ||
          (m.sender_id === user?.id && m.receiver_id === selectedStudent.id)
        ).sort((a: Message, b: Message) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime())
      : []
  ), [allMessages, selectedStudent, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessages]);

  // Mark messages as read
  useEffect(() => {
    if (!selectedStudent) return;
    const unread = selectedMessages.filter((m: Message) => m.sender_id === selectedStudent.id && !m.is_read);
    unread.forEach((m: Message) => base44.entities.Message.update(m.id, { is_read: true }));
  }, [selectedMessages, selectedStudent]);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || !selectedStudent) return;
    await base44.entities.Message.create({
      sender_id: user?.id,
      sender_name: user?.full_name || 'Admin',
      receiver_id: selectedStudent.id,
      content: input.trim(),
      sender_role: 'admin',
    });
    setInput('');
    queryClient.invalidateQueries({ queryKey: ['admin-all-messages'] });
  };

  const getUnreadCount = (studentId: string): number => {
    return allMessages.filter((m: Message) => m.sender_id === studentId && !m.is_read).length;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Student Messages</h1>
        <p className="text-muted-foreground mt-1">Chat with students who need help.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        {/* Student list */}
        <Card className="border border-border overflow-hidden">
          <div className="p-3 border-b border-border">
            <p className="font-medium text-sm text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Students ({sortedStudents.length})
            </p>
          </div>
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {sortedStudents.map((s: Student) => {
                const unread = getUnreadCount(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors",
                      selectedStudent?.id === s.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
                    )}
                  >
                    <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{s.full_name || s.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                    {unread > 0 && (
                      <Badge className="bg-primary text-white border-0 text-xs">{unread}</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat area */}
        <Card className="md:col-span-2 border border-border overflow-hidden flex flex-col">
          {selectedStudent ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedStudent.full_name || selectedStudent.email}</p>
                  <p className="text-xs text-muted-foreground">{selectedStudent.email}</p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {selectedMessages.map((msg: Message) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-primary text-white' : 'bg-muted border border-border'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-muted-foreground'}`}>{formatDate(msg.created_date, 'relative')}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
              <div className="border-t border-border p-4 flex gap-2">
                <Input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                  placeholder="Type your reply..." 
                  className="rounded-xl" 
                />
                <Button onClick={sendMessage} disabled={!input.trim()} className="bg-primary rounded-xl"><Send className="w-5 h-5" /></Button>
              </div>
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
  );
}