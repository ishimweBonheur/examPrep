import { useQuery } from '@tanstack/react-query'
import { fetchExtendedAdminAnalytics, fetchAdminInsights } from '@/api/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, HelpCircle, TrendingUp, MessageSquare, FileText, Sparkles, Download, Loader2 } from 'lucide-react'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend)

export default function AdminAnalytics() {
  const { data: analytics, isLoading: l1 } = useQuery({
    queryKey: ['admin-analytics-extended'],
    queryFn: fetchExtendedAdminAnalytics,
  })
  const { data: insights, isLoading: l2, refetch: refetchInsights, isFetching: fetchingInsights } = useQuery({
    queryKey: ['admin-analytics-insights'],
    queryFn: fetchAdminInsights,
    staleTime: 5 * 60 * 1000,
  })

  if (l1) return <PageLoader />

  const enrollmentChart = {
    labels: analytics?.enrollment.labels ?? [],
    datasets: [{ label: 'New Students', data: analytics?.enrollment.data ?? [], backgroundColor: 'hsl(217 91% 50%)', borderRadius: 8 }],
  }

  const subjectChart = {
    labels: analytics?.subject_distribution.labels ?? [],
    datasets: [{ data: analytics?.subject_distribution.data ?? [], backgroundColor: ['hsl(217 91% 50%)', 'hsl(152 60% 45%)', 'hsl(38 95% 55%)', 'hsl(280 60% 50%)', 'hsl(0 70% 55%)'] }],
  }

  const difficultyChart = {
    labels: analytics?.difficulty_trends.labels ?? [],
    datasets: [{ label: 'Questions', data: analytics?.difficulty_trends.data ?? [], backgroundColor: 'hsl(38 95% 55%)', borderRadius: 8 }],
  }

  const engagementChart = {
    labels: analytics?.engagement.labels ?? [],
    datasets: [{ label: 'Exam attempts', data: analytics?.engagement.data ?? [], borderColor: 'hsl(152 60% 45%)', tension: 0.3 }],
  }

  const exportReport = () => {
    const lines = [
      'ExamPrep Admin Analytics Report',
      new Date().toLocaleString(),
      '',
      `Total attempts: ${analytics?.kpis.total_attempts ?? 0}`,
      `Active subscriptions: ${analytics?.kpis.active_subscriptions ?? 0}`,
      `Community posts: ${analytics?.kpis.community_posts ?? 0}`,
      `Avg recent score: ${analytics?.kpis.avg_recent_score ?? 0}%`,
      '',
      insights?.summary ?? '',
      '',
      'Recommendations:',
      ...(insights?.recommendations ?? []).map((r) => `- ${r}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-analytics-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Analytics</h1>
          <p className="text-muted-foreground mt-1">Platform performance, engagement, and AI-powered insights.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportReport}>
          <Download className="w-4 h-4" /> Export report
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: HelpCircle, label: 'Exam Attempts', value: analytics?.kpis.total_attempts ?? 0, color: 'text-green-500', bg: 'bg-green-50' },
          { icon: Users, label: 'Subscriptions', value: analytics?.kpis.active_subscriptions ?? 0, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: TrendingUp, label: 'Avg Score', value: `${analytics?.kpis.avg_recent_score ?? 0}%`, color: 'text-amber-500', bg: 'bg-amber-50' },
          { icon: MessageSquare, label: 'Community', value: analytics?.kpis.community_posts ?? 0, color: 'text-purple-500', bg: 'bg-purple-50' },
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
          <CardContent><Bar data={enrollmentChart} options={{ responsive: true, plugins: { legend: { display: false } } }} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Exam Attempts by Subject</CardTitle></CardHeader>
          <CardContent className="flex justify-center"><div className="w-64"><Doughnut data={subjectChart} options={{ plugins: { legend: { position: 'bottom' } } }} /></div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Question Difficulty Distribution</CardTitle></CardHeader>
          <CardContent><Bar data={difficultyChart} options={{ responsive: true, plugins: { legend: { display: false } } }} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Engagement Trend</CardTitle></CardHeader>
          <CardContent><Line data={engagementChart} options={{ responsive: true, plugins: { legend: { display: false } } }} /></CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> AI Insights</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetchInsights()} disabled={fetchingInsights}>
            {fetchingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh insights'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {l2 ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : (
            <>
              <p className="text-sm">{insights?.summary}</p>
              <div className="grid md:grid-cols-2 gap-3">
                {insights?.insights?.map((item, i) => (
                  <div key={i} className="rounded-xl border p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>{item.priority}</Badge>
                    </div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
              {insights?.recommendations && insights.recommendations.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Recommendations</p>
                  <ul className="text-sm space-y-1">{insights.recommendations.map((r, i) => <li key={i}>• {r}</li>)}</ul>
                </div>
              )}
              {insights?.predictions && insights.predictions.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Predictions</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">{insights.predictions.map((p, i) => <li key={i}>• {p}</li>)}</ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5" /> Completion Rate</CardTitle></CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{analytics?.completion_rate ?? 0}%</p>
          <p className="text-sm text-muted-foreground">Recent exam completion activity</p>
        </CardContent>
      </Card>
    </div>
  )
}
