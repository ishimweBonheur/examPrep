import {
  LayoutDashboard, BookOpen, HelpCircle, Users,
  MessageCircle, CircleDollarSign, FolderOpen,
  BarChart3, Flag, MessageSquareQuote,
  type LucideIcon,
} from 'lucide-react'

export interface AdminNavItem {
  path: string
  icon: LucideIcon
  label: string
}

export const adminNavItems: AdminNavItem[] = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/students', icon: Users, label: 'Students' },
  { path: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/admin/questions', icon: HelpCircle, label: 'Questions' },
  { path: '/admin/documents', icon: FolderOpen, label: 'Documents' },
  { path: '/admin/testimonials', icon: MessageSquareQuote, label: 'User Reviews' },
  { path: '/admin/community', icon: Flag, label: 'Moderation' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/admin/billing', icon: CircleDollarSign, label: 'Billing' },
]
