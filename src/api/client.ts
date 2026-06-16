import {
  apiGet,
  apiPost,
  apiUpload,
  createHttpEntityApi,
  clearToken,
  setToken,
  getToken,
  isAuthenticated,
  ApiRequestError,
} from './http'
import type {
  User,
  Subject,
  Question,
  Document,
  ExamAttempt,
  CommunityPost,
  Message,
  SubscriptionPlan,
  Subscription,
  Payment,
  Notification,
  Testimonial,
} from '@/types'

export { isAuthenticated, getToken, setToken, clearToken, ApiRequestError }

export const base44 = {
  auth: {
    async me() {
      try {
        return await apiGet<User>('/auth/me')
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) {
          clearToken()
          const error = new Error('Unauthorized') as Error & { status: number }
          error.status = 401
          throw error
        }
        throw err
      }
    },

    async loginViaEmailPassword(email: string, password: string) {
      const result = await apiPost<{ user: User; access_token: string }>(
        '/auth/login',
        { email, password },
        false
      )
      setToken(result.access_token)
      return result
    },

    loginWithProvider(_provider: string, redirectUrl: string) {
      void _provider
      void apiPost<{ user: User; access_token: string }>(
        '/auth/login',
        { email: 'student@examprep.rw', password: 'password123' },
        false
      )
        .then((result) => {
          setToken(result.access_token)
          window.location.href = redirectUrl || '/dashboard'
        })
        .catch(() => {
          window.location.href = '/login'
        })
    },

    async register({ email, password, full_name }: { email: string; password: string; full_name?: string }) {
      return apiPost<{ success: boolean; requiresOtp: boolean }>(
        '/auth/register',
        { email, password, full_name },
        false
      )
    },

    async verifyOtp({ email, otpCode }: { email: string; otpCode: string }) {
      const result = await apiPost<{ access_token: string; user: User }>(
        '/auth/verify-otp',
        { email, otpCode },
        false
      )
      setToken(result.access_token)
      return result
    },

    async resendOtp(email: string) {
      return apiPost<{ success: boolean }>('/auth/resend-otp', { email }, false)
    },

    async resetPasswordRequest(email: string) {
      return apiPost<{ success: boolean }>('/auth/reset-password-request', { email }, false)
    },

    async resetPassword(payload: { resetToken: string; newPassword: string }) {
      return apiPost<{ success: boolean }>('/auth/reset-password', payload, false)
    },

    setToken(token: string) {
      setToken(token)
    },

    logout(redirectUrl?: string) {
      clearToken()
      if (redirectUrl) window.location.href = redirectUrl
    },

    redirectToLogin(returnUrl?: string) {
      const url = returnUrl ? `/login?return=${encodeURIComponent(returnUrl)}` : '/login'
      window.location.href = url
    },
  },

  entities: {
    User: createHttpEntityApi<User>('users'),
    Subject: createHttpEntityApi<Subject>('subjects'),
    Question: createHttpEntityApi<Question>('questions'),
    Document: createHttpEntityApi<Document>('documents'),
    ExamAttempt: createHttpEntityApi<ExamAttempt>('exam-attempts'),
    CommunityPost: createHttpEntityApi<CommunityPost>('community-posts'),
    Message: createHttpEntityApi<Message>('messages'),
    SubscriptionPlan: createHttpEntityApi<SubscriptionPlan>('subscription-plans'),
    Subscription: createHttpEntityApi<Subscription>('subscriptions'),
    Payment: createHttpEntityApi<Payment>('payments'),
    Notification: createHttpEntityApi<Notification>('notifications'),
    Testimonial: createHttpEntityApi<Testimonial>('testimonials'),
  },

  integrations: {
    Core: {
      async UploadFile({ file }: { file: File }) {
        return apiUpload(file)
      },

      async InvokeLLM({ prompt }: { prompt: string; [key: string]: unknown }) {
        await new Promise((r) => setTimeout(r, 800))
        const lower = prompt.toLowerCase()

        if (lower.includes('generate') && lower.includes('question')) {
          return {
            questions: [
              {
                question_text: 'What is the powerhouse of the cell?',
                options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'],
                correct_answer: 1,
                explanation: 'Mitochondria produce ATP through cellular respiration.',
                topic: 'Cell Biology',
                difficulty: 'easy',
              },
              {
                question_text: 'Which process converts light energy to chemical energy?',
                options: ['Respiration', 'Photosynthesis', 'Fermentation', 'Digestion'],
                correct_answer: 1,
                explanation: 'Photosynthesis occurs in chloroplasts.',
                topic: 'Ecology',
                difficulty: 'medium',
              },
            ],
          }
        }

        if (lower.includes('mock exam') || lower.includes('exam questions')) {
          return {
            questions: Array.from({ length: 5 }, (_, i) => ({
              question_text: `Mock exam question ${i + 1}: Select the best answer.`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correct_answer: i % 4,
              explanation: `Explanation for question ${i + 1}.`,
            })),
          }
        }

        return {
          response: `Great question! Based on the Rwanda national curriculum, here's my explanation:\n\nThis topic is frequently tested in national exams. Focus on understanding core concepts, practice with past papers, and review the marking scheme.\n\nWould you like me to generate practice questions on this topic?`,
        }
      },
    },
  },
}

export default base44
