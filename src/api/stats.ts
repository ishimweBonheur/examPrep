import { apiGet } from '@/api/http'

export interface AdminAnalyticsData {
  enrollment: { labels: string[]; data: number[] }
  subject_distribution: { labels: string[]; data: number[] }
}

export interface StudentProgressData {
  weekly_time: { labels: string[]; data: number[] }
  subject_progress: {
    subject_id: string
    name: string
    progress: number
    attempts: number
    question_count: number
  }[]
}

export function fetchAdminAnalytics() {
  return apiGet<AdminAnalyticsData>('/stats/admin-analytics')
}

export function fetchStudentProgress(userId?: string) {
  const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
  return apiGet<StudentProgressData>(`/stats/student-progress${qs}`)
}
