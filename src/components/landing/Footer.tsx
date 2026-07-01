import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap, LocationEditIcon, MailIcon, PhoneIcon } from 'lucide-react'
import { fetchPublicStats } from '@/api/http'
import { useState } from 'react'

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/features', label: 'Features' },
  { to: '/community', label: 'Community' },
  { to: '/pricing', label: 'Pricing' },
]

export default function Footer() {
  const { data: stats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: fetchPublicStats,
    staleTime: 60_000,
  })

  const subjects = stats?.subjects ?? []
  const [activeSection, setActiveSection] = useState(null)

  return (
    <footer className="bg-foreground text-white/80 font-body">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-2 group">
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-90 transition-all duration-300">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white group-hover:text-primary/90 transition-colors">
                UMUZI
              </span>
            </Link>
            <p className="text-body-sm leading-relaxed opacity-70 max-w-sm hover:opacity-100 transition-opacity">
              AI-powered platform helping Rwandan students prepare for national exams with confidence. 
              Join thousands of students already learning smarter.
            </p>

          </div>

          {/* Quick Links */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveSection('links')}
            onMouseLeave={() => setActiveSection(null)}
          >
            <h4 className="font-heading font-semibold text-white mb-4 text-h6 relative inline-block">
              Quick Links
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${activeSection === 'links' ? 'w-full' : 'w-0'}`}></span>
            </h4>
            <div className="space-y-1">
              {quickLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="block text-body-sm py-1.5 px-2 -mx-2 rounded-lg hover:bg-white/5 hover:text-white transition-all duration-200 hover:translate-x-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Subjects - Interactive */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveSection('subjects')}
            onMouseLeave={() => setActiveSection(null)}
          >
            <h4 className="font-heading font-semibold text-white mb-4 text-h6 relative inline-block">
              Subjects
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${activeSection === 'subjects' ? 'w-full' : 'w-0'}`}></span>
            </h4>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {subjects.length === 0 ? (
                <div className="space-y-2 animate-pulse">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="h-4 bg-white/5 rounded w-3/4"></div>
                  ))}
                </div>
              ) : (
                subjects.map((s) => (
                  <Link 
                    key={s.id} 
                    to={`/subjects?subject=${s.id}`}
                    className="group flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg hover:bg-white/5 hover:text-white transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="text-body-sm">{s.name}</span>
         
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Contact & Bottom */}
<div className="mt-12 pt-8 border-t border-white/10">
  <div className="flex flex-wrap items-center justify-between gap-6">
    <div className="flex flex-wrap gap-6 text-body-sm">
      <span className="inline-flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-default">
        <LocationEditIcon className="w-4 h-4 shrink-0" /> Kigali, Rwanda
      </span>
      <a 
        href="tel:+250784963589" 
        className="inline-flex items-center gap-2 opacity-50 hover:text-primary hover:opacity-100 transition-all"
      >
        <PhoneIcon className="w-4 h-4 shrink-0" /> +250 7849 63 589
      </a>
      <a 
        href="mailto:ishimwebonheur078@gmail.com" 
        className="inline-flex items-center gap-2 opacity-50 hover:text-primary hover:opacity-100 transition-all"
      >
        <MailIcon className="w-4 h-4 shrink-0" /> ishimwebonheur078@gmail.com
      </a>
    </div>
  </div>
</div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-caption opacity-50">
            © 2026 UMUZI — Made for Rwandan students
          </p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </footer>
  )
}