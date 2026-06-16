import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BookOpen, Eye, Search, FileText } from 'lucide-react'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import ClassificationBanner from '@/components/portal/ClassificationBanner'
import { useStudentLevel } from '@/hooks/use-student-level'
import { matchesStudentLevel } from '@/lib/student-level'
import type { Document, Subject } from '@/types'

export default function Courses() {
  const studentLevel = useStudentLevel()
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [preview, setPreview] = useState<Document | null>(null)

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects', studentLevel],
    queryFn: async () => {
      const all = await base44.entities.Subject.list() as Subject[]
      return all.filter((s) => matchesStudentLevel(s.level, studentLevel))
    },
  })

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['courses', subjectFilter, studentLevel],
    queryFn: async () => {
      const all = await base44.entities.Document.filter(
        {
          category: 'syllabus',
          level: studentLevel,
          ...(subjectFilter !== 'all' ? { subject_id: subjectFilter } : {}),
        },
        '-created_date',
        100
      ) as Document[]
      return all
    },
  })

  const filtered = documents.filter((d) =>
    !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.subject_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <ClassificationBanner level={studentLevel} />

      <div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Courses of Study</h1>
        <p className="text-muted-foreground mt-1">Official syllabi and curriculum outlines for your class level.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All subjects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses found" description="Syllabus documents will appear here once uploaded by admins." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{doc.title}</CardTitle>
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge>{doc.subject_name}</Badge>
                  <Badge variant="outline">{doc.level}</Badge>
                  <Badge variant="secondary">{doc.year}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{doc.description}</p>
                <Button className="w-full gap-2" onClick={() => setPreview(doc)}>
                  <Eye className="w-4 h-4" /> View syllabus
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{preview?.title}</DialogTitle></DialogHeader>
          {preview?.file_url && (
            <iframe src={preview.file_url} title={preview.title} className="w-full h-[70vh] rounded-lg border border-border" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
