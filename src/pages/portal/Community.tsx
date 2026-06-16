import { useState, useRef, type KeyboardEvent, type ChangeEvent } from 'react'
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
import { 
  Users, Plus, MessageCircle, Send, User, Shield, 
  Image, X, ChevronDown, ChevronUp, Paperclip, Eye
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/format-date'
import type { CommunityPost, CommunityReply } from '@/types'

// Extended reply type with image support
interface ExtendedReply extends CommunityReply {
  image_url?: string;
}

// Extended post type with image support
interface ExtendedPost extends CommunityPost {
  images?: string[];
  replies?: ExtendedReply[];
}

export default function Community() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replyFileInputRef = useRef<Record<string, HTMLInputElement | null>>({})
  
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subjectTag, setSubjectTag] = useState('General')
  const [teacherOnly, setTeacherOnly] = useState(false)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState('all')
  
  // Image upload states
  const [postImages, setPostImages] = useState<string[]>([])
  const [replyImages, setReplyImages] = useState<Record<string, string[]>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Load more replies states
  const [visibleReplies, setVisibleReplies] = useState<Record<string, number>>({})
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({})
  const REPLIES_PER_PAGE = 3

  const { data: posts = [], isLoading } = useQuery<ExtendedPost[]>({
    queryKey: ['community-posts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 50) as Promise<ExtendedPost[]>,
  })

  const filteredPosts = filter === 'all'
    ? posts.filter((p) => !p.is_teacher_only || user?.role === 'admin' || user?.role === 'teacher')
    : posts.filter(
        (p) =>
          (p.subject_tag?.toLowerCase() === filter.toLowerCase()) &&
          (!p.is_teacher_only || user?.role === 'admin' || user?.role === 'teacher')
      )

  // Image upload handler
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'post' | 'reply', replyPostId?: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    const imageUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Simulate image upload - replace with your actual upload logic
        const imageUrl = await simulateImageUpload(file)
        imageUrls.push(imageUrl)
      }

      if (type === 'post') {
        setPostImages([...postImages, ...imageUrls])
      } else if (type === 'reply' && replyPostId) {
        setReplyImages({
          ...replyImages,
          [replyPostId]: [...(replyImages[replyPostId] || []), ...imageUrls]
        })
      }
    } catch (error) {
      console.error('Image upload failed:', error)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Simulate image upload (replace with actual API call)
  const simulateImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTimeout(() => {
          resolve(e.target?.result as string)
        }, 500)
      }
      reader.readAsDataURL(file)
    })
  }

  // Remove image
  const removeImage = (index: number, type: 'post' | 'reply', replyPostId?: string) => {
    if (type === 'post') {
      setPostImages(postImages.filter((_, i) => i !== index))
    } else if (type === 'reply' && replyPostId) {
      const updatedImages = (replyImages[replyPostId] || []).filter((_, i) => i !== index)
      setReplyImages({ ...replyImages, [replyPostId]: updatedImages })
    }
  }

  // Load more replies
  const loadMoreReplies = (postId: string) => {
    setVisibleReplies({
      ...visibleReplies,
      [postId]: (visibleReplies[postId] || REPLIES_PER_PAGE) + REPLIES_PER_PAGE
    })
  }

  // Show less replies
  const showLessReplies = (postId: string) => {
    setVisibleReplies({
      ...visibleReplies,
      [postId]: REPLIES_PER_PAGE
    })
  }

  // Toggle expand post content
  const toggleExpandPost = (postId: string) => {
    setExpandedPosts({
      ...expandedPosts,
      [postId]: !expandedPosts[postId]
    })
  }

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
      images: postImages,
      replies: [],
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
    })
    // Reset form
    setTitle('')
    setContent('')
    setSubjectTag('General')
    setTeacherOnly(false)
    setPostImages([])
    setShowForm(false)
    queryClient.invalidateQueries({ queryKey: ['community-posts'] })
  }

  const addReply = async (postId: string) => {
    const text = replyContent[postId]
    const images = replyImages[postId] || []
    if (!text?.trim() && images.length === 0) return
    
    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const newReply: ExtendedReply = {
      author_id: user?.id || '',
      author_name: user?.full_name || 'Student',
      content: text?.trim() || '',
      is_teacher: user?.role === 'admin' || user?.role === 'teacher',
      created_at: new Date().toISOString(),
      image_url: images.length > 0 ? images[0] : undefined,
    }
    
    await base44.entities.CommunityPost.update(postId, {
      replies: [...(post.replies || []), newReply],
      comment_count: (post.comment_count || 0) + 1,
    })
    
    setReplyContent({ ...replyContent, [postId]: '' })
    setReplyImages({ ...replyImages, [postId]: [] })
    
    // Show the new reply immediately
    setVisibleReplies({
      ...visibleReplies,
      [postId]: Math.max(visibleReplies[postId] || REPLIES_PER_PAGE, (post.replies?.length || 0) + 1)
    })
    
    queryClient.invalidateQueries({ queryKey: ['community-posts'] })
  }

  const handleReplyKeyDown = (e: KeyboardEvent<HTMLInputElement>, postId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addReply(postId)
    }
  }

  const filterOptions = ['all', 'Biology', 'Chemistry', 'Entrepreneurship', 'General']

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Learning Community
          </h1>
          <p className="text-muted-foreground mt-1">Ask questions, share knowledge, learn together.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary rounded-sm gap-2 shadow-md shadow-primary/20 hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Ask Question
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((f) => (
          <Button 
            key={f} 
            variant={filter === f ? 'default' : 'outline'} 
            size="sm" 
            className={`rounded-sm capitalize transition-all ${
              filter === f ? 'shadow-sm' : ''
            }`}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Create Post Form */}
      {showForm && (
        <Card className="border-2 border-primary/20 shadow-lg animate-slideDown">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Ask a Question</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <Input 
              placeholder="Question title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="rounded-sm"
            />
            
            <Textarea 
              placeholder="Describe your question in detail... You can also add images!" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              rows={4} 
              className="rounded-sm"
            />
            
            {/* Image Preview */}
            {postImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {postImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded-sm" />
                    <button
                      onClick={() => removeImage(index, 'post')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-4">
              <Select value={subjectTag} onValueChange={setSubjectTag}>
                <SelectTrigger className="w-48 rounded-sm"><SelectValue /></SelectTrigger>
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
            
            <div className="flex items-center gap-2 justify-between">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, 'post')}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-sm gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  <Image className="w-4 h-4" />
                  {uploadingImage ? 'Uploading...' : 'Add Images'}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-sm">Cancel</Button>
                <Button onClick={createPost} className="bg-primary rounded-sm shadow-md">Post Question</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border border-border">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded-sm w-3/4" />
                  <div className="h-4 bg-muted rounded-sm w-1/2" />
                  <div className="h-20 bg-muted rounded-sm" />
                </div>
              </CardContent>
            </Card>
          ))}
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
          {filteredPosts.map((post) => {
            const totalReplies = (post.replies || []).length
            const visibleCount = visibleReplies[post.id] || REPLIES_PER_PAGE
            const hasMoreReplies = totalReplies > visibleCount
            const isExpanded = expandedPosts[post.id] || false
            
            return (
              <Card key={post.id} className="border border-border hover:shadow-md transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge variant="outline" className="rounded-sm">{post.subject_tag || 'General'}</Badge>
                        {post.author_role === 'teacher' && (
                          <Badge className="bg-primary/10 text-primary border-0 gap-1 rounded-sm">
                            <Shield className="w-3 h-3" /> Teacher
                          </Badge>
                        )}
                        {post.is_teacher_only && (
                          <Badge className="bg-amber-100 text-amber-700 border-0 rounded-sm">Teachers Only</Badge>
                        )}
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-heading font-bold text-foreground">{post.title}</h3>
                      
                      {/* Content with expand/collapse */}
                      <div className="relative">
                        <p className={`text-sm text-muted-foreground mt-1 ${!isExpanded && 'line-clamp-3'}`}>
                          {post.content}
                        </p>
                        {post.content.length > 300 && (
                          <button
                            onClick={() => toggleExpandPost(post.id)}
                            className="text-xs text-primary font-medium mt-1 hover:underline"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                      
                      {/* Post Images */}
                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {post.images.map((img, index) => (
                            <div key={index} className="relative group cursor-pointer">
                              <img 
                                src={img} 
                                alt={`Post image ${index + 1}`} 
                                className="w-full h-40 object-cover rounded-sm hover:scale-105 transition-transform" 
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-sm flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Post Meta */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {post.author_name}
                        </span>
                        <span>{formatDate(post.created_date, 'relative')}</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {totalReplies} replies
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Replies Section */}
                  {totalReplies > 0 && (
                    <div className="mt-4 space-y-2 pl-4 border-l-2 border-border">
                      {(post.replies || []).slice(0, visibleCount).map((r, i) => (
                        <div key={i} className="p-3 rounded-sm bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs text-foreground">{r.author_name}</span>
                            {r.is_teacher && (
                              <Badge className="bg-primary/10 text-primary border-0 text-xs rounded-sm">Teacher</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{formatDate(r.created_at, 'relative')}</span>
                          </div>
                          {r.content && <p className="text-sm text-muted-foreground">{r.content}</p>}
                          
                          {/* Reply Image */}
                          {r.image_url && (
                            <img 
                              src={r.image_url} 
                              alt="Reply attachment" 
                              className="mt-2 max-h-48 rounded-sm object-cover cursor-pointer hover:scale-105 transition-transform" 
                            />
                          )}
                        </div>
                      ))}
                      
                      {/* Load More / Show Less Replies */}
                      {totalReplies > REPLIES_PER_PAGE && (
                        <div className="flex gap-2 pt-2">
                          {hasMoreReplies ? (
                            <button
                              onClick={() => loadMoreReplies(post.id)}
                              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                            >
                              <ChevronDown className="w-3 h-3" />
                              Show {Math.min(totalReplies - visibleCount, REPLIES_PER_PAGE)} more replies
                            </button>
                          ) : visibleCount > REPLIES_PER_PAGE && (
                            <button
                              onClick={() => showLessReplies(post.id)}
                              className="flex items-center gap-1 text-xs text-muted-foreground font-medium hover:underline"
                            >
                              <ChevronUp className="w-3 h-3" />
                              Show less replies
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reply Input */}
                  <div className="mt-4 space-y-2">
                    {/* Reply Image Preview */}
                    {(replyImages[post.id] || []).length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {(replyImages[post.id] || []).map((img, index) => (
                          <div key={index} className="relative group">
                            <img src={img} alt={`Reply upload ${index + 1}`} className="w-16 h-16 object-cover rounded-sm" />
                            <button
                              onClick={() => removeImage(index, 'reply', post.id)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Write a reply..."
                          value={replyContent[post.id] || ''}
                          onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                          onKeyDown={(e) => handleReplyKeyDown(e, post.id)}
                          className="rounded-sm"
                        />
                        <input
                          ref={(el) => { replyFileInputRef.current[post.id] = el }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'reply', post.id)}
                          className="hidden"
                        />
                        <Button 
                          size="icon" 
                          variant="outline"
                          className="rounded-sm shrink-0"
                          onClick={() => replyFileInputRef.current[post.id]?.click()}
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button 
                        size="icon" 
                        onClick={() => addReply(post.id)} 
                        className="bg-primary rounded-sm shrink-0 shadow-md"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}