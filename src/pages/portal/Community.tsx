import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import {
  fetchCommunityPosts,
  createCommunityPost,
  addCommunityReply,
  voteCommunityPost,
  acceptCommunityReply,
  deleteCommunityPost,
} from '@/api/community'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Users, Plus, MessageCircle, Send, ChevronUp, ChevronDown,
  CheckCircle2, Search, Loader2, Shield, Trash2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useStudentLevel } from '@/hooks/use-student-level'
import { ALL_ACADEMIC_LEVELS, levelLabel, getStudentLevel } from '@/lib/student-level'
import { formatDate } from '@/lib/format-date'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import EmptyState from '@/components/shared/EmptyState'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import type { CommunityPost, CommunityReply, Subject } from '@/types'
import { cn } from '@/lib/utils'

function buildReplyTree(replies: CommunityReply[]) {
  const roots: CommunityReply[] = []
  const children = new Map<string, CommunityReply[]>()
  for (const r of replies) {
    if (r.parent_reply_id) {
      const list = children.get(r.parent_reply_id) ?? []
      list.push(r)
      children.set(r.parent_reply_id, list)
    } else {
      roots.push(r)
    }
  }
  return { roots, children }
}

function ReplyThread({
  reply,
  childrenMap,
  post,
  userId,
  userRole,
  onReply,
  onAccepted,
  depth = 0,
}: {
  reply: CommunityReply
  childrenMap: Map<string, CommunityReply[]>
  post: CommunityPost
  userId?: string
  userRole?: string
  onReply: (postId: string, parentId: string) => void
  onAccepted?: () => void
  depth?: number
}) {
  const children = childrenMap.get(reply.id) ?? []
  const isAccepted = post.accepted_reply_id === reply.id

  return (
    <div className={cn('space-y-2', depth > 0 && 'ml-4 sm:ml-6 border-l-2 border-border pl-3')}>
      <div className={cn('rounded-xl p-3', isAccepted ? 'bg-green-50 border border-green-200' : 'bg-muted/40')}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium flex items-center gap-2 flex-wrap">
              {reply.author_name}
              {reply.is_teacher && <Badge variant="secondary" className="text-xs">Teacher</Badge>}
              {reply.author_reputation != null && reply.author_reputation > 0 && (
                <span className="text-xs text-muted-foreground">{reply.author_reputation} rep</span>
              )}
              {isAccepted && (
                <span className="text-xs text-green-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Accepted</span>
              )}
            </p>
            <div className="prose prose-sm max-w-none mt-1 text-foreground">
              <ReactMarkdown>{reply.content}</ReactMarkdown>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(reply.created_at, 'short')}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onReply(post.id, reply.id)}>
            Reply
          </Button>
          {post.author_id === userId && !post.accepted_reply_id && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-green-700" onClick={async () => {
              try {
                await acceptCommunityReply(post.id, reply.id)
                toast.success('Answer accepted')
                onAccepted?.()
              } catch {
                toast.error('Could not accept answer')
              }
            }}>
              Accept
            </Button>
          )}
        </div>
      </div>
      {children.map((child) => (
        <ReplyThread
          key={child.id}
          reply={child}
          childrenMap={childrenMap}
          post={post}
          userId={userId}
          userRole={userRole}
          onReply={onReply}
          onAccepted={onAccepted}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

export default function Community() {
  const { user } = useAuth()
  const studentLevel = useStudentLevel()
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subjectTag, setSubjectTag] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [teacherOnly, setTeacherOnly] = useState(false)
  const [levelFilter, setLevelFilter] = useState<string>(getStudentLevel(studentLevel))
  const [browseAllLevels, setBrowseAllLevels] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState<'newest' | 'trending' | 'unanswered'>('newest')
  const [page, setPage] = useState(1)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [replyParent, setReplyParent] = useState<Record<string, string | undefined>>({})
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list() as Promise<Subject[]>,
  })

  const levelSubjects = useMemo(
    () => subjects.filter((s) => s.level === studentLevel),
    [subjects, studentLevel]
  )

  const { data, isLoading, isError } = useQuery({
    queryKey: ['community-posts', browseAllLevels ? 'all' : levelFilter, search, sort, page],
    queryFn: () =>
      fetchCommunityPosts({
        level: browseAllLevels ? undefined : levelFilter,
        search: search || undefined,
        order: sort,
        page,
        limit: 15,
      }),
  })

  const posts = data?.items ?? []
  const totalPages = data?.total_pages ?? 1

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['community-posts'] })

  const createPost = async () => {
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    try {
      await createCommunityPost({
        title: title.trim(),
        content: content.trim(),
        subject_tag: subjectTag || undefined,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        level: levelFilter,
        is_teacher_only: teacherOnly,
      })
      toast.success('Question posted')
      setShowForm(false)
      setTitle('')
      setContent('')
      setTagsInput('')
      invalidate()
    } catch {
      toast.error('Could not create post')
    } finally {
      setSubmitting(false)
    }
  }

  const submitReply = async (postId: string) => {
    const content = replyDrafts[postId]?.trim()
    if (!content) return
    setSubmitting(true)
    try {
      await addCommunityReply(postId, content, replyParent[postId])
      setReplyDrafts((d) => ({ ...d, [postId]: '' }))
      setReplyParent((d) => ({ ...d, [postId]: undefined }))
      invalidate()
      toast.success('Reply posted')
    } catch {
      toast.error('Could not post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      await voteCommunityPost(postId, voteType)
      invalidate()
    } catch {
      toast.error('Could not vote')
    }
  }

  const isModerator = user?.role === 'admin' || user?.role === 'teacher'

  if (isLoading && !data) return <PageLoader />

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Learning Community
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask questions, share answers, and learn together — {levelLabel(getStudentLevel(studentLevel))} by default.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Ask a question
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setSearch(searchInput), setPage(1))}
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => { setSearch(searchInput); setPage(1) }}>Search</Button>
        <Select value={sort} onValueChange={(v) => { setSort(v as typeof sort); setPage(1) }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="unanswered">Unanswered</SelectItem>
          </SelectContent>
        </Select>
        {!browseAllLevels && (
          <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v); setPage(1) }}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL_ACADEMIC_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Switch id="browse-all" checked={browseAllLevels} onCheckedChange={(v) => { setBrowseAllLevels(v); setPage(1) }} />
          <Label htmlFor="browse-all">All levels</Label>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Input placeholder="Question title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Describe your question (Markdown supported)" rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Select value={subjectTag} onValueChange={setSubjectTag}>
                <SelectTrigger><SelectValue placeholder="Subject / category" /></SelectTrigger>
                <SelectContent>
                  {levelSubjects.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Tags (comma-separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
            </div>
            {isModerator && (
              <div className="flex items-center gap-2">
                <Switch id="teacher-only" checked={teacherOnly} onCheckedChange={setTeacherOnly} />
                <Label htmlFor="teacher-only">Teachers only</Label>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={() => void createPost()} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post question'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isError && (
        <p className="text-destructive text-sm">Could not load community posts.</p>
      )}

      {posts.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No posts yet" description="Be the first to ask a question in your class community." />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const expanded = expandedPost === post.id
            const { roots, children } = buildReplyTree(post.replies ?? [])
            const score = post.upvotes - post.downvotes

            return (
              <Card key={post.id}>
                <CardContent className="pt-5">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button type="button" onClick={() => void handleVote(post.id, 'up')} className={cn('p-1 rounded hover:bg-muted', post.user_vote === 'up' && 'text-primary')}>
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-semibold">{score}</span>
                      <button type="button" onClick={() => void handleVote(post.id, 'down')} className={cn('p-1 rounded hover:bg-muted', post.user_vote === 'down' && 'text-destructive')}>
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {post.level && <Badge variant="outline">{post.level}</Badge>}
                        {post.subject_tag && <Badge variant="secondary">{post.subject_tag}</Badge>}
                        {post.tags?.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                        {post.is_teacher_only && <Badge className="gap-1"><Shield className="w-3 h-3" /> Teachers</Badge>}
                      </div>
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {post.author_name}
                        {post.author_reputation != null && post.author_reputation > 0 && ` · ${post.author_reputation} rep`}
                        {' · '}{formatDate(post.created_date, 'short')}
                        {' · '}{post.comment_count} replies
                      </p>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{expanded ? post.content : `${post.content.slice(0, 280)}${post.content.length > 280 ? '…' : ''}`}</ReactMarkdown>
                      </div>
                      {post.content.length > 280 && (
                        <Button variant="link" className="px-0 h-auto" onClick={() => setExpandedPost(expanded ? null : post.id)}>
                          {expanded ? 'Show less' : 'Read more'}
                        </Button>
                      )}

                      <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => setExpandedPost(expanded ? null : post.id)}>
                        <MessageCircle className="w-4 h-4" /> {expanded ? 'Hide replies' : 'View replies'}
                      </Button>

                      {isModerator && (
                        <Button variant="ghost" size="sm" className="ml-2 text-destructive" onClick={async () => {
                          if (!window.confirm('Delete this post?')) return
                          await deleteCommunityPost(post.id)
                          invalidate()
                          toast.success('Post deleted')
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}

                      {expanded && (
                        <div className="mt-4 space-y-3 border-t pt-4">
                          {roots.map((r) => (
                            <ReplyThread
                              key={r.id}
                              reply={r}
                              childrenMap={children}
                              post={post}
                              userId={user?.id}
                              userRole={user?.role}
                              onReply={(pid, parentId) => setReplyParent((d) => ({ ...d, [pid]: parentId }))}
                              onAccepted={invalidate}
                            />
                          ))}
                          <div className="flex gap-2">
                            <Textarea
                              placeholder={replyParent[post.id] ? 'Write a nested reply…' : 'Write an answer…'}
                              rows={2}
                              value={replyDrafts[post.id] ?? ''}
                              onChange={(e) => setReplyDrafts((d) => ({ ...d, [post.id]: e.target.value }))}
                            />
                            <Button size="icon" onClick={() => void submitReply(post.id)} disabled={submitting}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground self-center">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
