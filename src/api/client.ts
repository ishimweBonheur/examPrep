import {
  createEntityApi,
  getCurrentUser,
  setToken,
  clearToken,
  findUserByEmail,
  registerUser,
  getToken,
} from './mock-store'

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms))

export const base44 = {
  auth: {
    async me() {
      await delay()
      const user = getCurrentUser()
      if (!user) {
        const err = new Error('Unauthorized') as Error & { status: number }
        err.status = 401
        throw err
      }
      return user
    },

    async loginViaEmailPassword(email: string, password: string) {
      await delay(300)
      void password
      const user = findUserByEmail(email)
      if (!user) {
        throw new Error('Invalid email or password')
      }
      setToken(user.id)
      return { user, access_token: user.id }
    },

    loginWithProvider(_provider: string, redirectUrl: string) {
      void _provider
      const user = findUserByEmail('student@examprep.rw')
      if (user) setToken(user.id)
      window.location.href = redirectUrl || '/dashboard'
    },

    async register({ email, password, full_name }: { email: string; password: string; full_name?: string }) {
      await delay(300)
      if (findUserByEmail(email)) throw new Error('Email already registered')
      void password
      registerUser(email, password, full_name)
      return { success: true, requiresOtp: true }
    },

    async verifyOtp({ email, otpCode }: { email: string; otpCode: string }) {
      await delay(300)
      if (otpCode !== '123456') throw new Error('Invalid OTP code')
      const user = findUserByEmail(email)
      if (!user) throw new Error('User not found')
      setToken(user.id)
      return { access_token: user.id, user }
    },

    async resendOtp(email: string) {
      await delay(200)
      void email
      return { success: true }
    },

    async resetPasswordRequest(email: string) {
      await delay(300)
      void email
      return { success: true }
    },

    async resetPassword(payload: { resetToken: string; newPassword: string }) {
      await delay(300)
      void payload
      return { success: true }
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
    User: createEntityApi('users'),
    Subject: createEntityApi('subjects'),
    Question: createEntityApi('questions'),
    Document: createEntityApi('documents'),
    ExamAttempt: createEntityApi('examAttempts'),
    CommunityPost: createEntityApi('communityPosts'),
    Message: createEntityApi('messages'),
    SubscriptionPlan: createEntityApi('subscriptionPlans'),
    Subscription: createEntityApi('subscriptions'),
    Payment: createEntityApi('payments'),
    Notification: createEntityApi('notifications'),
    Testimonial: createEntityApi('testimonials'),
  },

  integrations: {
    Core: {
      async UploadFile({ file }: { file: File }) {
        await delay(500)
        const url = URL.createObjectURL(file)
        return { file_url: url }
      },

      async InvokeLLM({ prompt }: { prompt: string; [key: string]: unknown }) {
        await delay(800)
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

export function isAuthenticated(): boolean {
  return !!getToken()
}

export default base44
