import { useState, type KeyboardEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Users, Plus, MessageCircle, Send, User, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/format-date'
import type { CommunityPost, CommunityReply } from '@/types'

export default function Community() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subjectTag, setSubjectTag] = useState('General')
  const [teacherOnly, setTeacherOnly] = useState(false)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState('all')

  const { data: posts = [], isLoading } = useQuery<CommunityPost[]>({
    queryKey: ['community-posts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 50) as Promise<CommunityPost[]>,
  })

  const filteredPosts = filter === 'all'
    ? posts.filter((p) => !p.is_teacher_only || user?.role === 'admin' || user?.role === 'teacher')
    : posts.filter(
        (p) =>
          (p.subject_tag?.toLowerCase() === filter.toLowerCase()) &&
          (!p.is_teacher_only || user?.role === 'admin' || user?.role === 'teacher')
      )

  const createPost = async () => {
    if (!title.trim() || !content.trim()) return
    await base44.entities.CommunityPost.create({
      author_id: user?.id,
      author_name: user?.full_name || 'Student',
      author_role: user?.role,
      subject_tag: subjectTag,
      title: title.trim(),
      content: content.trim(),
      is_teacher_only: teacherOnly,
      replies: [],
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
    })
    setTitle('')
    setContent('')
    setSubjectTag('General')
    setTeacherOnly(false)
    setShowForm(false)
    queryClient.invalidateQueries({ queryKey: ['community-posts'] })
  }

  const addReply = async (postId: string) => {
    const text = replyContent[postId]
    if (!text?.trim()) return
    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const newReply: CommunityReply = {
      author_id: user?.id || '',
      author_name: user?.full_name || 'Student',
      content: text.trim(),
      is_teacher: user?.role === 'admin' || user?.role === 'teacher',
      created_at: new Date().toISOString(),
    }
    await base44.entities.CommunityPost.update(postId, {
      replies: [...(post.replies || []), newReply],
      comment_count: (post.comment_count || 0) + 1,
    })
    setReplyContent({ ...replyContent, [postId]: '' })
    queryClient.invalidateQueries({ queryKey: ['community-posts'] })
  }

  const handleReplyKeyDown = (e: KeyboardEvent<HTMLInputElement>, postId: string) => {
    if (e.key === 'Enter') addReply(postId)
  }

  const filterOptions = ['all', 'Biology', 'Chemistry', 'Entrepreneurship', 'General']

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Learning Community
          </h1>
          <p className="text-muted-foreground mt-1">Ask questions, share knowledge, learn together.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Ask Question
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((f) => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" className="rounded-full capitalize" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>

      {showForm && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-5 space-y-4">
            <Input placeholder="Question title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Describe your question in detail..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
            <div className="flex flex-wrap items-center gap-4">
              <Select value={subjectTag} onValueChange={setSubjectTag}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Entrepreneurship">Entrepreneurship</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch checked={teacherOnly} onCheckedChange={setTeacherOnly} />
                <Label className="text-sm">Teachers only</Label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={createPost} className="bg-primary">Post Question</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Card key={i} className="animate-pulse border border-border"><CardContent className="p-6 h-32" /></Card>)}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No posts yet. Be the first to ask a question!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="border border-border hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline">{post.subject_tag || 'General'}</Badge>
                      {post.author_role === 'teacher' && (
                        <Badge className="bg-primary/10 text-primary border-0 gap-1"><Shield className="w-3 h-3" /> Teacher</Badge>
                      )}
                      {post.is_teacher_only && <Badge className="bg-amber-100 text-amber-700 border-0">Teachers Only</Badge>}
                    </div>
                    <h3 className="font-heading font-bold text-foreground">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author_name}</span>
                      <span>{formatDate(post.created_date, 'relative')}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {(post.replies || []).length} replies</span>
                    </div>
                  </div>
                </div>

                {(post.replies || []).length > 0 && (
                  <div className="mt-4 space-y-2 pl-4 border-l-2 border-border">
                    {(post.replies || []).map((r, i) => (
                      <div key={i} className="p-3 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs text-foreground">{r.author_name}</span>
                          {r.is_teacher && <Badge className="bg-primary/10 text-primary border-0 text-xs">Teacher</Badge>}
                          <span className="text-xs text-muted-foreground">{formatDate(r.created_at, 'relative')}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="Write a reply..."
                    value={replyContent[post.id] || ''}
                    onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                    onKeyDown={(e) => handleReplyKeyDown(e, post.id)}
                    className="rounded-xl"
                  />
                  <Button size="icon" onClick={() => addReply(post.id)} className="bg-primary rounded-xl shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
