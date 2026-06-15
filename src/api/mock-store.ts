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
} from '@/types'

const STORAGE_KEY = 'examprep_mock_store_v1'

interface MockStore {
  users: User[]
  subjects: Subject[]
  questions: Question[]
  documents: Document[]
  examAttempts: ExamAttempt[]
  communityPosts: CommunityPost[]
  messages: Message[]
  subscriptionPlans: SubscriptionPlan[]
  subscriptions: Subscription[]
  payments: Payment[]
  notifications: Notification[]
}

const now = () => new Date().toISOString()
const id = () => crypto.randomUUID()

const seedStore = (): MockStore => ({
  users: [
    {
      id: 'admin-1',
      email: 'admin@examprep.rw',
      full_name: 'Admin User',
      role: 'admin',
      study_streak: 0,
      created_date: now(),
    },
    {
      id: 'student-1',
      email: 'student@examprep.rw',
      full_name: 'Jean Uwimana',
      role: 'student',
      avatar_url: undefined,
      study_streak: 7,
      created_date: now(),
    },
    {
      id: 'teacher-1',
      email: 'teacher@examprep.rw',
      full_name: 'Dr. Marie Mukamana',
      role: 'teacher',
      created_date: now(),
    },
  ],
  subjects: [
    {
      id: 'sub-bio',
      name: 'Biology',
      description: 'National curriculum biology for S3–S6',
      icon: 'Leaf',
      level: 'S3',
      progress: 68,
      topics: [
        { name: 'Cell Biology', description: 'Structure and function of cells' },
        { name: 'Genetics', description: 'Heredity and DNA' },
        { name: 'Ecology', description: 'Ecosystems and environment' },
        { name: 'Human Physiology', description: 'Body systems' },
      ],
      created_date: now(),
    },
    {
      id: 'sub-chem',
      name: 'Chemistry',
      description: 'Organic, inorganic, and physical chemistry',
      icon: 'FlaskConical',
      level: 'S3',
      progress: 45,
      topics: [
        { name: 'Atomic Structure', description: 'Atoms, isotopes, periodic table' },
        { name: 'Chemical Bonding', description: 'Ionic and covalent bonds' },
        { name: 'Acids & Bases', description: 'pH, neutralization' },
        { name: 'Organic Chemistry', description: 'Hydrocarbons and functional groups' },
      ],
      created_date: now(),
    },
    {
      id: 'sub-ent',
      name: 'Entrepreneurship',
      description: 'Business skills and innovation for Rwandan students',
      icon: 'Lightbulb',
      level: 'S3',
      progress: 82,
      topics: [
        { name: 'Business Planning', description: 'Creating a business plan' },
        { name: 'Marketing', description: 'Market research and promotion' },
        { name: 'Finance', description: 'Budgeting and accounting basics' },
        { name: 'Innovation', description: 'Creative problem solving' },
      ],
      created_date: now(),
    },
  ],
  questions: [
    {
      id: 'q1',
      subject_id: 'sub-bio',
      topic: 'Cell Biology',
      year: 2024,
      difficulty: 'medium',
      question_text: 'Which organelle is responsible for protein synthesis?',
      options: ['Mitochondria', 'Ribosome', 'Golgi apparatus', 'Lysosome'],
      correct_answer: 1,
      explanation: 'Ribosomes are the site of protein synthesis in cells.',
      level: 'S3',
      created_date: now(),
    },
    {
      id: 'q2',
      subject_id: 'sub-bio',
      topic: 'Genetics',
      year: 2023,
      difficulty: 'hard',
      question_text: 'What is the complementary base pair to Adenine in DNA?',
      options: ['Guanine', 'Cytosine', 'Thymine', 'Uracil'],
      correct_answer: 2,
      explanation: 'In DNA, Adenine pairs with Thymine (A-T).',
      level: 'S3',
      created_date: now(),
    },
    {
      id: 'q3',
      subject_id: 'sub-chem',
      topic: 'Atomic Structure',
      year: 2024,
      difficulty: 'easy',
      question_text: 'What is the atomic number of an element?',
      options: ['Number of neutrons', 'Number of protons', 'Mass number', 'Number of electrons in outer shell'],
      correct_answer: 1,
      explanation: 'Atomic number equals the number of protons in the nucleus.',
      level: 'S3',
      created_date: now(),
    },
    {
      id: 'q4',
      subject_id: 'sub-chem',
      topic: 'Acids & Bases',
      year: 2023,
      difficulty: 'medium',
      question_text: 'A solution with pH 3 is:',
      options: ['Neutral', 'Acidic', 'Basic', 'Amphoteric'],
      correct_answer: 1,
      explanation: 'pH below 7 indicates an acidic solution.',
      level: 'S3',
      created_date: now(),
    },
    {
      id: 'q5',
      subject_id: 'sub-ent',
      topic: 'Business Planning',
      year: 2024,
      difficulty: 'easy',
      question_text: 'What is a SWOT analysis used for?',
      options: ['Financial auditing', 'Strategic planning', 'Tax calculation', 'Inventory management'],
      correct_answer: 1,
      explanation: 'SWOT analyzes Strengths, Weaknesses, Opportunities, and Threats for strategic planning.',
      level: 'S3',
      created_date: now(),
    },
  ],
  documents: [
    {
      id: 'doc1',
      title: 'Biology S3 National Exam 2024',
      description: 'Official past paper for Biology S3',
      subject_id: 'sub-bio',
      subject_name: 'Biology',
      topic: 'General',
      year: 2024,
      category: 'past_paper',
      level: 'S3',
      file_type: 'pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      solution_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      views_count: 124,
      downloads_count: 45,
      created_date: now(),
    },
    {
      id: 'doc2',
      title: 'Chemistry S3 National Exam 2023',
      description: 'Official past paper with marking scheme',
      subject_id: 'sub-chem',
      subject_name: 'Chemistry',
      topic: 'General',
      year: 2023,
      category: 'past_paper',
      level: 'S3',
      file_type: 'pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      solution_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      views_count: 98,
      downloads_count: 32,
      created_date: now(),
    },
    {
      id: 'doc3',
      title: 'Entrepreneurship Syllabus S3',
      description: 'Course of study outline for Entrepreneurship',
      subject_id: 'sub-ent',
      subject_name: 'Entrepreneurship',
      category: 'syllabus',
      year: 2024,
      level: 'S3',
      file_type: 'pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      views_count: 56,
      downloads_count: 12,
      created_date: now(),
    },
    {
      id: 'doc4',
      title: 'Biology S3 Course of Study',
      description: 'Official biology syllabus and curriculum framework',
      subject_id: 'sub-bio',
      subject_name: 'Biology',
      category: 'syllabus',
      year: 2024,
      level: 'S3',
      file_type: 'pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      views_count: 89,
      downloads_count: 20,
      created_date: now(),
    },
    {
      id: 'doc5',
      title: 'Chemistry S3 Course of Study',
      description: 'Official chemistry syllabus and curriculum framework',
      subject_id: 'sub-chem',
      subject_name: 'Chemistry',
      category: 'syllabus',
      year: 2024,
      level: 'S3',
      file_type: 'pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      views_count: 72,
      downloads_count: 18,
      created_date: now(),
    },
    {
      id: 'doc6',
      title: 'Biology 2022 Marking Scheme',
      description: 'Official solutions for Biology 2022 national exam',
      subject_id: 'sub-bio',
      subject_name: 'Biology',
      topic: 'General',
      year: 2022,
      category: 'solutions',
      level: 'S3',
      file_type: 'pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      views_count: 210,
      downloads_count: 88,
      created_date: now(),
    },
  ],
  examAttempts: [
    {
      id: 'ea1',
      student_id: 'student-1',
      subject_id: 'sub-bio',
      type: 'practice',
      topic: 'Cell Biology',
      score: 80,
      total_questions: 5,
      correct_count: 4,
      completed: true,
      time_spent_seconds: 420,
      created_date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'ea2',
      student_id: 'student-1',
      subject_id: 'sub-chem',
      type: 'mock_exam',
      score: 65,
      total_questions: 10,
      correct_count: 6,
      completed: true,
      time_spent_seconds: 1800,
      created_date: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  communityPosts: [
    {
      id: 'cp1',
      author_id: 'student-1',
      author_name: 'Jean Uwimana',
      title: 'How to prepare for Biology genetics questions?',
      content: 'I struggle with Punnett squares and dihybrid crosses. Any tips from seniors who passed the national exam?',
      subject_tag: 'Biology',
      tags: ['genetics', 'exam-prep'],
      upvotes: 24,
      downvotes: 2,
      comment_count: 8,
      created_date: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'cp2',
      author_id: 'teacher-1',
      author_name: 'Dr. Marie Mukamana',
      author_role: 'teacher',
      title: 'Chemistry: Understanding mole calculations',
      content: 'Here is a step-by-step approach to mole calculation problems that appear frequently in national exams.',
      subject_tag: 'Chemistry',
      tags: ['mole', 'calculations'],
      upvotes: 45,
      downvotes: 0,
      comment_count: 12,
      created_date: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  messages: [],
  subscriptionPlans: [
    {
      id: 'plan-basic',
      name: 'Basic',
      description: 'View past papers in-app',
      price: 0,
      price_monthly: 0,
      price_yearly: 0,
      currency: 'RWF',
      duration_days: 365,
      features: ['View documents in-app', 'Limited practice questions', 'Community access'],
      is_active: true,
      sort_order: 1,
      created_date: now(),
    },
    {
      id: 'plan-pro',
      name: 'Pro',
      description: 'Full access with downloads',
      price: 5000,
      price_monthly: 5000,
      price_yearly: 45000,
      recommended: true,
      currency: 'RWF',
      duration_days: 30,
      features: ['Download past papers & solutions', 'Unlimited practice', 'AI Tutor', 'Mock exams'],
      is_active: true,
      sort_order: 2,
      created_date: now(),
    },
    {
      id: 'plan-premium',
      name: 'Premium',
      description: 'Best value annual plan',
      price: 45000,
      price_monthly: 5000,
      price_yearly: 45000,
      currency: 'RWF',
      duration_days: 365,
      features: ['Everything in Pro', 'Priority support', 'Progress analytics', 'Offline downloads'],
      is_active: true,
      sort_order: 3,
      created_date: now(),
    },
  ],
  subscriptions: [
    {
      id: 'sub-student-trial',
      student_id: 'student-1',
      plan_id: 'plan-basic',
      plan_name: 'Basic',
      status: 'trial',
      payment_status: 'pending',
      amount_paid: 0,
      start_date: now(),
      end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      created_date: now(),
    },
  ],
  payments: [],
  notifications: [
    {
      id: 'n1',
      user_id: 'student-1',
      title: 'New past paper uploaded',
      message: 'Biology S3 National Exam 2024 is now available.',
      type: 'info',
      read: false,
      link: '/dashboard/past-papers',
      created_date: now(),
    },
    {
      id: 'n2',
      user_id: 'student-1',
      title: 'Study streak!',
      message: 'You have a 7-day study streak. Keep it up!',
      type: 'success',
      read: false,
      created_date: now(),
    },
  ],
})

function loadStore(): MockStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as MockStore
  } catch {
    /* reset on corrupt data */
  }
  const seeded = seedStore()
  saveStore(seeded)
  return seeded
}

function saveStore(store: MockStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

let store = typeof window !== 'undefined' ? loadStore() : seedStore()

export function getStore(): MockStore {
  if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
    store = loadStore()
  }
  return store
}

export function persistStore(): void {
  saveStore(store)
}

export function resetStore(): void {
  store = seedStore()
  saveStore(store)
}

export { id, now }

type EntityName = keyof Omit<MockStore, never>

function sortRecords<T extends Record<string, unknown>>(
  records: T[],
  sortField?: string,
  limit?: number
): T[] {
  let result = [...records]
  if (sortField) {
    const desc = sortField.startsWith('-')
    const field = desc ? sortField.slice(1) : sortField
    result.sort((a, b) => {
      const av = a[field]
      const bv = b[field]
      if (av === bv) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av < bv ? -1 : 1
      return desc ? -cmp : cmp
    })
  }
  if (limit) result = result.slice(0, limit)
  return result
}

function matchesQuery<T extends Record<string, unknown>>(record: T, query: Record<string, unknown>): boolean {
  return Object.entries(query).every(([key, value]) => {
    if (value === undefined || value === '') return true
    return record[key] === value
  })
}

export function createEntityApi<K extends EntityName>(entityName: K) {
  type Item = MockStore[K] extends (infer U)[] ? U : never
  return {
    list(sortField?: string, limit?: number): Promise<Item[]> {
      const records = store[entityName] as Item[]
      return Promise.resolve(sortRecords(records as Record<string, unknown>[], sortField, limit) as Item[])
    },
    filter(query: Record<string, unknown>, sortField?: string, limit?: number): Promise<Item[]> {
      const records = store[entityName] as Item[]
      const filtered = records.filter((r) => matchesQuery(r as Record<string, unknown>, query))
      return Promise.resolve(sortRecords(filtered as Record<string, unknown>[], sortField, limit) as Item[])
    },
    create(data: Record<string, unknown>): Promise<Item> {
      const record = { id: id(), created_date: now(), ...data } as Item
      ;(store[entityName] as Item[]).push(record)
      persistStore()
      return Promise.resolve(record)
    },
    update(recordId: string, data: Record<string, unknown>): Promise<Item> {
      const records = store[entityName] as Item[]
      const idx = records.findIndex((r) => (r as { id: string }).id === recordId)
      if (idx === -1) return Promise.reject(new Error('Not found'))
      const current = records[idx] as Record<string, unknown>
      records[idx] = { ...current, ...data } as Item
      persistStore()
      return Promise.resolve(records[idx])
    },
    delete(recordId: string): Promise<{ success: boolean }> {
      const records = store[entityName] as Item[]
      const idx = records.findIndex((r) => (r as { id: string }).id === recordId)
      if (idx === -1) return Promise.reject(new Error('Not found'))
      records.splice(idx, 1)
      persistStore()
      return Promise.resolve({ success: true })
    },
  }
}

const TOKEN_KEY = 'examprep_auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getCurrentUser(): User | null {
  const token = getToken()
  if (!token) return null
  return store.users.find((u) => u.id === token) ?? null
}

export function findUserByEmail(email: string): User | undefined {
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function registerUser(email: string, password: string, fullName?: string): User {
  void password
  const user: User = {
    id: id(),
    email,
    full_name: fullName ?? email.split('@')[0],
    role: 'student',
    study_streak: 0,
    created_date: now(),
  }
  store.users.push(user)
  persistStore()
  return user
}
