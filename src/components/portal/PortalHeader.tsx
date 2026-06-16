import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Bell, Menu, X, LogOut, User, Settings, HelpCircle } from 'lucide-react'
import { base44 } from '@/api/client'
import { fetchUnreadNotificationCount } from '@/api/http'
import { useAuth } from '@/hooks/use-auth'
import { useStudentLevel } from '@/hooks/use-student-level'
import { levelLabel } from '@/lib/student-level'
import { cn } from '@/lib/utils'

const mainNav = [
  { to: '/dashboard', label: 'Home', end: true },
  { to: '/dashboard/subjects', label: 'Subjects' },
  { to: '/dashboard/resources', label: 'Resources' },
  { to: '/dashboard/practice', label: 'Practice' },
  { to: '/dashboard/mock-exam', label: 'Exams' },
  { to: '/dashboard/ai-tutor', label: 'AI Tutor' },
]

const moreNav = [
  { to: '/dashboard/progress', label: 'Progress', badge: 'New' },
  { to: '/dashboard/courses', label: 'Courses' },
  { to: '/dashboard/past-papers', label: 'Past Papers' },
  { to: '/dashboard/results', label: 'Results' },
  { to: '/dashboard/community', label: 'Community' },
  { to: '/dashboard/messages', label: 'Messages' },
  { to: '/dashboard/billing', label: 'Billing' },
  { to: '/dashboard/settings', label: 'Settings' },
]

