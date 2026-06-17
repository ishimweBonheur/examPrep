import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { fetchAdminAnalytics } from '@/api/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, HelpCircle, TrendingUp, MessageSquare, FileText } from 'lucide-react'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function AdminAnalytics() {
  const { data: users = [], isLoading: l1 } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() })
  const { data: attempts = [], isLoading: l2 } = useQuery({ queryKey: ['attempts'], queryFn: () => base44.entities.ExamAttempt.list('-created_date', 200) })
  const { data: posts = [], isLoading: l3 } = useQuery({ queryKey: ['posts'], queryFn: () => base44.entities.CommunityPost.list('-created_date', 100) })
  const { data: documents = [], isLoading: l4 } = useQuery({ queryKey: ['docs'], queryFn: () => base44.entities.Document.list() })
  const { data: analytics, isLoading: l5 } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: fetchAdminAnalytics,
  })

  if (l1 || l2 || l3 || l4 || l5) return <PageLoader />

  const students = users.filter((u: { role: string }) => u.role === 'student')
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s: number, a: { score?: number }) => s + (a.score ?? 0), 0) / attempts.length)
    : 0

  const enrollmentChart = {
    labels: analytics?.enrollment.labels ?? [],
    datasets: [{
      label: 'New Students',
      data: analytics?.enrollment.data ?? [],
      backgroundColor: 'hsl(217 91% 50%)',
      borderRadius: 8,
    }],
  }

  const subjectChart = {
    labels: analytics?.subject_distribution.labels ?? [],
    datasets: [{
      data: analytics?.subject_distribution.data ?? [],
      backgroundColor: ['hsl(217 91% 50%)', 'hsl(152 60% 45%)', 'hsl(38 95% 55%)', 'hsl(280 60% 50%)', 'hsl(0 70% 55%)'],
    }],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform performance and engagement metrics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Students', value: students.length, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: HelpCircle, label: 'Exam Attempts', value: attempts.length, color: 'text-green-500', bg: 'bg-green-50' },
          { icon: TrendingUp, label: 'Avg Score', value: `${avgScore}%`, color: 'text-amber-500', bg: 'bg-amber-50' },
          { icon: FileText, label: 'Documents', value: documents.length, color: 'text-purple-500', bg: 'bg-purple-50' },
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
          <CardHeader><CardTitle className="text-lg">Student Enrollment (6 months)</CardTitle></CardHeader>
          <CardContent>
            <Bar data={enrollmentChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Exam Attempts by Subject</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-64">
              <Doughnut data={subjectChart} options={{ plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Community Activity</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{posts.length} total posts · Top post: {(posts[0] as { title?: string })?.title ?? 'N/A'}</p>
        </CardContent>
      </Card>
    </div>
  )
}
