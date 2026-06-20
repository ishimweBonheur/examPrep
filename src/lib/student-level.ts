import type { StudentLevel } from '@/types'

export const STUDENT_LEVELS: StudentLevel[] = ['S1', 'S2', 'S3', 'S6']

/** All academic levels supported for questions, community, and bulk import */
export const ALL_ACADEMIC_LEVELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] as const
export type AcademicLevel = typeof ALL_ACADEMIC_LEVELS[number]

export const STUDENT_LEVEL_LABELS: Record<StudentLevel, string> = {
  S1: 'Senior 1',
  S2: 'Senior 2',
  S3: 'Senior 3',
  S6: 'Senior 6',
}

export const DEFAULT_STUDENT_LEVEL: StudentLevel = 'S3'

export function getStudentLevel(level?: string | null): StudentLevel {
  if (level && STUDENT_LEVELS.includes(level as StudentLevel)) {
    return level as StudentLevel
  }
  return DEFAULT_STUDENT_LEVEL
}

export function matchesStudentLevel(recordLevel: string | undefined, studentLevel: StudentLevel): boolean {
  if (!recordLevel) return true
  return recordLevel === studentLevel
}

export function levelLabel(level: StudentLevel): string {
  return STUDENT_LEVEL_LABELS[level]
}