export default function PortalHeader() {
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null)
  const [moreMenuPath, setMoreMenuPath] = useState<string | null>(null)
  const [profileMenuPath, setProfileMenuPath] = useState<string | null>(null)
  const location = useLocation()
  const routeKey = location.pathname
  const mobileOpen = mobileOpenPath === routeKey
  const showMoreMenu = moreMenuPath === routeKey
  const showProfileMenu = profileMenuPath === routeKey
  const { user } = useAuth()
  const studentLevel = useStudentLevel()

  const { data: unreadData } = useQuery({
    queryKey: ['notification-unread', user?.id],
    queryFn: fetchUnreadNotificationCount,
    enabled: !!user?.id,
    refetchInterval: 60_000,
  })
  const notificationCount = unreadData?.count ?? 0
  
  // Refs for dropdown containers
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    setProfileMenuPath(null)
    setMobileOpenPath(null)
    base44.auth.logout('/')
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // Close More menu if clicking outside
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setMoreMenuPath(null)
      }
      // Close Profile menu if clicking outside
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuPath(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpenPath(null)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative px-3 lg:px-4 py-2 rounded-sm text-sm font-semibold transition-all duration-200 whitespace-nowrap',
      isActive
        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
        : 'text-foreground hover:bg-primary/10 hover:text-primary'
    )

  const mobileNavClass = (path: string) =>
    cn(
      'block px-4 py-3 rounded-sm text-sm font-semibold transition-all duration-200',
      location.pathname === path
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-foreground hover:bg-muted'
    )

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 lg:gap-3 shrink-0 group"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-sm flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <GraduationCap className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-extrabold text-lg lg:text-xl text-foreground leading-tight">
                ExamPrep
              </span>
             
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNav.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                end={item.end} 
                className={navClass}
              >
                {item.label}
                {item.end && location.pathname === '/dashboard' && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-secondary rounded-sm" />
                )}
              </NavLink>
            ))}
            
            {/* More Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => {
                  setMoreMenuPath(showMoreMenu ? null : routeKey)
                  setProfileMenuPath(null)
                }}
                className={cn(
                  'px-3 lg:px-4 py-2 rounded-sm text-sm font-semibold transition-all duration-200',
                  showMoreMenu
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-foreground hover:bg-primary/10 hover:text-primary'
                )}
              >
                More ▾
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-sm shadow-xl border-2 border-primary/10 z-20 py-2 animate-slideDown">
                  {moreNav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreMenuPath(null)}
                      className={cn(
                        'flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors',
                        location.pathname === item.to
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-sm">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                  <div className="border-t border-border mt-2 pt-2">
                    <Link
                      to="/dashboard/help"
                      onClick={() => setMoreMenuPath(null)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Help Center</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-2 lg:gap-3 shrink-0">
            {/* Notifications */}
            <Link
              to="/dashboard/notifications"
              className="relative p-2 lg:p-2.5 rounded-sm transition-all duration-200 hover:bg-primary/10 group"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 text-white text-[10px] lg:text-xs font-bold rounded-sm flex items-center justify-center shadow-sm">
                  {notificationCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => {
                  setProfileMenuPath(showProfileMenu ? null : routeKey)
                  setMoreMenuPath(null)
                }}
                className={cn(
                  'flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-sm transition-all duration-200 border-2',
                  showProfileMenu
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-transparent hover:bg-muted hover:border-primary/20 text-foreground'
                )}
              >
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-sm bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs lg:text-sm font-bold">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div className="hidden xl:block text-left">
                  <span className="text-xs lg:text-sm font-bold text-foreground block leading-tight max-w-[80px] lg:max-w-[100px] truncate">
                    {user?.full_name?.split(' ')[0] ?? 'Student'}
                  </span>
                  <span className="text-[10px] lg:text-xs text-primary font-medium">{levelLabel(studentLevel)} Student</span>
                </div>
                <span className="text-[10px] lg:text-xs ml-0.5 lg:ml-1">▾</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 lg:w-56 bg-white rounded-sm shadow-xl border-2 border-primary/10 z-20 py-2 animate-slideDown">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs lg:text-sm font-bold text-foreground">
                      {user?.full_name || 'Student Name'}
                    </p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground truncate">
                      {user?.email || 'student@example.com'}
                    </p>
                  </div>

                  {/* Profile Links */}
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setProfileMenuPath(null)}
                    className="flex items-center gap-3 px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <User className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setProfileMenuPath(null)}
                    className="flex items-center gap-3 px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    to="/dashboard/help"
                    onClick={() => setProfileMenuPath(null)}
                    className="flex items-center gap-3 px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
                    <span>Help Center</span>
                  </Link>

                  {/* Logout */}
                  <div className="border-t border-border mt-2 pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-sm hover:bg-primary/10 transition-colors"
            onClick={() => setMobileOpenPath(mobileOpen ? null : routeKey)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? 
              <X className="w-5 h-5 text-primary" /> : 
              <Menu className="w-5 h-5 text-foreground" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        'lg:hidden border-t-2 border-primary/10 bg-white overflow-hidden transition-all duration-300',
        mobileOpen ? 'max-h-[80vh] overflow-y-auto opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="px-4 py-4 space-y-1.5">
          {/* Main Navigation */}
          <p className="px-4 py-1 text-xs font-bold text-primary uppercase tracking-wider">
            Main Menu
          </p>
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpenPath(null)}
              className={mobileNavClass(item.to)}
            >
              {item.label}
            </Link>
          ))}

          {/* More Navigation */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="px-4 py-1 text-xs font-bold text-primary uppercase tracking-wider">
              More Options
            </p>
            {moreNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpenPath(null)}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-sm text-sm font-semibold',
                  location.pathname === item.to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Actions */}
          <div className="mt-4 pt-4 border-t-2 border-primary/10 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dashboard/notifications"
                onClick={() => setMobileOpenPath(null)}
                className="flex items-center justify-center gap-2 py-3 rounded-sm text-sm font-semibold border-2 border-primary/20 hover:bg-primary/10 text-foreground transition-all"
              >
                <Bell className="w-4 h-4" />
                Alerts
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">
                    {notificationCount}
                  </span>
                )}
              </Link>
              <Link
                to="/dashboard/profile"
                onClick={() => setMobileOpenPath(null)}
                className="flex items-center justify-center gap-2 py-3 rounded-sm text-sm font-semibold border-2 border-primary/20 hover:bg-primary/10 text-foreground transition-all"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-sm text-sm font-semibold text-red-600 hover:bg-red-50 border-2 border-red-200 transition-all"
            >
              <LogOut className="w-4 h-4" /> 
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
}