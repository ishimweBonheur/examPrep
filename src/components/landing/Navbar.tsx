import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GraduationCap, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* Floating Navbar Container */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
        <nav className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 md:px-6 md:py-3.5">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
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

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.to} 
                  to={link.to} 
                  end={link.end} 
                  className={navLinkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" size="sm" className="rounded-lg">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-lg px-6 transition-all hover:scale-105 shadow-md hover:shadow-lg">
                  Get Started →
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
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
              <div className="mt-4 flex gap-2">
                <Link to="/login" className="flex-1" onClick={closeMobile}>
                  <Button variant="outline" className="w-full rounded-lg">Login</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={closeMobile}>
                  <Button className="w-full bg-primary hover:bg-primary/90 rounded-lg">Register</Button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>
      
      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-20 md:h-24" />
    </>
  )
}