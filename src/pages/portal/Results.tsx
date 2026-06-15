import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, BookOpen, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/format-date'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import type { ExamAttempt } from '@/types'

export default function Results() {
  const { user } = useAuth()

  const { data: attempts = [], isLoading } = useQuery<ExamAttempt[]>({
    queryKey: ['exam-attempts'],
    queryFn: () => base44.entities.ExamAttempt.filter({ student_id: user?.id, completed: true }, '-created_date', 50) as Promise<ExamAttempt[]>,
    enabled: !!user?.id,
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Results</h1>
        <p className="text-muted-foreground mt-1">Review your practice and mock exam results.</p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState icon={Trophy} title="No results yet" description="Complete a practice session or mock exam to see your results here." />
      ) : (
        <div className="space-y-4">
          {attempts.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold capitalize flex items-center gap-2">
                  {a.type === 'mock_exam' ? <BookOpen className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                  {a.type === 'mock_exam' ? 'Mock Exam' : 'Practice'}
                  {a.topic && <span className="text-muted-foreground font-normal">· {a.topic}</span>}
                </CardTitle>
                <Badge variant={a.score && a.score >= 70 ? 'default' : 'secondary'}>{a.score ?? 0}%</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  <span>{a.correct_count}/{a.total_questions} correct</span>
                  {a.time_spent_seconds && (
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.round(a.time_spent_seconds / 60)} min</span>
                  )}
                  <span>{formatDate(a.created_date, 'long')}</span>
                </div>
                <Progress value={a.score ?? 0} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
