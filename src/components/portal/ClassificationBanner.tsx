import { Link } from 'react-router-dom'
import { GraduationCap, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { levelLabel } from '@/lib/student-level'
import type { StudentLevel } from '@/types'

interface ClassificationBannerProps {
  level: StudentLevel
  compact?: boolean
}

export default function ClassificationBanner({ level, compact }: ClassificationBannerProps) {
  if (compact) {
    return (
      <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-3 py-1">
        <GraduationCap className="w-3.5 h-3.5" />
        {levelLabel(level)} resources
      </Badge>
    )
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5 overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-heading font-bold text-foreground">
              You&apos;re viewing {levelLabel(level)} content
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Past papers, mock exams, notes, and practice questions are filtered for your class level.
              Change your level in settings if needed.
            </p>
          </div>
        </div>
        <Link to="/dashboard/settings" className="shrink-0">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 w-full sm:w-auto">
            <Settings className="w-4 h-4" />
            Update level
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
