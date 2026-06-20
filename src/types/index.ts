export type StudentLevel = 'S1' | 'S2' | 'S3' | 'S6'

export interface User {
  id: string
  email: string
  full_name: string
  role: 'student' | 'admin' | 'teacher'
  level?: StudentLevel
  avatar_url?: string
  study_streak?: number
  email_verified?: boolean
  admin_approved?: boolean
  created_date: string
}

export interface UserSettings {
  email_notifications: boolean
  push_notifications: boolean
  learning_reminders: boolean
  community_notifications: boolean
  result_notifications: boolean
  profile_visibility: 'public' | 'private' | 'friends'
  show_progress: boolean
  language: string
}

export interface AccessStatus {
  has_full_access: boolean
  admin_approved: boolean
}

export interface ClassLevelRequest {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  user_level?: StudentLevel
  current_level?: StudentLevel
  requested_level: StudentLevel
  status: 'pending' | 'approved' | 'rejected'
  admin_note?: string
  created_date: string
}

export interface Topic {
  name: string
  description?: string
}

export interface Subject {
  id: string
  name: string
  description?: string
  icon?: string
  cover_image_url?: string
  level: 'S1' | 'S2' | 'S3' | 'S6'
  topics?: Topic[]
  progress?: number
  created_date: string
}

export interface Question {
  id: string
  subject_id: string
  topic: string
  year: number
  difficulty: 'easy' | 'medium' | 'hard'
  question_text: string
  options: string[]
  correct_answer: number
  explanation?: string
  level: string
  created_date: string
}

export type DocumentCategory =
  | 'past_paper'
  | 'solutions'
  | 'study_notes'
  | 'revision_guide'
  | 'syllabus'
  | 'notes'
  | 'assignments'
  | 'exams'
  | 'resources'

export interface Document {
  id: string
  title: string
  description?: string
  subject_id: string
  subject_name?: string
  topic?: string
  year: number
  category: DocumentCategory
  level: string
  file_type: string
  file_url?: string
  solution_url?: string
  views_count?: number
  downloads_count?: number
  created_date: string
}

export interface ExamAttempt {
  id: string
  student_id: string
  subject_id?: string
  type: 'practice' | 'mock_exam'
  topic?: string
  score?: number
  total_questions: number
  correct_count: number
  completed: boolean
  time_spent_seconds?: number
  created_date: string
}

export interface CommunityReply {
  id: string
  author_id: string
  author_name: string
  author_reputation?: number
  content: string
  is_teacher: boolean
  parent_reply_id?: string
  upvotes?: number
  downvotes?: number
  created_at: string
}

export interface CommunityPost {
  id: string
  author_id: string
  author_name: string
  author_role?: string
  author_reputation?: number
  title: string
  content: string
  subject_tag?: string
  tags?: string[]
  level?: string
  upvotes: number
  downvotes: number
  comment_count: number
  accepted_reply_id?: string
  replies?: CommunityReply[]
  is_teacher_only?: boolean
  is_saved?: boolean
  user_vote?: 'up' | 'down' | null
  created_date: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  conversation_id: string
  subject: string
  content: string
  is_read: boolean
  delivered_date?: string
  sender_name?: string
  sender_role?: string
  created_date: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price: number
  price_monthly?: number
  price_yearly?: number
  recommended?: boolean
  currency: string
  duration_days: number
  features?: string[]
  is_active: boolean
  sort_order: number
  created_date: string
}

export interface Subscription {
  id: string
  student_id: string
  plan_id: string
  plan_name?: string
  status: 'active' | 'expired' | 'cancelled' | 'trial'
  payment_status: 'paid' | 'pending' | 'failed'
  amount_paid: number
  start_date: string
  end_date: string
  trial_start_date?: string
  trial_end_date?: string
  billing_cycle?: string
  payment_method?: string
  auto_renew?: boolean
  created_date: string
}

export interface Payment {
  id: string
  student_id: string
  plan_id?: string
  plan_name?: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed'
  method?: string
  payment_method?: string
  billing_cycle?: string
  reference?: string
  transaction_ref?: string
  phone_number?: string
  created_date: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'community'
  read: boolean
  link?: string
  created_date: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlocked_date?: string
}

export interface Testimonial {
  id: string
  user_name: string
  role: string
  message: string
  rating: number
  avatar_url?: string
  is_active: boolean
  created_date: string
  updated_date: string
}

export interface PublicStats {
  subject_count: number
  question_count: number
  student_count: number
  community_post_count: number
  document_count: number
  testimonial_count: number
  average_rating: number
  satisfaction_rate: number
  subjects: Array<{
    id: string
    name: string
    description?: string
    icon?: string
    cover_image_url?: string
    level: string
    topic_count: number
    question_count: number
  }>
  courses: Array<{
    id: string
    title: string
    level: string
    subject_name: string
    subject_id: string
    file_url?: string
  }>
}

/** Normalized question shape for practice / mock exam UI */
export interface PracticeQuestion {
  question_text: string
  options: { label: string; text: string }[]
  correct_answer: string
  explanation?: string
  difficulty?: string
}

export interface PracticeAnswer extends PracticeQuestion {
  selected_answer: string
  is_correct: boolean
}
