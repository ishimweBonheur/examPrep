import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Download, Eye, Search, BookOpen, Lock, FileImage, Loader2, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/format-date'
import { categoryColor, categoryLabel, PAST_PAPER_CATEGORIES } from '@/lib/document-categories'
import type { Document, DocumentCategory, Subject, Subscription } from '@/types'

const ALL_FILTER = 'all'

export default function PastPapers() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [solutionDoc, setSolutionDoc] = useState<Document | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [solutionOpen, setSolutionOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState(ALL_FILTER)
  const [categoryFilter, setCategoryFilter] = useState(ALL_FILTER)
  const [yearFilter, setYearFilter] = useState(ALL_FILTER)
  const [downloading, setDownloading] = useState<Record<string, boolean>>({})

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list() as Promise<Subject[]>,
  })

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['public-documents', subjectFilter, categoryFilter],
    queryFn: async () => {
      const query: Record<string, string> = {}
      if (subjectFilter !== ALL_FILTER) query.subject_id = subjectFilter
      if (categoryFilter !== ALL_FILTER) query.category = categoryFilter
      const all = Object.keys(query).length > 0
        ? await base44.entities.Document.filter(query, '-created_date', 200) as Document[]
        : await base44.entities.Document.list('-created_date', 200) as Document[]
      return all.filter((d) => PAST_PAPER_CATEGORIES.includes(d.category))
    },
  })

  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ['my-subscription', user?.id],
    queryFn: () => base44.entities.Subscription.filter({ student_id: user?.id }, '-created_date', 5) as Promise<Subscription[]>,
    enabled: !!user?.id,
  })

  const currentSub = subscriptions[0]
  const isPaid = currentSub?.status === 'active' && currentSub?.payment_status === 'paid' && currentSub.amount_paid > 0
  const isTrial = currentSub?.status === 'trial'

  const uniqueYears = [...new Set(documents.map((d) => d.year).filter(Boolean))].sort((a, b) => b - a)

  let filteredDocs = documents
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredDocs = filteredDocs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.topic?.toLowerCase().includes(q) ||
        d.subject_name?.toLowerCase().includes(q)
    )
  }
  if (yearFilter !== ALL_FILTER) {
    filteredDocs = filteredDocs.filter((d) => d.year === parseInt(yearFilter))
  }

  const openPreview = async (doc: Document) => {
    setPreviewDoc(doc)
    setPreviewOpen(true)
    await base44.entities.Document.update(doc.id, { views_count: (doc.views_count || 0) + 1 })
    queryClient.invalidateQueries({ queryKey: ['public-documents'] })
  }

  const openSolution = (doc: Document) => {
    if (!doc.solution_url) return
    setSolutionDoc(doc)
    setSolutionOpen(true)
  }

  const handleDownload = async (doc: Document, url?: string) => {
    const target = url || doc.file_url
    if (!target) return
    if (!isPaid) {
      toast.error('Download requires a paid subscription. Upgrade your plan to download documents.')
      return
    }
    setDownloading((prev) => ({ ...prev, [doc.id]: true }))
    window.open(target, '_blank')
    await base44.entities.Document.update(doc.id, { downloads_count: (doc.downloads_count || 0) + 1 })
    queryClient.invalidateQueries({ queryKey: ['public-documents'] })
    setDownloading((prev) => ({ ...prev, [doc.id]: false }))
    toast.success('Download started!')
  }

  const grouped: Partial<Record<DocumentCategory, Document[]>> = {}
  filteredDocs.forEach((doc) => {
    const cat = doc.category
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat]!.push(doc)
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" /> Past Papers & Resources
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse national exam papers, solutions, and study materials. View in-app by default; download with a paid plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPaid ? (
            <Badge className="bg-green-100 text-green-700 border-0 gap-1 px-3 py-1.5">
              <Download className="w-3 h-3" /> Downloads enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 px-3 py-1.5 text-muted-foreground">
              <Lock className="w-3 h-3" /> {isTrial ? 'Trial — upgrade to download' : 'View only'}
            </Badge>
          )}
        </div>
      </div>

      {!isPaid && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Free accounts can preview all documents in the browser. Upgrade to download PDFs and solutions offline.
            </p>
            <Link to="/dashboard/billing" className="inline-flex items-center justify-center shrink-0 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium">
              Upgrade plan
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-xl" />
        </div>
        <Select value={subjectFilter} onValueChange={(v) => { setSubjectFilter(v); setCategoryFilter(ALL_FILTER) }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Subjects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All Subjects</SelectItem>
            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All Categories</SelectItem>
            {PAST_PAPER_CATEGORIES.map((key) => (
              <SelectItem key={key} value={key}>{categoryLabel(key)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="All Years" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All Years</SelectItem>
            {uniqueYears.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-lg">{previewDoc?.title}</DialogTitle>
            {previewDoc && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline">{previewDoc.subject_name}</Badge>
                <Badge className={categoryColor(previewDoc.category)}>{categoryLabel(previewDoc.category)}</Badge>
                <Badge variant="outline">{previewDoc.year}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" /> {previewDoc.views_count || 0} views</span>
              </div>
            )}
          </DialogHeader>
          <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border">
            {previewDoc?.file_url && (
              <iframe src={previewDoc.file_url} className="w-full h-full" title={previewDoc.title} />
            )}
          </div>
          <div className="flex gap-3 pt-3 shrink-0 flex-wrap">
            {previewDoc?.solution_url && (
              <Button variant="outline" className="rounded-xl gap-2" onClick={() => openSolution(previewDoc)}>
                <FileText className="w-4 h-4" /> View Solution
              </Button>
            )}
            {isPaid ? (
              <Button className="bg-primary rounded-xl gap-2" onClick={() => previewDoc && handleDownload(previewDoc)} disabled={!!previewDoc && downloading[previewDoc.id]}>
                {previewDoc && downloading[previewDoc.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download
              </Button>
            ) : (
              <Link to="/dashboard/billing" className="inline-flex items-center justify-center rounded-xl gap-2 h-10 px-4 border border-input bg-background hover:bg-accent text-sm font-medium">
                <Lock className="w-4 h-4" /> Upgrade to Download
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={solutionOpen} onOpenChange={setSolutionOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Solution — {solutionDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border">
            {solutionDoc?.solution_url && (
              <iframe src={solutionDoc.solution_url} className="w-full h-full" title="Solution preview" />
            )}
          </div>
          {isPaid && solutionDoc?.solution_url && (
            <Button className="bg-primary rounded-xl gap-2 self-start" onClick={() => handleDownload(solutionDoc, solutionDoc.solution_url)}>
              <Download className="w-4 h-4" /> Download Solution
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Card key={i} className="animate-pulse"><CardContent className="p-6 h-28" /></Card>)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="p-12 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No documents found. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {(Object.entries(grouped) as [DocumentCategory, Document[]][]).map(([cat, docs]) => (
            <div key={cat}>
              <h2 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Badge className={`${categoryColor(cat)} text-sm px-3 py-1`}>{categoryLabel(cat)}</Badge>
                <span className="text-sm text-muted-foreground font-normal">{docs.length} document{docs.length > 1 ? 's' : ''}</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {docs.map((doc) => (
                  <Card key={doc.id} className="border border-border hover:shadow-md transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          {doc.file_type === 'image' ? <FileImage className="w-6 h-6 text-primary" /> : <FileText className="w-6 h-6 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-foreground line-clamp-2">{doc.title}</h3>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <Badge variant="outline" className="text-xs">{doc.subject_name}</Badge>
                            <span className="text-xs text-muted-foreground">{doc.year}</span>
                            {doc.topic && <span className="text-xs text-muted-foreground">· {doc.topic}</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {doc.views_count || 0}</span>
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {doc.downloads_count || 0}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(doc.created_date, 'relative')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openPreview(doc)} title="View"><Eye className="w-4 h-4" /></Button>
                          {isPaid ? (
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDownload(doc)} disabled={downloading[doc.id]} title="Download">
                              {downloading[doc.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            </Button>
                          ) : (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" disabled title="Upgrade to download">
                              <Lock className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {doc.solution_url && (
                        <Button variant="link" className="text-xs h-auto p-0 mt-2 text-primary" onClick={() => openSolution(doc)}>
                          View solution in-app
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
