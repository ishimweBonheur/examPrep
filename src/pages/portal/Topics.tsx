import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Target, BookOpen } from 'lucide-react'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import type { Subject, Topic } from '@/types'

export default function Topics() {
  const { subjectId } = useParams<{ subjectId: string }>()

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list() as Promise<Subject[]>,
  })

  const subject = subjects.find((s) => s.id === subjectId)

  if (isLoading) return <PageLoader />
  if (!subject) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Subject not found.</p>
        <Link to="/dashboard/subjects"><Button className="mt-4">Back to Subjects</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/subjects"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl">{subject.name}</h1>
          <p className="text-muted-foreground">{subject.description}</p>
        </div>
        <Badge className="ml-auto">{subject.level}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Overall Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Completion</span>
            <span className="font-bold">{subject.progress ?? 0}%</span>
          </div>
          <Progress value={subject.progress ?? 0} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {(subject.topics ?? []).map((topic: Topic, i: number) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading font-semibold">{topic.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                </div>
                <BookOpen className="w-5 h-5 text-primary shrink-0" />
              </div>
              <Link to={`/dashboard/practice?subject=${subject.id}&topic=${encodeURIComponent(topic.name)}`}>
                <Button className="w-full mt-4 gap-2"><Target className="w-4 h-4" /> Practice</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
