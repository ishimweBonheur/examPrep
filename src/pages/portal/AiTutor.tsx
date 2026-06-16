import React, { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { streamTutorChat, type TutorMessage } from '@/api/tutor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Send, Loader2, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const STORAGE_KEY = 'examprep_ai_tutor_messages';

const WELCOME_MESSAGE: TutorMessage = {
  role: 'ai',
  content: "Hello! I'm your AI Tutor. I can help you with Biology, Chemistry, and Entrepreneurship questions. Ask me anything about your S3 subjects!",
};

function loadStoredMessages(): TutorMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(stored) as TutorMessage[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [WELCOME_MESSAGE];
    return parsed;
  } catch {
    return [WELCOME_MESSAGE];
  }
}

export default function AiTutor() {
  const [messages, setMessages] = useState<TutorMessage[]>(loadStoredMessages);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const updateLastAiMessage = useCallback((updater: (content: string) => string) => {
    setMessages((prev) => {
      const next = [...prev];
      const lastIndex = next.length - 1;
      if (lastIndex >= 0 && next[lastIndex].role === 'ai') {
        next[lastIndex] = { ...next[lastIndex], content: updater(next[lastIndex].content) };
      }
      return next;
    });
  }, []);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');

    const nextMessages: TutorMessage[] = [...messages, { role: 'user', content: userMsg }];
    setMessages([...nextMessages, { role: 'ai', content: '' }]);
    setLoading(true);
    setStreaming(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamTutorChat({
        messages: nextMessages,
        onChunk: (text) => {
          updateLastAiMessage((content) => content + text);
        },
        onDone: () => {
          setLoading(false);
          setStreaming(false);
        },
        onError: (message) => {
          updateLastAiMessage((content) =>
            content || `Sorry, something went wrong: ${message}`
          );
          setLoading(false);
          setStreaming(false);
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) return;

      const message = error instanceof Error ? error.message : 'Failed to get a response';
      updateLastAiMessage((content) =>
        content || `Sorry, I couldn't respond right now. ${message}`
      );
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmptyStreamingBubble = (msg: TutorMessage, index: number) =>
    msg.role === 'ai' && !msg.content && index === messages.length - 1 && streaming;

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="font-heading font-extrabold text-2xl text-foreground flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary" /> AI Tutor
        </h1>
        <p className="text-muted-foreground mt-1">Ask any question about Biology, Chemistry or Entrepreneurship.</p>
      </div>

      <Card className="flex-1 border border-border overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => {
            if (isEmptyStreamingBubble(msg, i)) {
              return (
                <div key={i} className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted border border-border rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              );
            }

            return (
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
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your question here..."
              rows={2}
              className="resize-none rounded-xl"
              disabled={loading}
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
