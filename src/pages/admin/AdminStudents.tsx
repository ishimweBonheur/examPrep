import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { approveStudent, fetchClassLevelRequests, reviewClassLevelRequest } from '@/api/http'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/format-date'
import { levelLabel } from '@/lib/student-level'
import toast from 'react-hot-toast'
import type { User, ExamAttempt, ClassLevelRequest } from '@/types'

interface StudentStat extends User {
  attempts: number
  avgScore: number
}

export default function AdminStudents() {
  const queryClient = useQueryClient()
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const { data: students = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin-students'],
    queryFn: () => base44.entities.User.list(),
  })

  const { data: attempts = [] } = useQuery<ExamAttempt[]>({
    queryKey: ['admin-attempts'],
    queryFn: () => base44.entities.ExamAttempt.filter({ completed: true }, '-created_date', 500),
  })

  const { data: levelRequests = [] } = useQuery<ClassLevelRequest[]>({
    queryKey: ['admin-class-level-requests'],
    queryFn: () => fetchClassLevelRequests('pending'),
  })

  const studentStats: StudentStat[] = students
    .filter((s) => s.role !== 'admin')
    .map((s) => {
      const studentAttempts = attempts.filter((a) => a.student_id === s.id)
      const avgScore = studentAttempts.length
        ? Math.round(studentAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / studentAttempts.length)
        : 0
      return { ...s, attempts: studentAttempts.length, avgScore }
    })

  const handleApprove = async (studentId: string) => {
    setApprovingId(studentId)
    try {
      await approveStudent(studentId)
      queryClient.invalidateQueries({ queryKey: ['admin-students'] })
      toast.success('Student approved — full access granted')
    } catch {
      toast.error('Could not approve student')
    } finally {
      setApprovingId(null)
    }
  }

  const handleReviewLevel = async (id: string, action: 'approve' | 'reject') => {
    try {
      await reviewClassLevelRequest(id, action)
      queryClient.invalidateQueries({ queryKey: ['admin-class-level-requests', 'admin-students'] })
      toast.success(action === 'approve' ? 'Class level updated' : 'Request rejected')
    } catch {
      toast.error('Could not review request')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Students</h1>
        <p className="text-muted-foreground mt-1">{studentStats.length} registered students.</p>
      </div>

      {levelRequests.length > 0 && (
        <Card className="border border-amber-200">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b bg-amber-50">
              <h2 className="font-semibold text-amber-900">Pending class level requests ({levelRequests.length})</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levelRequests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.user_name ?? r.user_id}</TableCell>
                    <TableCell>{r.current_level ? levelLabel(r.current_level) : '—'}</TableCell>
                    <TableCell>{levelLabel(r.requested_level)}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" onClick={() => void handleReviewLevel(r.id, 'approve')}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => void handleReviewLevel(r.id, 'reject')}>Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentStats.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell>{s.level ? levelLabel(s.level) : '—'}</TableCell>
                    <TableCell>
                      {s.admin_approved ? (
                        <Badge className="bg-green-100 text-green-700 border-0">Approved</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(s.created_date, 'short')}</TableCell>
                    <TableCell>{s.attempts}</TableCell>
                    <TableCell>
                      <Badge className={`${s.avgScore >= 70 ? 'bg-green-100 text-green-700' : s.avgScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'} border-0`}>
                        {s.avgScore}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!s.admin_approved && (
                        <Button size="sm" disabled={approvingId === s.id} onClick={() => void handleApprove(s.id)}>
                          Approve access
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {studentStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No students yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
