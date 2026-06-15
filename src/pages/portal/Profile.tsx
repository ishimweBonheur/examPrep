import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Trophy, Flame, Target, BookOpen, Camera } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import type { ExamAttempt } from '@/types'

const achievements = [
  { id: '1', title: 'First Practice', description: 'Complete your first practice session', icon: Target, unlocked: true },
  { id: '2', title: 'Week Warrior', description: '7-day study streak', icon: Flame, unlocked: true },
  { id: '3', title: 'Mock Master', description: 'Score 80%+ on a mock exam', icon: Trophy, unlocked: false },
  { id: '4', title: 'Bookworm', description: 'Complete all subject topics', icon: BookOpen, unlocked: false },
]

export default function Profile() {
  const { user } = useAuth()

  const { data: attempts = [] } = useQuery<ExamAttempt[]>({
    queryKey: ['exam-attempts'],
    queryFn: () => base44.entities.ExamAttempt.filter({ student_id: user?.id, completed: true }, '-created_date', 100) as Promise<ExamAttempt[]>,
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
              <Badge className="mt-2 capitalize">{user?.role ?? 'student'}</Badge>
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
          {achievements.map((a) => (
            <div key={a.id} className={`flex items-center gap-3 p-4 rounded-xl border ${a.unlocked ? 'border-primary/20 bg-primary/5' : 'border-border opacity-60'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                <a.icon className={`w-5 h-5 ${a.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full">Edit Profile</Button>
    </div>
  )
}
