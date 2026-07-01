import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GraduationCap, Menu, X, User, Settings, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { base44 } from '@/api/client'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/features', label: 'Features' },
  { to: '/community', label: 'Community' },
  { to: '/pricing', label: 'Pricing' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-md',
    isActive
      ? 'text-primary bg-gray-100'
      : 'text-muted-foreground hover:text-primary hover:bg-gray-50'
  )

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, isLoadingAuth } = useAuth()

  const closeMobile = () => setMobileOpen(false)

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard'
  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    setProfileOpen(false)
    closeMobile()
    base44.auth.logout('/')
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const profileButton = (
    <button
      type="button"
      onClick={() => setProfileOpen((open) => !open)}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all border',
        profileOpen
          ? 'bg-primary/10 border-primary/30 text-primary'
          : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
        <span className="text-white text-sm font-bold">
          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
      <span className="hidden xl:block text-sm font-semibold text-foreground max-w-[100px] truncate">
        {user?.full_name?.split(' ')[0] ?? 'Account'}
      </span>
      <span className="text-xs text-muted-foreground">▾</span>
    </button>
  )

  const profileMenu = profileOpen && (
    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-foreground truncate">{user?.full_name || 'Student'}</p>
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>
      <Link
        to={dashboardPath}
        onClick={() => setProfileOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50"
      >
        <LayoutDashboard className="w-4 h-4 text-primary" />
        Dashboard
      </Link>
      {!isAdmin && (
        <>
          <Link
            to="/dashboard/settings"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 text-primary" />
            Settings
          </Link>
          <Link
            to="/dashboard/profile"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50"
          >
            <User className="w-4 h-4 text-primary" />
            My Profile
          </Link>
        </>
      )}
      <div className="border-t border-gray-100 mt-2 pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
        <nav className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 md:px-6 md:py-3.5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg text-foreground tracking-tight leading-tight">
                  UMUZI
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {!isLoadingAuth && isAuthenticated && user ? (
                <div className="relative" ref={profileRef}>
                  {profileButton}
                  {profileMenu}
                </div>
              ) : !isLoadingAuth ? (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="rounded-lg">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-lg px-6 transition-all hover:scale-105 shadow-md hover:shadow-lg">
                      Get Started
                    </Button>
                  </Link>
                </>
              ) : null}
            </div>

            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      cn(
                        'block px-4 py-3 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'text-primary bg-gray-100'
                          : 'text-muted-foreground hover:text-primary hover:bg-gray-50'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {!isLoadingAuth && isAuthenticated && user ? (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link to={dashboardPath} onClick={closeMobile} className="block">
                    <Button variant="outline" className="w-full rounded-lg gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : !isLoadingAuth ? (
                <div className="mt-4 flex gap-2">
                  <Link to="/login" className="flex-1" onClick={closeMobile}>
                    <Button variant="outline" className="w-full rounded-lg">Login</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={closeMobile}>
                    <Button className="w-full bg-primary hover:bg-primary/90 rounded-lg">Register</Button>
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </nav>
      </div>

      <div className="h-20 md:h-24" />
    </>
  )
}
