import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Target, BookOpen, Brain, ArrowRight, Flame } from 'lucide-react'
import type { ExamAttempt } from '@/types'

const quickActions = [
  {
    to: '/dashboard/practice',
    icon: Target,
    label: 'Practice',
    desc: 'Topic-based questions',
    iconColor: 'text-blue-500',
    light: 'bg-blue-50',
  },
  {
    to: '/dashboard/mock-exam',
    icon: BookOpen,
    label: 'Mock Exam',
    desc: 'Full exam simulation',
    iconColor: 'text-green-500',
    light: 'bg-green-50',
  },
  {
    to: '/dashboard/ai-tutor',
    icon: Brain,
    label: 'AI Tutor',
    desc: 'Get instant help',
    iconColor: 'text-purple-500',
    light: 'bg-purple-50',
  },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()

  const { data: attempts = [] } = useQuery<ExamAttempt[]>({
    queryKey: ['exam-attempts'],
    queryFn: () => base44.entities.ExamAttempt.filter({ student_id: user?.id }, '-created_date', 50),
    enabled: !!user?.id,
  })

  const completed = attempts.filter((a) => a.completed)
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length)
    : 0
  const recent = completed.slice(0, 4)
  const firstName = user?.full_name?.split(' ')[0] ?? 'Student'

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="bg-white rounded-3xl border border-border shadow-sm p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm capitalize">{getGreeting()},</p>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground mt-0.5">
              {firstName} 👋
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {completed.length > 0
                ? `You've completed ${completed.length} sessions with ${avgScore}% average score.`
                : 'Start practicing to track your progress.'}
            </p>
          </div>
          {user?.study_streak ? (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl self-start">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-semibold">{user.study_streak} day streak</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-heading font-bold text-foreground mb-4">Start Learning</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group h-full">
                <div className={`w-11 h-11 ${action.light} rounded-xl flex items-center justify-center mb-4`}>
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-bold text-foreground">Recent Activity</h2>
          <Link
            to="/dashboard/results"
            className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground text-sm mb-4">No sessions yet. Pick a subject and start practicing!</p>
            <Link to="/dashboard/practice">
              <Button className="rounded-xl">Start Practice</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((attempt, i) => (
              <div key={attempt.id ?? i} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    attempt.type === 'practice' ? 'bg-blue-50' : 'bg-green-50'
                  }`}>
                    {attempt.type === 'practice' ? (
                      <Target className="w-4 h-4 text-blue-500" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground capitalize truncate">
                      {attempt.type === 'mock_exam' ? 'Mock Exam' : 'Practice'}
                      {attempt.topic ? ` · ${attempt.topic}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attempt.correct_count}/{attempt.total_questions} correct
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold text-sm shrink-0 ml-3 ${
                    (attempt.score ?? 0) >= 70 ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {attempt.score ?? 0}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
