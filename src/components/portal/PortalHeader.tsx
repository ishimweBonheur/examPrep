import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  GraduationCap, LogOut, Menu, X, Bell, User, Settings,
} from 'lucide-react'
import { base44 } from '@/api/client'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const mainNav = [
  { to: '/dashboard', label: 'Home', end: true },
  { to: '/dashboard/subjects', label: 'Subjects' },
  { to: '/dashboard/practice', label: 'Practice' },
  { to: '/dashboard/mock-exam', label: 'Exams' },
  { to: '/dashboard/ai-tutor', label: 'AI Tutor' },
]

const moreNav = [
  { to: '/dashboard/progress', label: 'Progress' },
  { to: '/dashboard/results', label: 'Results' },
  { to: '/dashboard/community', label: 'Community' },
  { to: '/dashboard/messages', label: 'Messages' },
  { to: '/dashboard/billing', label: 'Billing' },
  { to: '/dashboard/settings', label: 'Settings' },
]

export default function PortalHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const handleLogout = () => base44.auth.logout('/')

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary text-white'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    )

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-foreground hidden sm:block">
              ExamPrep
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {mainNav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              to="/dashboard/notifications"
              className={cn(
                'p-2 rounded-full transition-colors',
                location.pathname === '/dashboard/notifications'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              )}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-muted transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                {user?.full_name?.split(' ')[0] ?? 'Student'}
              </span>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-1">
          {[...mainNav, ...moreNav].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                location.pathname === item.to
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3 border-t border-border mt-3">
            <Link
              to="/dashboard/profile"
              onClick={() => setMobileOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border border-border"
            >
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link
              to="/dashboard/settings"
              onClick={() => setMobileOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border border-border"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 mt-1"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </header>
  )
}
