import { useState, type ChangeEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Upload, FileText, FileImage, File, Trash2, Eye, Plus, Loader2, type LucideIcon } from 'lucide-react'
import { formatDate } from '@/lib/format-date'
import { categoryColor, categoryLabel, DOCUMENT_CATEGORY_LABELS } from '@/lib/document-categories'
import { STUDENT_LEVELS, levelLabel } from '@/lib/student-level'
import type { Document, DocumentCategory, Subject } from '@/types'

interface DocumentForm {
  title: string
  description: string
  subject_id: string
  topic: string
  year: number
  category: DocumentCategory
  level: string
  file_type: string
  file_url?: string
  solution_url?: string
}

const ALL_FILTER = 'all'

export default function AdminDocuments() {
  const queryClient = useQueryClient()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [uploading, setUploading] = useState(false)
  const [subjectFilter, setSubjectFilter] = useState(ALL_FILTER)
  const [categoryFilter, setCategoryFilter] = useState(ALL_FILTER)
  const [levelFilter, setLevelFilter] = useState(ALL_FILTER)
  const [form, setForm] = useState<DocumentForm>({
    title: '',
    description: '',
    subject_id: '',
    topic: '',
    year: new Date().getFullYear(),
    category: 'past_paper',
    level: 'S3',
    file_type: 'pdf',
  })

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list() as Promise<Subject[]>,
  })

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['admin-documents', subjectFilter, categoryFilter, levelFilter],
    queryFn: async () => {
      const query: Record<string, string> = {}
      if (subjectFilter !== ALL_FILTER) query.subject_id = subjectFilter
      if (categoryFilter !== ALL_FILTER) query.category = categoryFilter
      if (levelFilter !== ALL_FILTER) query.level = levelFilter
      return Object.keys(query).length > 0
        ? (base44.entities.Document.filter(query, '-created_date', 200) as Promise<Document[]>)
        : (base44.entities.Document.list('-created_date', 200) as Promise<Document[]>)
    },
  })

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'file_url' | 'solution_url') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { file_url } = await base44.integrations.Core.UploadFile({ file })
    setForm((prev) => ({ ...prev, [field]: file_url }))
    setUploading(false)
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      subject_id: '',
      topic: '',
      year: new Date().getFullYear(),
      category: 'past_paper',
      level: 'S3',
      file_type: 'pdf',
    })
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.subject_id || !form.file_url) return
    const subjectName = subjects.find((s) => s.id === form.subject_id)?.name || ''
    await base44.entities.Document.create({ ...form, subject_name: subjectName })
    setUploadOpen(false)
    resetForm()
    queryClient.invalidateQueries({ queryKey: ['admin-documents'] })
  }

  const handleDelete = async (id: string) => {
    await base44.entities.Document.delete(id)
    queryClient.invalidateQueries({ queryKey: ['admin-documents'] })
  }

  const fileTypeIcons: Record<string, LucideIcon> = {
    pdf: FileText,
    image: FileImage,
    docx: FileText,
    other: File,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Past Papers & Documents</h1>
          <p className="text-muted-foreground mt-1">
            Upload past papers, solutions, study notes, revision guides, and courses of study.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-primary rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Subjects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All Subjects</SelectItem>
            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All Categories</SelectItem>
            {(Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]).map((key) => (
              <SelectItem key={key} value={key}>{DOCUMENT_CATEGORY_LABELS[key]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All Levels" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All Levels</SelectItem>
            {STUDENT_LEVELS.map((l) => (
              <SelectItem key={l} value={l}>{levelLabel(l)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(subjectFilter !== ALL_FILTER || categoryFilter !== ALL_FILTER || levelFilter !== ALL_FILTER) && (
          <Button variant="ghost" size="sm" onClick={() => { setSubjectFilter(ALL_FILTER); setCategoryFilter(ALL_FILTER); setLevelFilter(ALL_FILTER) }}>
            Clear filters
          </Button>
        )}
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title (e.g. Biology 2022 National Exam)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Subject</label>
                <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as DocumentCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]).map((key) => (
                      <SelectItem key={key} value={key}>{DOCUMENT_CATEGORY_LABELS[key]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Year</label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 2024 })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Level</label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['S1', 'S2', 'S3', 'S6'].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">File Type</label>
                <Select value={form.file_type} onValueChange={(v) => setForm({ ...form, file_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="docx">Word</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Input placeholder="Topic (e.g. Cell Biology)" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />

            <div>
              <label className="text-sm font-medium mb-1.5 block">Document File</label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                {form.file_url ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FileText className="w-5 h-5" /> File uploaded
                    <button type="button" onClick={() => setForm({ ...form, file_url: '' })} className="text-destructive text-sm ml-2">Remove</button>
                  </div>
                ) : (
                  <>
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /> : <Upload className="w-6 h-6 mx-auto text-muted-foreground" />}
                    <p className="text-sm text-muted-foreground mt-1">Click to upload PDF or image</p>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={(e) => handleFileUpload(e, 'file_url')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </>
                )}
              </div>
            </div>

            {form.category === 'past_paper' && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Solution File <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                  {form.solution_url ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <FileText className="w-5 h-5" /> Solution uploaded
                      <button type="button" onClick={() => setForm({ ...form, solution_url: '' })} className="text-destructive text-sm ml-2">Remove</button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">Upload solution file</p>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'solution_url')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </>
                  )}
                </div>
              </div>
            )}

            <Button onClick={handleSave} disabled={!form.title.trim() || !form.subject_id || !form.file_url || uploading} className="w-full bg-primary">
              Save Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[85vh]">
          <DialogHeader><DialogTitle>{previewDoc?.title}</DialogTitle></DialogHeader>
          {previewDoc?.file_url && (
            <iframe src={previewDoc.file_url} className="w-full h-full min-h-[60vh] rounded-xl border border-border" title="Document preview" />
          )}
        </DialogContent>
      </Dialog>

      <Card className="border border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const TypeIcon = fileTypeIcons[doc.file_type] || File
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm max-w-[200px] truncate block">{doc.title}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{doc.subject_name}</Badge></TableCell>
                      <TableCell>
                        <Badge className={`text-xs border-0 ${categoryColor(doc.category)}`}>{categoryLabel(doc.category)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{doc.year}</TableCell>
                      <TableCell className="text-sm">{doc.level}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.views_count || 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.downloads_count || 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(doc.created_date, 'short')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setPreviewDoc(doc); setPreviewOpen(true) }}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(doc.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No documents uploaded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
