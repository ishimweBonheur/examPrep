import {
  LayoutDashboard, BookOpen, Target, FileText,
  Brain, Users, MessageCircle, CircleDollarSign,
  BarChart3, Bell, User, Settings, Library,
  type LucideIcon,
} from 'lucide-react'

export interface PortalNavItem {
  path: string
  icon: LucideIcon
  label: string
}

export const portalNavItems: PortalNavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/dashboard/resources', icon: Library, label: 'Study Resources' },
  { path: '/dashboard/courses', icon: Library, label: 'Courses' },
  { path: '/dashboard/practice', icon: Target, label: 'Practice' },
  { path: '/dashboard/mock-exam', icon: FileText, label: 'Mock Exams' },
  { path: '/dashboard/results', icon: BarChart3, label: 'Results' },
  { path: '/dashboard/progress', icon: BarChart3, label: 'Progress' },
  { path: '/dashboard/past-papers', icon: FileText, label: 'Past Papers' },
  { path: '/dashboard/ai-tutor', icon: Brain, label: 'AI Tutor' },
  { path: '/dashboard/community', icon: Users, label: 'Community' },
  { path: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/dashboard/billing', icon: CircleDollarSign, label: 'Billing' },
  { path: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { path: '/dashboard/profile', icon: User, label: 'Profile' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
]
