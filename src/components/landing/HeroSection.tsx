import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, BookOpen, ArrowRight } from 'lucide-react';

interface StatItem {
  icon: string;
  label: string;
  sub: string;
}

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-56 h-56 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute top-40 left-1/3 w-4 h-4 bg-primary/20 rounded-full" />
      <div className="absolute top-60 right-1/4 w-3 h-3 bg-secondary/30 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-0.5 bg-primary rounded-full" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">AI-Powered Learning</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
            Ace Your
            <span className="text-primary"> National Exams</span>
            <br />
            With Confidence
          </h1>

          <p className="text-muted-foreground text-lg mt-6 max-w-lg leading-relaxed">
            The smartest way for Rwandan S3 students to prepare for national exams in Biology, Chemistry & Entrepreneurship.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-secondary" /> AI Tutor
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-secondary" /> Mock Exams
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-secondary" /> Progress Tracking
            </span>
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 font-semibold shadow-lg shadow-primary/25">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/subjects">
              <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold">
                Our Subjects →
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=500&fit=crop"
              alt="Students studying"
              className="rounded-3xl shadow-2xl object-cover w-full h-[480px]"
            />
            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-heading font-bold text-xl text-foreground">1,500+</p>
                <p className="text-xs text-muted-foreground">Active Students</p>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="font-heading font-bold text-xl text-foreground">5,000+</p>
                <p className="text-xs text-muted-foreground">Practice Questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-y border-border py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {([
            { icon: '📚', label: '3 Subjects', sub: 'S3 Level' },
            { icon: '🎯', label: 'Practice Mode', sub: 'Topic-based' },
            { icon: '🤖', label: 'AI Tutor', sub: '24/7 Available' },
            { icon: '👥', label: 'Community', sub: 'Learn Together' },
          ] as StatItem[]).map((item: StatItem, i: number) => (
            <div key={i} className="flex items-center gap-3 justify-center">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-heading font-bold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}