import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search, Plus, Users, BookOpen, HelpCircle, MessageCircle,
  Microscope, FlaskConical, Lightbulb, Bell, Settings, ChevronRight,
  Phone,
} from 'lucide-react'
import type { User, Subject, Question, ExamAttempt, Message } from '@/types'

const subjectIcons: Record<string, typeof BookOpen> = {
  Biology: Microscope,
  Chemistry: FlaskConical,
  Entrepreneurship: Lightbulb,
}

const statusStyles: Record<string, { label: string; dot: string }> = {
  practice: { label: 'Practice', dot: 'bg-blue-500' },
  mock_exam: { label: 'Mock Exam', dot: 'bg-amber-500' },
  completed: { label: 'Completed', dot: 'bg-green-500' },
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function getWeekDays() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay() + 1)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const weekDays = getWeekDays()
  const today = new Date().getDate()

  const { data: students = [] } = useQuery<User[]>({
    queryKey: ['admin-students'],
    queryFn: () => base44.entities.User.list(),
  })

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list(),
  })

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ['admin-questions'],
    queryFn: () => base44.entities.Question.list(),
  })

  const { data: attempts = [] } = useQuery<ExamAttempt[]>({
    queryKey: ['admin-attempts'],
    queryFn: () => base44.entities.ExamAttempt.list('-created_date', 100),
  })

  const { data: unreadMsgs = [] } = useQuery<Message[]>({
    queryKey: ['admin-unread-msgs'],
    queryFn: () => base44.entities.Message.filter({ is_read: false }),
  })

  const studentList = students.filter((s) => s.role === 'student')
  const completedAttempts = attempts.filter((a) => a.completed)
  const recentAttempts = completedAttempts.slice(0, 8)
  const newStudents = studentList.slice(0, 4)

  const questionsBySubject = useMemo(() => {
    const map: Record<string, number> = {}
    questions.forEach((q) => {
      map[q.subject_id] = (map[q.subject_id] || 0) + 1
    })
    return map
  }, [questions])

  const filteredAttempts = recentAttempts.filter((a) => {
    if (!search) return true
    const student = students.find((s) => s.id === a.student_id)
    const term = search.toLowerCase()
    return (
      student?.full_name.toLowerCase().includes(term) ||
      a.topic?.toLowerCase().includes(term) ||
      a.type.toLowerCase().includes(term)
    )
  })

  const firstName = user?.full_name?.split(' ')[0] ?? 'Admin'

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        {/* Search & actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students, topics..."
              className="pl-11 h-12 rounded-2xl bg-white border-border shadow-sm"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/admin/students">
              <Button className="h-12 rounded-2xl px-5 gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </Link>
          </div>
        </div>

        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-3xl bg-primary p-6 md:p-8 text-white shadow-lg shadow-primary/20">
          <div className="relative z-10 max-w-lg">
            <p className="text-white/80 text-sm font-medium">{getGreeting()}</p>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl mt-1">
              {firstName} 👋
            </h1>
            <p className="text-white/85 mt-3 text-sm md:text-base leading-relaxed">
              You have <strong>{unreadMsgs.length} unread messages</strong> and{' '}
              <strong>{studentList.length} active students</strong>. Review platform activity below.
            </p>
            <Link to="/admin/messages">
              <Button
                variant="secondary"
                className="mt-5 rounded-xl bg-white text-primary hover:bg-white/90 font-semibold"
              >
                Review Messages
              </Button>
            </Link>
          </div>
          <div className="absolute right-4 bottom-0 hidden md:block opacity-90">
            <div className="w-48 h-48 rounded-full bg-white/10 flex items-center justify-center">
              <Users className="w-24 h-24 text-white/40" />
            </div>
          </div>
        </div>

        {/* Subject overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-foreground">Subjects Overview</h2>
            <Link to="/admin/subjects" className="text-sm text-primary font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {subjects.map((subject) => {
              const Icon = subjectIcons[subject.name] ?? BookOpen
              const count = questionsBySubject[subject.id] ?? 0
              return (
                <div
                  key={subject.id}
                  className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">{count} Questions</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity table */}
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <h2 className="font-heading font-bold text-lg text-foreground">Student Activity</h2>
            <Link to="/admin/analytics" className="text-sm text-primary font-medium hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="px-6 py-3 font-medium">Student</th>
                  <th className="px-6 py-3 font-medium">Activity</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No activity yet.
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((attempt, i) => {
                    const student = students.find((s) => s.id === attempt.student_id)
                    const status = statusStyles[attempt.type] ?? statusStyles.practice
                    return (
                      <tr
                        key={attempt.id ?? i}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                              {student?.full_name?.charAt(0) ?? '?'}
                            </div>
                            <span className="font-medium text-foreground">
                              {student?.full_name ?? 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground capitalize">
                          {attempt.type === 'mock_exam' ? 'Mock Exam' : 'Practice'}
                          {attempt.topic ? ` · ${attempt.topic}` : ''}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                            <span className="text-foreground">{status.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={
                              (attempt.score ?? 0) >= 70
                                ? 'text-green-600 font-semibold'
                                : 'text-amber-600 font-semibold'
                            }
                          >
                            {attempt.score ?? 0}%
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-full xl:w-80 shrink-0 space-y-5">
        {/* Profile card */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.full_name?.charAt(0) ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground truncate">{user?.full_name}</p>
              <p className="text-xs text-primary">Administrator</p>
            </div>
            <div className="flex gap-1">
              <Link
                to="/admin/billing"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <Link
                to="/admin/messages"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {unreadMsgs.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mini calendar */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-foreground">Schedule</h3>
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => {
              const isToday = day.getDate() === today
              return (
                <div key={day.toISOString()} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {day.toLocaleString('default', { weekday: 'narrow' })}
                  </span>
                  <span
                    className={
                      isToday
                        ? 'w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold'
                        : 'w-8 h-8 rounded-full flex items-center justify-center text-sm text-muted-foreground'
                    }
                  >
                    {day.getDate()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* New students */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-foreground">New Students</h3>
            <Link to="/admin/students" className="text-xs text-primary font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {newStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No students yet.</p>
            ) : (
              newStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {student.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground shrink-0"
                    aria-label={`Contact ${student.full_name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-5 space-y-3">
          <h3 className="font-heading font-bold text-foreground mb-1">Platform Stats</h3>
          {[
            { icon: Users, label: 'Students', value: studentList.length },
            { icon: HelpCircle, label: 'Questions', value: questions.length },
            { icon: MessageCircle, label: 'Unread', value: unreadMsgs.length },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <stat.icon className="w-4 h-4" />
                <span className="text-sm">{stat.label}</span>
              </div>
              <span className="font-semibold text-foreground">{stat.value}</span>
            </div>
          ))}
          <Link
            to="/admin/analytics"
            className="flex items-center justify-center gap-1 text-sm text-primary font-medium pt-2 hover:underline"
          >
            Full Analytics <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </aside>
    </div>
  )
}
