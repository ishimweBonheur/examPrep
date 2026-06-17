import { useState, useRef, useEffect, KeyboardEvent, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  createTutorSession,
  fetchTutorSession,
  listTutorImages,
  listTutorSessions,
  streamTutorChat,
  uploadTutorImages,
  type TutorMessage,
  type TutorSession,
  type TutorUploadedImage,
} from '@/api/tutor'
import { base44 } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Brain,
  Plus,
  Send,
  Loader2,
  Sparkles,
  Search,
  MessageSquare,
  BookOpen,
  Target,
  HelpCircle,
  PanelLeft,
  X,
  PenLine,
  ImageIcon,
  Pencil,
  Globe,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '@/hooks/use-auth'
import { useStudentLevel } from '@/hooks/use-student-level'
import { levelLabel, matchesStudentLevel } from '@/lib/student-level'
import { getSuggestedPrompts, getTutorSubtitle, getWelcomeMessage } from '@/lib/tutor-content'
import { cn } from '@/lib/utils'
import type { Subject } from '@/types'

function sessionKey(userId: string) {
  return `examprep_ai_tutor_session_${userId}`
}

function formatSessionLabel(session: TutorSession) {
  if (session.subject?.trim()) return session.subject.trim()
  const d = new Date(session.updated_date || session.created_date)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Today · ${time}`
  if (isYesterday) return `Yesterday · ${time}`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: `${i * 160}ms`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  )
}

function SidebarContent({
  subtitle,
  searchQuery,
  onSearchChange,
  onNewChat,
  onSelectSession,
  sessions,
  sessionId,
  booting,
  loading,
  onNavigate,
}: {
  subtitle: string
  searchQuery: string
  onSearchChange: (v: string) => void
  onNewChat: () => void
  onSelectSession: (id: string) => void
  sessions: TutorSession[]
  sessionId: string | null
  booting: boolean
  loading: boolean
  onNavigate?: () => void
}) {
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return sessions
    return sessions.filter((s) => formatSessionLabel(s).toLowerCase().includes(q))
  }, [searchQuery, sessions])

  const navLinks = [
    { to: '/dashboard/practice', icon: Target, label: 'Practice' },
    { to: '/dashboard/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/dashboard/help', icon: HelpCircle, label: 'Help' },
  ]

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2.5 px-3 pt-4 pb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/20">
          <Brain className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-bold text-foreground truncate">AI Tutor</p>
          <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
        </div>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onNewChat}
          disabled={booting || loading}
          className="flex w-full items-center gap-2.5 rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted/80 hover:border-primary/20 disabled:opacity-50"
        >
          <PenLine className="h-4 w-4 shrink-0 text-muted-foreground" />
          New chat
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chats"
            className="h-9 rounded-xl border-border/60 bg-background/80 pl-9 text-xs shadow-none"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-2">
        <div className="space-y-0.5 pb-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              {searchQuery ? 'No chats found' : 'No conversations yet'}
            </p>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSession(s.id)}
                disabled={booting}
                className={cn(
                  'group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150',
                  s.id === sessionId
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/80 hover:bg-muted/70'
                )}
              >
                <MessageSquare
                  className={cn(
                    'h-4 w-4 shrink-0',
                    s.id === sessionId ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span className="truncate">{formatSessionLabel(s)}</span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="mt-auto border-t border-border/60 p-2 space-y-0.5">
        {navLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function AiTutor() {
  const { user } = useAuth()
  const studentLevel = useStudentLevel()

  const { data: levelSubjects = [] } = useQuery<Subject[]>({
    queryKey: ['tutor-subjects', studentLevel],
    queryFn: async () => {
      const all = (await base44.entities.Subject.list()) as Subject[]
      return all.filter((s) => matchesStudentLevel(s.level, studentLevel))
    },
    enabled: !!user?.id,
  })

  const subjectNames = useMemo(() => levelSubjects.map((s) => s.name), [levelSubjects])

  const welcomeMessage = useMemo(
    (): TutorMessage => ({
      role: 'ai',
      content: getWelcomeMessage(studentLevel, subjectNames),
    }),
    [studentLevel, subjectNames]
  )

  const suggestedPrompts = useMemo(
    () => getSuggestedPrompts(studentLevel, subjectNames),
    [studentLevel, subjectNames]
  )

  const subtitle = useMemo(
    () => getTutorSubtitle(studentLevel, subjectNames),
    [studentLevel, subjectNames]
  )

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<TutorSession[]>([])
  const [messages, setMessages] = useState<TutorMessage[]>([welcomeMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [booting, setBooting] = useState(true)
  const [images, setImages] = useState<TutorUploadedImage[]>([])
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isEmptyChat = messages.length <= 1 && messages[0]?.role === 'ai' && !loading && !booting

  const emptyStateTitle = `What are you working on, ${user?.full_name?.split(' ')[0] ?? 'there'}?`

  const quickActions = useMemo(
    () => [
      { label: 'Explain a topic', icon: BookOpen, prompt: suggestedPrompts[0] ?? 'Explain a key topic for my class' },
      { label: 'Quiz me', icon: Pencil, prompt: suggestedPrompts[3] ?? 'Quiz me on my subjects' },
      { label: 'Upload a diagram', icon: ImageIcon, action: 'attach' as const },
    ],
    [suggestedPrompts]
  )

  useEffect(() => {
    if (!user?.id) return
    let canceled = false

    ;(async () => {
      setBooting(true)
      const key = sessionKey(user.id)
      const stored = localStorage.getItem(key)

      try {
        const all = await listTutorSessions().catch(() => [])
        if (canceled) return
        const sorted = [...all].sort(
          (a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime()
        )
        setSessions(sorted)

        let id = stored ?? sorted[0]?.id ?? null
        if (!id) {
          const session = await createTutorSession()
          if (canceled) return
          id = session.id
          localStorage.setItem(key, id)
          setSessions((prev) => [session, ...prev])
        }

        const data = await fetchTutorSession(id)
        if (canceled) return
        setSessionId(id)
        setMessages(data.messages.length ? data.messages : [welcomeMessage])
        const imgs = await listTutorImages(id).catch(() => [])
        if (canceled) return
        setImages(imgs)
        setSelectedImageIds(imgs.map((i) => i.id))
      } catch {
        const session = await createTutorSession()
        if (canceled) return
        localStorage.setItem(key, session.id)
        setSessionId(session.id)
        setMessages([welcomeMessage])
        setSessions((prev) => [session, ...prev])
        setImages([])
        setSelectedImageIds([])
      } finally {
        if (!canceled) setBooting(false)
      }
    })()

    return () => {
      canceled = true
    }
  }, [user?.id, welcomeMessage])

  useEffect(() => {
    if (!sessionId) return
    ;(async () => {
      const imgs = await listTutorImages(sessionId).catch(() => [])
      setImages(imgs)
      setSelectedImageIds(imgs.map((i) => i.id))
    })()
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const closeSidebar = () => setSidebarOpen(false)

  const startNewChat = async () => {
    if (!user?.id) return
    setBooting(true)
    closeSidebar()
    try {
      const session = await createTutorSession()
      localStorage.setItem(sessionKey(user.id), session.id)
      setSessions((prev) => [session, ...prev])
      setSessionId(session.id)
      setMessages([welcomeMessage])
      setImages([])
      setSelectedImageIds([])
      setInput('')
    } finally {
      setBooting(false)
    }
  }

  const switchSession = async (id: string) => {
    if (!user?.id) return
    setBooting(true)
    closeSidebar()
    try {
      localStorage.setItem(sessionKey(user.id), id)
      setSessionId(id)
      const data = await fetchTutorSession(id)
      setMessages(data.messages.length ? data.messages : [welcomeMessage])
      const imgs = await listTutorImages(id).catch(() => [])
      setImages(imgs)
      setSelectedImageIds(imgs.map((i) => i.id))
    } finally {
      setBooting(false)
    }
  }

  const updateLastAiMessage = useCallback((updater: (content: string) => string) => {
    setMessages((prev) => {
      const next = [...prev]
      const lastIndex = next.length - 1
      if (lastIndex >= 0 && next[lastIndex]?.role === 'ai') {
        next[lastIndex] = { ...next[lastIndex]!, content: updater(next[lastIndex]!.content) }
      }
      return next
    })
  }, [])

  const sendMessage = async (text?: string): Promise<void> => {
    const userMsg = (text ?? input).trim()
    if (!userMsg || loading || !sessionId) return
    setInput('')

    setMessages((prev) => [...prev, { role: 'user', content: userMsg }, { role: 'ai', content: '' }])
    setLoading(true)
    setStreaming(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamTutorChat({
        sessionId,
        message: userMsg,
        imageIds: selectedImageIds.length ? selectedImageIds : undefined,
        onChunk: (chunk) => updateLastAiMessage((content) => content + chunk),
        onDone: () => {
          setLoading(false)
          setStreaming(false)
        },
        onError: (message) => {
          updateLastAiMessage((content) => content || `Sorry, something went wrong: ${message}`)
          setLoading(false)
          setStreaming(false)
        },
        signal: controller.signal,
      })
      if (user?.id) {
        const all = await listTutorSessions().catch(() => [])
        setSessions(
          [...all].sort((a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime())
        )
      }
    } catch (error) {
      if (controller.signal.aborted) return
      const message = error instanceof Error ? error.message : 'Failed to get a response'
      updateLastAiMessage((content) => content || `Sorry, I couldn't respond right now. ${message}`)
      setLoading(false)
      setStreaming(false)
    }
  }

  const pickImages = () => {
    if (loading || booting || uploading) return
    fileRef.current?.click()
  }

  const onImagesSelected = async (files: FileList | null) => {
    if (!files || !sessionId) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    const chosen = Array.from(files)
      .filter((f) => allowed.includes(f.type) && f.size <= 10 * 1024 * 1024)
      .slice(0, Math.max(0, 20 - images.length))
    if (!chosen.length) return

    setUploading(true)
    try {
      await uploadTutorImages(sessionId, chosen)
      const imgs = await listTutorImages(sessionId).catch(() => [])
      setImages(imgs)
      setSelectedImageIds(imgs.map((i) => i.id))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sidebarProps = {
    subtitle,
    searchQuery,
    onSearchChange: setSearchQuery,
    onNewChat: startNewChat,
    onSelectSession: switchSession,
    sessions,
    sessionId,
    booting,
    loading,
    onNavigate: closeSidebar,
  }

  const inputBlock = (centered = false) => (
    <div className={cn('w-full', centered ? 'max-w-2xl mx-auto' : 'max-w-3xl mx-auto')}>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => onImagesSelected(e.target.files)}
      />

      {images.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5 justify-center">
          {images.map((img) => {
            const checked = selectedImageIds.includes(img.id)
            return (
              <button
                key={img.id}
                type="button"
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] transition-all duration-200',
                  checked
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/30'
                )}
                onClick={() => {
                  setSelectedImageIds((prev) =>
                    prev.includes(img.id) ? prev.filter((x) => x !== img.id) : [...prev, img.id]
                  )
                }}
                disabled={loading || booting}
                title={img.original_name}
              >
                {checked ? '✓ ' : ''}
                {img.original_name.length > 22 ? `${img.original_name.slice(0, 19)}…` : img.original_name}
              </button>
            )
          })}
        </div>
      )}

      <div
        className={cn(
          'flex items-end gap-2 rounded-[28px] border border-border/80 bg-background p-2 shadow-lg shadow-black/5 transition-all duration-200',
          'focus-within:border-primary/40 focus-within:shadow-primary/10',
          centered && 'bg-muted/20'
        )}
      >
        <Button
          type="button"
          onClick={pickImages}
          disabled={loading || booting || uploading || !sessionId || images.length >= 20}
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
        </Button>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything"
          rows={1}
          className="min-h-[44px] max-h-[200px] flex-1 resize-none border-0 bg-transparent px-1 py-2.5 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={loading || booting}
        />
        <Button
          type="button"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading || booting}
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full bg-primary shadow-sm shadow-primary/20 transition-transform hover:scale-105 disabled:hover:scale-100"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>

      {!centered && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Enter to send · Shift+Enter for new line · {levelLabel(studentLevel)} curriculum
        </p>
      )}
    </div>
  )

  return (
    <div className="-mx-4 sm:-mx-8 -my-6 flex h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-4rem)] bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-full w-[260px] shrink-0 flex-col border-r border-border/60 bg-muted/25 min-h-0">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            onClick={closeSidebar}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-background shadow-xl md:hidden animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-end p-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={closeSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent {...sidebarProps} />
          </aside>
        </>
      )}

      {/* Main panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <span className="font-heading text-sm font-semibold truncate">AI Tutor</span>
        </header>

        {booting && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          </div>
        )}

        {!booting && isEmptyChat && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-4 animate-in fade-in duration-500">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground text-center mb-8 max-w-lg leading-tight">
              {emptyStateTitle}
            </h2>
            {inputBlock(true)}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    if ('action' in action && action.action === 'attach') pickImages()
                    else if ('prompt' in action) sendMessage(action.prompt)
                  }}
                  disabled={loading || booting}
                  className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground shadow-sm transition-all duration-200 hover:bg-muted/60 hover:border-primary/25"
                >
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  {action.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => sendMessage(`Help me study for ${levelLabel(studentLevel)} exams`)}
                disabled={loading || booting}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground shadow-sm transition-all duration-200 hover:bg-muted/60 hover:border-primary/25"
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                Exam prep
              </button>
            </div>
            <p className="mt-8 text-xs text-muted-foreground text-center max-w-md">
              Tailored to {subtitle}. Pick a chat from the sidebar or start typing above.
            </p>
          </div>
        )}

        {!booting && !isEmptyChat && (
          <>
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
                <div className="space-y-6 pb-4">
                  {messages.map((msg, i) => {
                    const isStreamingEmpty =
                      msg.role === 'ai' && !msg.content && i === messages.length - 1 && streaming

                    if (isStreamingEmpty) {
                      return (
                        <div key={i} className="flex gap-3 animate-in fade-in duration-300">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                            <Sparkles className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 rounded-2xl bg-muted/40 px-4 py-3">
                            <TypingIndicator />
                          </div>
                        </div>
                      )
                    }

                    if (!msg.content) return null

                    if (msg.role === 'user') {
                      return (
                        <div
                          key={i}
                          className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300"
                        >
                          <div className="max-w-[88%] sm:max-w-[80%] rounded-3xl rounded-br-lg bg-primary px-4 py-3 text-primary-foreground shadow-md shadow-primary/15">
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="prose prose-sm max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:leading-relaxed [&_li]:my-0.5 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-4">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            {streaming && i === messages.length - 1 && (
                              <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary animate-pulse align-middle" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div ref={bottomRef} className="h-1" />
              </div>
            </div>

            <div className="sticky bottom-0 z-10 border-t border-border/60 bg-background/95 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4">
              {inputBlock(false)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
