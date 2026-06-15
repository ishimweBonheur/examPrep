import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GraduationCap, Menu, X, Phone, Mail, Clock } from 'lucide-react'
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
    'text-sm font-medium transition-colors',
    isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
  )

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <div className="bg-primary text-primary-foreground text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> +250 788 000 000
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <Mail className="w-3.5 h-3.5" /> info@examprep.rw
            </span>
            <span className="flex items-center gap-1.5 hidden md:flex">
              <Clock className="w-3.5 h-3.5" /> Mon - Sat: 7:00 - 18:00
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hover:underline">Login</Link>
            <span>/</span>
            <Link to="/register" className="hover:underline">Register</Link>
          </div>
        </div>
      </div>

      <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-extrabold text-xl text-foreground tracking-tight">
              ExamPrep<span className="text-primary">.rw</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full px-6">
                Get Started →
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMobile}
                className={({ isActive }) =>
                  cn('block text-sm font-medium py-2.5', isActive ? 'text-primary' : 'text-foreground')
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-3">
              <Link to="/login" className="flex-1" onClick={closeMobile}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/register" className="flex-1" onClick={closeMobile}>
                <Button className="w-full">Register</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
