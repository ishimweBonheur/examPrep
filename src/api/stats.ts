import { apiGet, getToken } from '@/api/http'

export interface AdminAnalyticsData {
  enrollment: { labels: string[]; data: number[] }
  subject_distribution: { labels: string[]; data: number[] }
}

export interface ExtendedAdminAnalytics extends AdminAnalyticsData {
  kpis: {
    total_attempts: number
    active_subscriptions: number
    community_posts: number
    avg_recent_score: number
  }
  difficulty_trends: { labels: string[]; data: number[] }
  engagement: { labels: string[]; data: number[] }
  completion_rate: number
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

export interface AdminInsights {
  summary: string
  insights: { category: string; title: string; detail: string; priority: string }[]
  recommendations: string[]
  predictions: string[]
}

export interface StudentResultsData {
  summary: {
    total_attempts: number
    average_score: number
    pass_count: number
    fail_count: number
    pass_rate: number
  }
  subject_performance: {
    subject_id: string
    name: string
    average: number
    attempts: number
    class_average: number
  }[]
  progress_over_time: { label: string; date: string; score: number; type: string }[]
  class_comparison: { subject: string; your_score: number; class_average: number; difference: number }[]
  strengths: { topic: string; rate: number; total: number }[]
  weaknesses: { topic: string; rate: number; total: number }[]
  pass_fail: { pass: number; fail: number }
  difficulty_breakdown: { level: string; accuracy: number; total: number }[]
  ai_insights?: string[]
}

export function fetchAdminAnalytics() {
  return apiGet<AdminAnalyticsData>('/stats/admin-analytics')
}

export function fetchExtendedAdminAnalytics() {
  return apiGet<ExtendedAdminAnalytics>('/stats/admin-analytics?extended=true')
}

export function fetchAdminInsights() {
  return apiGet<AdminInsights>('/stats/admin-analytics/insights')
}

export function fetchStudentProgress(userId?: string) {
  const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
  return apiGet<StudentProgressData>(`/stats/student-progress${qs}`)
}

export function fetchStudentResults(withInsights = true) {
  return apiGet<StudentResultsData>(`/stats/student-results?insights=${withInsights}`)
}

export interface ParsedQuestionRow {
  row_number: number
  subject_name: string
  topic: string
  question_text: string
  options: string[]
  correct_answer: number
  explanation?: string
  level: string
  difficulty: 'easy' | 'medium' | 'hard'
  year: number
  errors: string[]
  is_duplicate: boolean
}

export interface ImportPreview {
  batch_id: string
  level: string
  total: number
  valid: number
  duplicates: number
  errors: number
  questions: ParsedQuestionRow[]
}

export async function parseQuestionImport(file: File, level: string): Promise<ImportPreview> {
  const form = new FormData()
  form.append('file', file)
  form.append('level', level)
  const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'
  const res = await fetch(`${API_BASE}/questions/import/parse`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Import failed')
  return json.data
}

export function publishQuestionImport(batchId: string, questions: ParsedQuestionRow[]) {
  return import('@/api/http').then(({ apiPost }) =>
    apiPost<{ batch_id: string; created_count: number; failed: { row_number: number; reason: string }[] }>(
      '/questions/import/publish',
      { batch_id: batchId, questions }
    )
  )
}

export function trackDocumentEngagement(id: string, action: 'view' | 'download') {
  return import('@/api/http').then(({ apiPost }) =>
    apiPost(`/documents/${id}/track`, { action })
  )
}
