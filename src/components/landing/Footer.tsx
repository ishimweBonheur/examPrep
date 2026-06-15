import { Link } from 'react-router-dom'
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react'

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/features', label: 'Features' },
  { to: '/community', label: 'Community' },
  { to: '/pricing', label: 'Pricing' },
]

export default function Footer() {
  return (
    <footer className="bg-foreground text-white/80">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-extrabold text-xl text-white">ExamPrep.rw</span>
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              AI-powered platform helping Rwandan students prepare for national exams with confidence.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4">Quick Links</h4>
            <div className="space-y-2.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4">Subjects</h4>
            <div className="space-y-2.5">
              <Link to="/subjects" className="block text-sm hover:text-primary transition-colors">Biology (S3)</Link>
              <Link to="/subjects" className="block text-sm hover:text-primary transition-colors">Chemistry (S3)</Link>
              <Link to="/subjects" className="block text-sm hover:text-primary transition-colors">Entrepreneurship (S3)</Link>
              <p className="text-sm opacity-50">More coming soon...</p>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 shrink-0" /> Kigali, Rwanda</p>
              <p className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 shrink-0" /> +250 788 000 000</p>
              <p className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 shrink-0" /> info@examprep.rw</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <p className="text-center text-sm opacity-50">© 2025 ExamPrep.rw — All rights reserved.</p>
      </div>
    </footer>
  )
}
