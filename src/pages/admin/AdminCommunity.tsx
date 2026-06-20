import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCommunityPosts, deleteCommunityPost } from '@/api/community'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Trash2, Search } from 'lucide-react'
import { useState } from 'react'
import { formatDate } from '@/lib/format-date'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import toast from 'react-hot-toast'

export default function AdminCommunity() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['community-posts-admin'],
    queryFn: () => fetchCommunityPosts({ limit: 100, order: 'newest' }),
  })

  const posts = data?.items ?? []

  const filtered = posts.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    await deleteCommunityPost(id)
    queryClient.invalidateQueries({ queryKey: ['community-posts-admin'] })
    toast.success('Post removed')
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Community Moderation</h1>
        <p className="text-muted-foreground mt-1">Review and moderate student community posts.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-4">
        {filtered.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-medium text-sm">{post.author_name}</span>
                    {post.author_role === 'teacher' && <Badge className="bg-green-100 text-green-700">Teacher</Badge>}
                    {post.author_role === 'admin' && <Badge className="bg-blue-100 text-blue-700">Admin</Badge>}
                    {post.subject_tag && <Badge variant="outline">{post.subject_tag}</Badge>}
                    <span className="text-xs text-muted-foreground">{formatDate(post.created_date, 'relative')}</span>
                  </div>
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>↑ {post.upvotes}</span>
                    <span>↓ {post.downvotes}</span>
                    <span>{post.comment_count} comments</span>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)} className="gap-1 shrink-0">
                  <Trash2 className="w-4 h-4" /> Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
