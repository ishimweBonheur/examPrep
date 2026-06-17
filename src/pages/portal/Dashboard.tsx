import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { fetchStudentProgress } from '@/api/stats'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import ClassificationBanner from '@/components/portal/ClassificationBanner'
import { useStudentLevel } from '@/hooks/use-student-level'
import { levelLabel, matchesStudentLevel } from '@/lib/student-level'
import { Target, BookOpen, Brain, ArrowRight, Flame, Trophy, Clock, Calendar, Zap, Library, FileText, StickyNote } from 'lucide-react'
import type { ExamAttempt, Subject } from '@/types'

const quickActions = [
  {
    to: '/dashboard/practice',
    icon: Target,
    label: 'Practice',
    desc: 'Topic-based questions',
    iconColor: 'text-blue-500',
    light: 'bg-blue-50',
    borderColor: 'hover:border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    to: '/dashboard/mock-exam',
    icon: BookOpen,
    label: 'Mock Exam',
    desc: 'Full exam simulation',
    iconColor: 'text-green-500',
    light: 'bg-green-50',
    borderColor: 'hover:border-green-200',
    gradient: 'from-green-500 to-green-600',
  },
  {
    to: '/dashboard/ai-tutor',
    icon: Brain,
    label: 'AI Tutor',
    desc: 'Get instant help',
    iconColor: 'text-purple-500',
    light: 'bg-purple-50',
    borderColor: 'hover:border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
  },
]

