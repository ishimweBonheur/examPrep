import { lazy, Suspense } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/lib/AuthContext'
import { useAuth } from '@/hooks/use-auth'
import UserNotRegisteredError from '@/components/UserNotRegisteredError'
import ScrollToTop from '@/components/ScrollToTop'
import ProtectedRoute from '@/components/ProtectedRoute'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import OfflineBanner from '@/components/shared/OfflineBanner'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import { getPortalHomePath } from '@/lib/portal-home'

const PageNotFound = lazy(() => import('@/lib/PageNotFound'))
const PublicLayout = lazy(() => import('@/layouts/PublicLayout'))
const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const Subjects = lazy(() => import('@/pages/Subjects'))
const Features = lazy(() => import('@/pages/Features'))
const CommunityHub = lazy(() => import('@/pages/Community'))
const Pricing = lazy(() => import('@/pages/Pricing'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))

const PortalLayout = lazy(() => import('@/components/portal/PortalLayout'))
const Dashboard = lazy(() => import('@/pages/portal/Dashboard'))
const PortalSubjects = lazy(() => import('@/pages/portal/Subjects'))
const Topics = lazy(() => import('@/pages/portal/Topics'))
const Practice = lazy(() => import('@/pages/portal/Practice'))
const MockExam = lazy(() => import('@/pages/portal/MockExam'))
const Results = lazy(() => import('@/pages/portal/Results'))
const ProgressPage = lazy(() => import('@/pages/portal/Progress'))
const AiTutor = lazy(() => import('@/pages/portal/AiTutor'))
const PortalCommunity = lazy(() => import('@/pages/portal/Community'))
const Messages = lazy(() => import('@/pages/portal/Messages'))
const Billing = lazy(() => import('@/pages/portal/Billing'))
const PastPapers = lazy(() => import('@/pages/portal/PastPapers'))
const StudyResources = lazy(() => import('@/pages/portal/StudyResources'))
const Courses = lazy(() => import('@/pages/portal/Courses'))
const Profile = lazy(() => import('@/pages/portal/Profile'))
const Notifications = lazy(() => import('@/pages/portal/Notifications'))
const Settings = lazy(() => import('@/pages/portal/Settings'))
const HelpCenter = lazy(() => import('@/pages/portal/HelpCenter'))
const Demo = lazy(() => import('@/pages/Demo'))

const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminSubjects = lazy(() => import('@/pages/admin/AdminSubjects'))
const AdminQuestions = lazy(() => import('@/pages/admin/AdminQuestions'))
const AdminStudents = lazy(() => import('@/pages/admin/AdminStudents'))
const AdminMessages = lazy(() => import('@/pages/admin/AdminMessages'))
const AdminBilling = lazy(() => import('@/pages/admin/AdminBilling'))
const AdminDocuments = lazy(() => import('@/pages/admin/AdminDocuments'))
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'))
const AdminCommunity = lazy(() => import('@/pages/admin/AdminCommunity'))
const AdminTestimonials = lazy(() => import('@/pages/admin/AdminTestimonials'))

function PortalEntryRedirect() {
  const { user, isLoadingAuth } = useAuth()
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }
  return <Navigate to={getPortalHomePath(user?.role)} replace />
}

function PortalRedirect() {
  const location = useLocation()
  const { user, isLoadingAuth } = useAuth()

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  const newPath = location.pathname.replace(/^\/portal/, '/dashboard')
  return <Navigate to={newPath + location.search + location.hash} replace />
}

function AuthenticatedApp() {
  const { isLoadingAuth, authError } = useAuth()

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="features" element={<Features />} />
          <Route path="community" element={<CommunityHub />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="demo" element={<Demo />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route element={<PortalLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/subjects" element={<PortalSubjects />} />
            <Route path="/dashboard/subjects/:subjectId" element={<Topics />} />
            <Route path="/dashboard/practice" element={<Practice />} />
            <Route path="/dashboard/mock-exam" element={<MockExam />} />
            <Route path="/dashboard/results" element={<Results />} />
            <Route path="/dashboard/progress" element={<ProgressPage />} />
            <Route path="/dashboard/ai-tutor" element={<AiTutor />} />
            <Route path="/dashboard/community" element={<PortalCommunity />} />
            <Route path="/dashboard/messages" element={<Messages />} />
            <Route path="/dashboard/billing" element={<Billing />} />
            <Route path="/dashboard/past-papers" element={<PastPapers />} />
            <Route path="/dashboard/resources" element={<StudyResources />} />
            <Route path="/dashboard/courses" element={<Courses />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/help" element={<HelpCenter />} />
          </Route>

          <Route path="/portal" element={<PortalEntryRedirect />} />
          <Route path="/portal/*" element={<PortalRedirect />} />

          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/subjects" element={<AdminSubjects />} />
            <Route path="/admin/questions" element={<AdminQuestions />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/billing" element={<AdminBilling />} />
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/community" element={<AdminCommunity />} />
          </Route>
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
            <OfflineBanner />
          </Router>
          <Toaster position="top-right" />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
