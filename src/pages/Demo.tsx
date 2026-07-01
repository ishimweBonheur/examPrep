import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, BookOpen, Brain, Users, FileText, CreditCard, ArrowRight } from 'lucide-react'

const FEATURES = [
  { icon: BookOpen, title: 'Subjects & Practice', desc: 'Browse subjects, topics, and practice questions tailored to your class level.' },
  { icon: FileText, title: 'Past Papers & Resources', desc: 'Download notes, assignments, exams, and past papers organized by level.' },
  { icon: Brain, title: 'AI Tutor', desc: 'Get instant help with difficult topics from your AI study assistant.' },
  { icon: Users, title: 'Community', desc: 'Discuss questions and share tips with students in your class level.' },
  { icon: CreditCard, title: 'Billing', desc: 'Subscribe to unlock full access to all platform features.' },
]

export default function Demo() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl">Watch Demo</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn how to use UMUZI — from registration and class selection to practice, mock exams, resources, and billing.
          </p>
        </div>

        <Card className="overflow-hidden border-2 border-primary/10">
          <div className="aspect-video bg-black">
            <video
              className="w-full h-full"
              controls
              controlsList="nodownload"
              preload="metadata"
            >
              <source src="/demo_video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Play className="w-4 h-4" /> Full controls: play, pause, seek, volume, fullscreen
            </div>
            <Button>
              <Link to="/register" className="inline-flex items-center">Get started <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="font-heading font-bold text-xl mb-4">What you'll learn</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" /> {title}
                  </CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
  )
}
