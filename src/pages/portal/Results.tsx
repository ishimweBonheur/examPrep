import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { fetchStudentResults } from '@/api/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Target, TrendingUp, TrendingDown, Download, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/format-date'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import type { ExamAttempt } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

export default function Results() {
  const { user } = useAuth()

  const { data: results, isLoading: loadingResults, isError } = useQuery({
    queryKey: ['student-results', user?.id],
    queryFn: () => fetchStudentResults(true),
    enabled: !!user?.id,
  })

  const { data: attempts = [], isLoading: loadingAttempts } = useQuery<ExamAttempt[]>({
    queryKey: ['exam-attempts-results'],
    queryFn: () => base44.entities.ExamAttempt.filter({ student_id: user?.id, completed: true }, '-created_date', 50) as Promise<ExamAttempt[]>,
    enabled: !!user?.id,
  })

  if (loadingResults || loadingAttempts) return <PageLoader />

  const downloadReport = () => {
    if (!results) return
    const lines = [
      'UMUZI Performance Report',
      `Student: ${user?.full_name ?? 'Student'}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      `Total attempts: ${results.summary.total_attempts}`,
      `Average score: ${results.summary.average_score}%`,
      `Pass rate: ${results.summary.pass_rate}%`,
      '',
      'Subject Performance:',
      ...results.subject_performance.map((s) => `- ${s.name}: ${s.average}% (${s.attempts} attempts, class avg ${s.class_average}%)`),
      '',
      'Strengths:',
      ...results.strengths.map((s) => `- ${s.topic}: ${s.rate}%`),
      '',
      'Areas to improve:',
      ...results.weaknesses.map((s) => `- ${s.topic}: ${s.rate}%`),
      '',
      'AI Insights:',
      ...(results.ai_insights ?? []).map((i) => `- ${i}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `examprep-results-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!results || results.summary.total_attempts === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Results</h1>
          <p className="text-muted-foreground mt-1">Review your practice and mock exam results.</p>
        </div>
        <EmptyState icon={Trophy} title="No results yet" description="Complete a practice session or mock exam to see your analytics here." />
      </div>
    )
  }

  const subjectChart = {
    labels: results.subject_performance.map((s) => s.name),
    datasets: [
      { label: 'Your score', data: results.subject_performance.map((s) => s.average), backgroundColor: 'hsl(217 91% 50%)', borderRadius: 6 },
      { label: 'Class average', data: results.subject_performance.map((s) => s.class_average), backgroundColor: 'hsl(152 60% 45%)', borderRadius: 6 },
    ],
  }

  const progressChart = {
    labels: results.progress_over_time.map((p) => p.date),
    datasets: [{
      label: 'Score %',
      data: results.progress_over_time.map((p) => p.score),
      borderColor: 'hsl(217 91% 50%)',
      backgroundColor: 'hsla(217, 91%, 50%, 0.1)',
      fill: true,
      tension: 0.3,
    }],
  }

  const passFailChart = {
    labels: ['Pass (≥50%)', 'Fail (<50%)'],
    datasets: [{ data: [results.pass_fail.pass, results.pass_fail.fail], backgroundColor: ['hsl(152 60% 45%)', 'hsl(0 70% 55%)'] }],
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Results</h1>
          <p className="text-muted-foreground mt-1">Charts, analytics, and AI insights from your exam attempts.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={downloadReport}>
          <Download className="w-4 h-4" /> Download report
        </Button>
      </div>

      {isError && <p className="text-destructive text-sm">Some analytics could not be loaded.</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Average score', value: `${results.summary.average_score}%`, icon: Target },
          { label: 'Total attempts', value: results.summary.total_attempts, icon: Trophy },
          { label: 'Pass rate', value: `${results.summary.pass_rate}%`, icon: TrendingUp },
          { label: 'Failed attempts', value: results.summary.fail_count, icon: TrendingDown },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Subject performance</CardTitle></CardHeader>
          <CardContent>
            {results.subject_performance.length > 0 ? (
              <Bar data={subjectChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { max: 100, beginAtZero: true } } }} />
            ) : (
              <p className="text-sm text-muted-foreground">Complete subject-tagged exams to see this chart.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Progress over time</CardTitle></CardHeader>
          <CardContent>
            <Line data={progressChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { max: 100, beginAtZero: true } } }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Pass / fail breakdown</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-48"><Doughnut data={passFailChart} options={{ plugins: { legend: { position: 'bottom' } } }} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Difficulty accuracy</CardTitle></CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: results.difficulty_breakdown.map((d) => d.level),
                datasets: [{ label: 'Accuracy %', data: results.difficulty_breakdown.map((d) => d.accuracy), backgroundColor: 'hsl(38 95% 55%)', borderRadius: 6 }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { max: 100, beginAtZero: true } } }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg text-green-700">Strengths</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {results.strengths.length === 0 ? <p className="text-sm text-muted-foreground">Not enough data yet.</p> : (
              results.strengths.map((s) => (
                <div key={s.topic} className="flex justify-between text-sm">
                  <span>{s.topic}</span>
                  <Badge>{s.rate}%</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg text-amber-700">Areas to improve</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {results.weaknesses.length === 0 ? <p className="text-sm text-muted-foreground">Not enough data yet.</p> : (
              results.weaknesses.map((s) => (
                <div key={s.topic} className="flex justify-between text-sm">
                  <span>{s.topic}</span>
                  <Badge variant="secondary">{s.rate}%</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {results.ai_insights && results.ai_insights.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> AI performance insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.ai_insights.map((insight, i) => (
                <li key={i} className="text-sm flex gap-2"><span className="text-primary">•</span>{insight}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent attempts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {attempts.slice(0, 10).map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
              <div>
                <span className="font-medium capitalize">{a.type === 'mock_exam' ? 'Mock Exam' : 'Practice'}</span>
                {a.topic && <span className="text-muted-foreground"> · {a.topic}</span>}
                <p className="text-xs text-muted-foreground">{formatDate(a.created_date, 'long')}</p>
              </div>
              <Badge variant={(a.score ?? 0) >= 50 ? 'default' : 'secondary'}>{a.score ?? 0}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
