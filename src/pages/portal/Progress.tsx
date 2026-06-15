import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, BookOpen, Clock, Flame } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import type { ExamAttempt, Subject } from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default function ProgressPage() {
  const { user } = useAuth()

  const { data: attempts = [], isLoading: loadingAttempts } = useQuery<ExamAttempt[]>({
    queryKey: ['exam-attempts'],
    queryFn: () => base44.entities.ExamAttempt.filter({ student_id: user?.id }, '-created_date', 50) as Promise<ExamAttempt[]>,
    enabled: !!user?.id,
  })

  const { data: subjects = [], isLoading: loadingSubjects } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list() as Promise<Subject[]>,
  })

  if (loadingAttempts || loadingSubjects) return <PageLoader />

  const completed = attempts.filter((a) => a.completed)
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length)
    : 0
  const totalTime = completed.reduce((s, a) => s + (a.time_spent_seconds ?? 0), 0)

  const scoreChart = {
    labels: completed.slice(0, 7).reverse().map((_, i) => `Session ${i + 1}`),
    datasets: [{
      label: 'Score %',
      data: completed.slice(0, 7).reverse().map((a) => a.score ?? 0),
      borderColor: 'hsl(217 91% 50%)',
      backgroundColor: 'hsla(217, 91%, 50%, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  }

  const timeChart = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Minutes studied',
      data: [45, 30, 60, 25, 50, 90, 40],
      backgroundColor: 'hsl(152 60% 45%)',
      borderRadius: 8,
    }],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Progress</h1>
        <p className="text-muted-foreground mt-1">Track your learning journey over time.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Average Score', value: `${avgScore}%`, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: BookOpen, label: 'Sessions', value: completed.length, color: 'text-green-500', bg: 'bg-green-50' },
          { icon: Clock, label: 'Time Studied', value: `${Math.round(totalTime / 60)}m`, color: 'text-purple-500', bg: 'bg-purple-50' },
          { icon: Flame, label: 'Study Streak', value: `${user?.study_streak ?? 0} days`, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="font-bold text-2xl">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Performance Trend</CardTitle></CardHeader>
          <CardContent><Line data={scoreChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Time Spent This Week</CardTitle></CardHeader>
          <CardContent><Bar data={timeChart} options={{ responsive: true, plugins: { legend: { display: false } } }} /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Subject Progress</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {subjects.map((sub) => (
            <div key={sub.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{sub.name}</span>
                <span className="text-muted-foreground">{sub.progress ?? 0}%</span>
              </div>
              <Progress value={sub.progress ?? 0} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