const resourceLinks = [
  {
    to: '/dashboard/resources?category=past_paper',
    icon: FileText,
    label: 'Past Papers',
    desc: 'National exam papers',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    to: '/dashboard/resources?category=study_notes',
    icon: StickyNote,
    label: 'Study Notes',
    desc: 'Topic summaries',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    to: '/dashboard/resources?category=solutions',
    icon: BookOpen,
    label: 'Solutions',
    desc: 'Marking schemes',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    to: '/dashboard/resources',
    icon: Library,
    label: 'All Resources',
    desc: 'Notes, guides & more',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
]

const subjectColors = ['bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500']

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getMotivationalMessage(avgScore: number, streak: number): string {
  if (streak >= 7) return "You're on fire! 🔥 Keep the streak going!"
  if (avgScore >= 80) return "Excellent work! You're mastering the material!"
  if (avgScore >= 60) return "You're making great progress. Keep pushing!"
  return "Every session makes you better. Start practicing!"
}

export default function Dashboard() {
  const { user } = useAuth()
  const studentLevel = useStudentLevel()
  const [activeTab, setActiveTab] = useState('overview')
  const [hoveredAction, setHoveredAction] = useState<number | null>(null)

  const { data: levelSubjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects', studentLevel],
    queryFn: async () => {
      const all = await base44.entities.Subject.list() as Subject[]
      return all.filter((s) => matchesStudentLevel(s.level, studentLevel))
    },
  })

  const { data: progressData } = useQuery({
    queryKey: ['student-progress', user?.id],
    queryFn: () => fetchStudentProgress(),
    enabled: !!user?.id,
  })

  const progressMap = new Map(
    (progressData?.subject_progress ?? []).map((s) => [s.name, s])
  )

  const subjects = levelSubjects.length > 0
    ? levelSubjects.map((s, i) => {
        const prog = progressMap.get(s.name)
        return {
          name: s.name,
          progress: prog?.progress ?? 0,
          color: subjectColors[i % subjectColors.length] ?? 'bg-primary',
          questions: prog?.question_count ?? 0,
        }
      })
    : (progressData?.subject_progress ?? []).map((s, i) => ({
        name: s.name,
        progress: s.progress,
        color: subjectColors[i % subjectColors.length] ?? 'bg-primary',
        questions: s.question_count,
      }))

  const { data: attempts = [], isLoading } = useQuery<ExamAttempt[]>({
    queryKey: ['exam-attempts'],
    queryFn: () => base44.entities.ExamAttempt.filter({ student_id: user?.id }, '-created_date', 50),
    enabled: !!user?.id,
  })

  const completed = attempts.filter((a) => a.completed)
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length)
    : 0
  const recent = completed.slice(0, 5)
  const firstName = user?.full_name?.split(' ')[0] ?? 'Student'
  const todayAttempts = completed.filter(a => {
    const today = new Date()
    const attemptDate = new Date(a.created_date)
    return attemptDate.toDateString() === today.toDateString()
  })

  return (
    <div className="space-y-6">
      <ClassificationBanner level={studentLevel} />

      {/* Welcome card with gradient */}
      <div className="relative bg-gradient-to-br from-primary via-primary/95 rounded-lg shadow-lg shadow-primary/10 overflow-hidden animate-fadeInUp">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative p-6 md:p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-white/80 text-sm font-medium">{getGreeting()},</p>
                <h1 className="font-heading font-extrabold text-2xl md:text-3xl lg:text-4xl mt-1">
                  {firstName} 👋
                </h1>
              </div>
              <p className="text-white/90 text-sm md:text-base max-w-md">
                {getMotivationalMessage(avgScore, user?.study_streak || 0)}
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 mt-4">
                {user?.study_streak ? (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span className="text-sm font-bold">{user.study_streak} Day Streak</span>
                  </div>
                ) : null}
                {completed.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                    <Trophy className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm font-bold">{avgScore}% Avg Score</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                  <Target className="w-4 h-4 text-green-300" />
                  <span className="text-sm font-bold">{todayAttempts.length} Today</span>
                </div>
              </div>
            </div>

            {/* Streak Card */}
            {user?.study_streak ? (
              <div className="bg-white/15 backdrop-blur-sm rounded-sm p-4 lg:p-6 text-center border border-white/20">
                <div className="text-3xl lg:text-4xl font-black mb-1">{user.study_streak}</div>
                <div className="text-xs lg:text-sm font-medium text-white/80">Day Streak</div>
                <div className="mt-2 text-[10px] lg:text-xs text-white/60">
                  {user.study_streak >= 7 ? 'Amazing!' : 'Keep going!'}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Quick actions with hover effects */}
      <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-foreground">Start Learning</h2>
          <Link to="/dashboard/subjects" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            All Subjects <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.to} to={action.to}>
              <div 
                className={`bg-card rounded-sm border-2 p-5 shadow-sm transition-all duration-300 group cursor-pointer
                  ${action.borderColor}
                  ${hoveredAction === index ? 'shadow-lg scale-105 -translate-y-1' : 'border-border hover:shadow-md'}
                `}
                onMouseEnter={() => setHoveredAction(index)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div className={`w-12 h-12 ${action.light} rounded-sm flex items-center justify-center mb-4 transition-transform duration-300
                  ${hoveredAction === index ? 'scale-110 rotate-3' : 'group-hover:scale-110'}`}>
                  <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                </div>
                <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                
                {/* Progress indicator */}
                <div className={`mt-3 transition-all duration-300 ${hoveredAction === index ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  <div className="flex items-center gap-2 text-xs text-primary font-medium">
                    <Zap className="w-3 h-3" />
                    <span>Start now</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Study resources quick access */}
      <div className="animate-fadeInUp" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-foreground">Study Materials</h2>
          <Link to="/dashboard/resources" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            Browse all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {resourceLinks.map((item) => (
            <Link key={item.to} to={item.to}>
              <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-md transition-all group h-full">
                <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Subject Progress */}
      <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
        <h2 className="font-heading font-bold text-lg text-foreground mb-4">Your {levelLabel(studentLevel)} Subjects</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {subjects.map((subject,) => (
            <div 
              key={subject.name} 
              className="bg-card rounded-sm border border-border p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground text-sm">{subject.name}</h3>
                <span className="text-xs text-muted-foreground">{subject.questions} Q's</span>
              </div>
              <div className="w-full bg-muted rounded-sm h-2 overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-sm transition-all duration-1000 ${subject.color}`}
                  style={{ width: `${subject.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-bold text-foreground">{subject.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity with tabs */}
      <div className="bg-card rounded-sm border border-border shadow-sm overflow-hidden animate-fadeInUp" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="font-heading font-bold text-foreground">Recent Activity</h2>
            <div className="flex gap-1 bg-muted rounded-sm p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('practice')}
                className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${
                  activeTab === 'practice' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => setActiveTab('exam')}
                className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${
                  activeTab === 'exam' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Exams
              </button>
            </div>
          </div>
          {completed.length > 0 && (
            <Link
              to="/dashboard/results"
              className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded-sm w-3/4" />
                    <div className="h-3 bg-muted rounded-sm w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-sm flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm mb-2">No sessions yet</p>
            <p className="text-xs text-muted-foreground mb-4">Pick a subject and start practicing!</p>
            <Link to="/dashboard/practice">
              <Button className="rounded-sm shadow-md shadow-primary/20 hover:shadow-lg transition-all">
                Start Your First Practice
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent
              .filter(attempt => {
                if (activeTab === 'practice') return attempt.type === 'practice'
                if (activeTab === 'exam') return attempt.type === 'mock_exam'
                return true
              })
              .map((attempt, i) => (
                <div 
                  key={attempt.id ?? i} 
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
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
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{attempt.correct_count}/{attempt.total_questions} correct</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {attempt.time_spent_seconds ? `${Math.floor(attempt.time_spent_seconds / 60)}m` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span
                      className={`font-bold text-sm ${
                        (attempt.score ?? 0) >= 80 ? 'text-green-600' 
                        : (attempt.score ?? 0) >= 60 ? 'text-amber-600' 
                        : 'text-red-600'
                      }`}
                    >
                      {attempt.score ?? 0}%
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}