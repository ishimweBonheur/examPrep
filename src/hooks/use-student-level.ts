import { useAuth } from '@/hooks/use-auth'
import { getStudentLevel } from '@/lib/student-level'
import type { StudentLevel } from '@/types'

export function useStudentLevel(): StudentLevel {
  const { user } = useAuth()
  return getStudentLevel(user?.level)
}
