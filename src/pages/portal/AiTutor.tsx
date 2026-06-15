import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { base44 } from '@/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Send, Loader2, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

export default function AiTutor() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm your AI Tutor 🤖. I can help you with Biology, Chemistry, and Entrepreneurship questions. Ask me anything about your S3 subjects!" }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev: Message[]) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const conversationContext = messages.slice(-6).map((m: Message) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI tutor for Rwandan S3 students preparing for national exams in Biology, Chemistry, and Entrepreneurship. Be clear, concise, and encouraging. Use examples relevant to Rwanda when possible. If the student asks a question, provide a thorough but easy-to-understand answer. You can also generate practice questions when asked.

Previous conversation:
${conversationContext}

Student's question: ${userMsg}

Provide a helpful, educational response:`,
    }) as { response?: string };

    const aiContent = result.response ?? 'Sorry, I could not generate a response. Please try again.';
    setMessages((prev: Message[]) => [...prev, { role: 'ai', content: aiContent }]);
    setLoading(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="font-heading font-extrabold text-2xl text-foreground flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary" /> AI Tutor
        </h1>
        <p className="text-muted-foreground mt-1">Ask any question about Biology, Chemistry or Entrepreneurship.</p>
      </div>

      {/* Chat area */}
      <Card className="flex-1 border border-border overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg: Message, i: number) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-muted border border-border'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted border border-border rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your question here..."
              rows={2}
              className="resize-none rounded-xl"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-primary hover:bg-primary/90 rounded-xl h-auto px-4"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </Card>
    </div>
  );
}