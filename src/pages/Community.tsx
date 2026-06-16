import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageCircle, Trophy, BookOpen, ArrowRight, CheckCircle, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TestimonialsCarousel from '@/components/landing/TestimonialsCarousel';

const highlights = [
  {
    icon: MessageCircle,
    title: 'Ask & Answer',
    desc: 'Post questions on any topic and get help from peers, teachers, and AI-assisted explanations.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    borderColor: 'hover:border-blue-200',
    stats: '2,500+ Answers',
    detail: 'Our AI helps categorize and tag questions so you get the fastest, most relevant responses from the community.'
  },
  {
    icon: Users,
    title: 'Study Groups',
    desc: 'Join subject-focused groups to revise together, share notes, and stay motivated.',
    color: 'text-green-500',
    bg: 'bg-green-50',
    borderColor: 'hover:border-green-200',
    stats: '30+ Active Groups',
    detail: 'Connect with students studying the same subjects, create virtual study sessions, and tackle difficult topics together.'
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    desc: 'Track your rank among classmates and celebrate milestones as you improve.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    borderColor: 'hover:border-amber-200',
    stats: 'Weekly Rankings',
    detail: 'Earn points for helping others, completing practice sets, and maintaining study streaks. See how you compare!'
  },
  {
    icon: BookOpen,
    title: 'Shared Resources',
    desc: 'Discover past papers, revision tips, and study guides contributed by the community.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    borderColor: 'hover:border-purple-200',
    stats: '500+ Resources',
    detail: 'Access a growing library of verified study materials, from past exam papers to topic summaries created by top students.'
  },
];

const benefits = [
  {
    text: 'Connect with thousands of Rwandan S3 students',
    detail: 'Join a vibrant community of learners from across Rwanda'
  },
  {
    text: 'Get answers from teachers and top-performing peers',
    detail: 'Learn from those who have already excelled in national exams'
  },
  {
    text: 'Share study strategies for Biology, Chemistry & Entrepreneurship',
    detail: 'Discover proven techniques for each S3 subject'
  },
  {
    text: 'Stay accountable with group challenges and weekly goals',
    detail: 'Set targets and achieve them together with your study group'
  },
];

const stats = [
  { icon: Users, value: '1,500+', label: 'Active Students', color: 'text-blue-500' },
  { icon: MessageCircle, value: '2,500+', label: 'Questions Answered', color: 'text-green-500' },
  { icon: Star, value: '4.8/5', label: 'Student Rating', color: 'text-amber-500' },
  { icon: Clock, value: '24/7', label: 'Community Active', color: 'text-purple-500' },
];

export default function Community() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [expandedBenefit, setExpandedBenefit] = useState<number | null>(null);

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="animate-fadeInUp">
            <div className="flex items-center gap-2 justify-center mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Community Hub</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-foreground leading-tight">
              Learn Together, Succeed Together
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
              ExamPrep.rw is more than practice questions — it is a community of learners helping each other
              prepare for national exams with confidence.
            </p>
          </div>
          
          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-2 bg-white rounded-sm px-4 py-2 shadow-sm border border-border hover:shadow-md transition-all">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div className="text-left">
                  <div className="font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-sm px-8 font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105">
                Join the Community <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="rounded-sm px-8 font-semibold transition-all hover:scale-105">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14 animate-fadeInUp">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-foreground">
              What You Can Do
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Our community hub gives every student a place to collaborate, ask questions, and grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <div
                key={item.title}
                onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                className={`p-6 rounded-sm border transition-all duration-300 cursor-pointer bg-card
                  ${item.borderColor}
                  ${expandedCard === index 
                    ? 'ring-2 ring-primary shadow-xl scale-105' 
                    : 'border-border hover:shadow-lg hover:scale-105'
                  }
                  animate-fadeInUp`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${item.bg} rounded-sm flex items-center justify-center transition-transform duration-300
                    ${expandedCard === index ? 'scale-110 rotate-3' : ''}`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  {expandedCard === index && (
                    <div className="w-2 h-2 bg-primary rounded-sm animate-pulse" />
                  )}
                </div>
                
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
                
                {/* Stats Badge */}
                <div className={`inline-block px-3 py-1 rounded-sm text-xs font-semibold transition-all
                  ${expandedCard === index 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }`}>
                  {item.stats}
                </div>
                
                {/* Expanded Content */}
                <div className={`transition-all duration-300 overflow-hidden
                  ${expandedCard === index ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <div className={`p-3 rounded-sm ${item.bg} ${item.color} text-sm`}>
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className="animate-fadeInUp">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-foreground leading-tight">
              Why Join Our Community?
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Studying alone is hard. Our community hub connects you with students across Rwanda who are
              preparing for the same national exams — so you never feel stuck on your own.
            </p>
            <div className="space-y-3 mt-8">
              {benefits.map((benefit, index) => (
                <div key={index}>
                  <div 
                    className={`flex items-start gap-3 p-3 rounded-sm cursor-pointer transition-all duration-300
                      ${expandedBenefit === index 
                        ? 'bg-primary/5 border border-primary/20' 
                        : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    onClick={() => setExpandedBenefit(expandedBenefit === index ? null : index)}
                  >
                    <CheckCircle className={`w-5 h-5 mt-0.5 shrink-0 transition-colors
                      ${expandedBenefit === index ? 'text-primary' : 'text-secondary'}`} 
                    />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{benefit.text}</p>
                      <div className={`transition-all duration-300 overflow-hidden
                        ${expandedBenefit === index ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                        <p className="text-xs text-primary">{benefit.detail}</p>
                      </div>
                    </div>
                    <div className={`transform transition-transform duration-300
                      ${expandedBenefit === index ? 'rotate-180' : ''}`}>
                      ↓
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Stats Card */}
          <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <div className="bg-card rounded-sm border border-border shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-sm flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <p className="font-heading font-bold text-4xl text-foreground">1,500+</p>
                <p className="text-muted-foreground mt-1">Active students in the community</p>
              </div>

              {/* Testimonials Carousel */}
              <div className="mt-8 pt-6 border-t border-border">
                <TestimonialsCarousel compact autoPlay />
              </div>

              <Link to="/register" className="block mt-8">
                <Button className="w-full bg-primary hover:bg-primary/90 rounded-sm h-12 font-semibold transition-all hover:scale-105">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}