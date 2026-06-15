import { Link } from 'react-router-dom'
import { Users, MessageCircle, Trophy, BookOpen, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const highlights = [
  {
    icon: MessageCircle,
    title: 'Ask & Answer',
    desc: 'Post questions on any topic and get help from peers, teachers, and AI-assisted explanations.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Study Groups',
    desc: 'Join subject-focused groups to revise together, share notes, and stay motivated.',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    desc: 'Track your rank among classmates and celebrate milestones as you improve.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: BookOpen,
    title: 'Shared Resources',
    desc: 'Discover past papers, revision tips, and study guides contributed by the community.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
]

const benefits = [
  'Connect with thousands of Rwandan S3 students',
  'Get answers from teachers and top-performing peers',
  'Share study strategies for Biology, Chemistry & Entrepreneurship',
  'Stay accountable with group challenges and weekly goals',
]

export default function Community() {
  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Community Hub</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-foreground leading-tight">
            Learn Together, Succeed Together
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            ExamPrep.rw is more than practice questions — it is a community of learners helping each other
            prepare for national exams with confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 font-semibold shadow-lg shadow-primary/25">
                Join the Community <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-foreground">
              What You Can Do
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Our community hub gives every student a place to collaborate, ask questions, and grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="p-8 rounded-3xl border border-border hover:border-primary/20 bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-5`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-foreground leading-tight">
              Why Join Our Community?
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Studying alone is hard. Our community hub connects you with students across Rwanda who are
              preparing for the same national exams — so you never feel stuck on your own.
            </p>
            <div className="space-y-4 mt-8">
              {benefits.map((text) => (
                <div key={text} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-border shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <p className="font-heading font-bold text-4xl text-foreground">1,500+</p>
            <p className="text-muted-foreground mt-1">Active students in the community</p>
            <Link to="/register" className="block mt-8">
              <Button className="w-full bg-primary hover:bg-primary/90 rounded-full h-12 font-semibold">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
