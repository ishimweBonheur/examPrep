import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Trophy, Flame, Target, BookOpen, Camera, GraduationCap, LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { fetchUserAchievements } from '@/api/http'
import { useStudentLevel } from '@/hooks/use-student-level'
import { levelLabel } from '@/lib/student-level'
import type { ExamAttempt, Achievement } from '@/types'

const iconMap: Record<string, LucideIcon> = {
  Target,
  Flame,
  Trophy,
  BookOpen,
}

export default function Profile() {
  const { user } = useAuth()
  const studentLevel = useStudentLevel()

  const { data: attempts = [] } = useQuery<ExamAttempt[]>({
    queryKey: ['exam-attempts', user?.id],
    queryFn: () => base44.entities.ExamAttempt.filter({ student_id: user?.id, completed: true }, '-created_date', 100),
    enabled: !!user?.id,
  })

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['achievements', user?.id],
    queryFn: () => fetchUserAchievements(user!.id),
    enabled: !!user?.id,
  })

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.score ?? 0), 0) / attempts.length)
    : 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and view achievements.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <button type="button" className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md" aria-label="Upload avatar">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl">{user?.full_name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="capitalize">{user?.role ?? 'student'}</Badge>
                <Badge variant="outline" className="gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {levelLabel(studentLevel)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Study Streak', value: `${user?.study_streak ?? 0} days` },
          { label: 'Sessions', value: attempts.length },
          { label: 'Avg Score', value: `${avgScore}%` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="font-bold text-xl">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Achievements</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          {achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-2">Complete practice sessions to unlock achievements.</p>
          ) : (
            achievements.map((a) => {
              const Icon = iconMap[a.icon] ?? Trophy
              return (
                <div key={a.id} className={`flex items-center gap-3 p-4 rounded-xl border ${a.unlocked ? 'border-primary/20 bg-primary/5' : 'border-border opacity-60'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`w-5 h-5 ${a.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full">Edit Profile</Button>
    </div>
  )
}
