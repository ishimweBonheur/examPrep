import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/format-date';

interface User {
  id: string;
  full_name?: string;
  email: string;
  role: string;
  created_date: string;
}

interface ExamAttempt {
  id: string;
  student_id: string;
  score?: number;
  completed: boolean;
  created_date: string;
}

interface StudentStat extends User {
  attempts: number;
  avgScore: number;
}

export default function AdminStudents() {
  const { data: students = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin-students'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: attempts = [] } = useQuery<ExamAttempt[]>({
    queryKey: ['admin-attempts'],
    queryFn: () => base44.entities.ExamAttempt.filter({ completed: true }, '-created_date', 500),
  });

  const studentStats: StudentStat[] = students
    .filter((s: User) => s.role !== 'admin')
    .map((s: User) => {
      const studentAttempts = attempts.filter((a: ExamAttempt) => a.student_id === s.id);
      const avgScore = studentAttempts.length
        ? Math.round(studentAttempts.reduce((sum: number, a: ExamAttempt) => sum + (a.score || 0), 0) / studentAttempts.length)
        : 0;
      return { ...s, attempts: studentAttempts.length, avgScore };
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Students</h1>
        <p className="text-muted-foreground mt-1">{studentStats.length} registered students.</p>
      </div>

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
                  <TableHead>Joined</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Avg Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentStats.map((s: StudentStat) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(s.created_date, 'short')}</TableCell>
                    <TableCell>{s.attempts}</TableCell>
                    <TableCell>
                      <Badge className={`${s.avgScore >= 70 ? 'bg-green-100 text-green-700' : s.avgScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'} border-0`}>
                        {s.avgScore}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {studentStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No students yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}