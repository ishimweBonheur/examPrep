import { useState, type ChangeEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2, Star, MessageSquareQuote, Upload, Loader2, User } from 'lucide-react'
import { formatDate } from '@/lib/format-date'
import type { Testimonial } from '@/types'

interface ReviewForm {
  user_name: string
  role: string
  message: string
  rating: number
  avatar_url: string
  is_active: boolean
}

const emptyForm: ReviewForm = {
  user_name: '',
  role: '',
  message: '',
  rating: 5,
  avatar_url: '',
  is_active: true,
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${n} stars`}
        >
          <Star className={`w-6 h-6 ${n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  )
}

export default function AdminTestimonials() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<ReviewForm>(emptyForm)
  const [uploading, setUploading] = useState(false)

  const { data: reviews = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: () => base44.entities.Testimonial.list('-created_date') as Promise<Testimonial[]>,
  })

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { file_url } = await base44.integrations.Core.UploadFile({ file })
    setForm((prev) => ({ ...prev, avatar_url: file_url }))
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.user_name.trim() || !form.message.trim()) return
    const payload = {
      ...form,
      updated_date: new Date().toISOString(),
    }
    if (editId) {
      await base44.entities.Testimonial.update(editId, payload)
    } else {
      await base44.entities.Testimonial.create(payload)
    }
    setOpen(false)
    setEditId(null)
    setForm(emptyForm)
    queryClient.invalidateQueries({ queryKey: ['testimonials'] })
  }

  const handleEdit = (review: Testimonial) => {
    setEditId(review.id)
    setForm({
      user_name: review.user_name,
      role: review.role,
      message: review.message,
      rating: review.rating,
      avatar_url: review.avatar_url || '',
      is_active: review.is_active,
    })
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    await base44.entities.Testimonial.delete(id)
    queryClient.invalidateQueries({ queryKey: ['testimonials'] })
  }

  const handleDialogChange = (v: boolean) => {
    setOpen(v)
    if (!v) {
      setEditId(null)
      setForm(emptyForm)
    }
  }

  const activeCount = reviews.filter((r) => r.is_active).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground flex items-center gap-2">
            <MessageSquareQuote className="w-7 h-7 text-primary" />
            User Reviews
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage testimonials shown on the landing page under &ldquo;What Students Say&rdquo;.
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{reviews.length} total</Badge>
            <Badge className="bg-green-100 text-green-700 border-0">{activeCount} active</Badge>
          </div>
        </div>
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="bg-primary rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Review' : 'Create Review'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User name</Label>
                <Input
                  placeholder="Jean Paul K."
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role / position</Label>
                <Input
                  placeholder="S3 Student"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Share what this student said..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Avatar (optional)</Label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                    {form.avatar_url ? (
                      <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <label className="cursor-pointer inline-flex">
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                    <span className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md border border-input bg-background hover:bg-accent text-sm font-medium">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload image
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label htmlFor="review-active">Show on landing page</Label>
                <Switch
                  id="review-active"
                  checked={form.is_active}
                  onCheckedChange={(is_active) => setForm({ ...form, is_active })}
                />
              </div>
              <Button onClick={handleSave} className="w-full bg-primary">
                {editId ? 'Update Review' : 'Create Review'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <MessageSquareQuote className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No reviews yet. Add your first testimonial above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                          {review.avatar_url ? (
                            <img src={review.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="font-medium text-sm">{review.user_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{review.role}</TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.message}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.is_active ? 'default' : 'secondary'}>
                        {review.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(review.updated_date || review.created_date, 'relative')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(review)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(review.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
