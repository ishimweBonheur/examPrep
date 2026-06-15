import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AboutSection from './AboutSection';
import Pricing from '@/pages/Pricing';

interface StatItem {
  label: string;
  value: string;
  sub: string;
}

export default function HeroSection() {
  const [counts, setCounts] = useState({ students: 0, questions: 0, subjects: 0, rating: 0 });

  useEffect(() => {
    const targets = { students: 1500, questions: 5000, subjects: 3, rating: 98 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounts({
        students: Math.floor((targets.students / steps) * step),
        questions: Math.floor((targets.questions / steps) * step),
        subjects: Math.min(Math.floor((targets.subjects / steps) * step), targets.subjects),
        rating: Math.min(Math.floor((targets.rating / steps) * step), targets.rating),
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  const features = [
    "AI-Powered Learning",
    "Personalized Practice", 
    "Instant Feedback",
    "Progress Tracking"
  ];

  const stats: StatItem[] = [
    { label: 'Active Students', value: `${counts.students}+`, sub: 'Learning Together' },
    { label: 'Practice Questions', value: `${counts.questions}+`, sub: 'Topic-based' },
    { label: 'Core Subjects', value: `${counts.subjects}`, sub: 'S3 Level' },
    { label: 'Satisfaction Rate', value: `${counts.rating}%`, sub: 'Student Approved' },
  ];

  const testimonials = [
    {
      name: "Jean Paul K.",
      role: "S3 Student",
      text: "This platform completely changed how I study. The AI tutor explains concepts better than any textbook!",
      rating: 5
    },
    {
      name: "Marie A.",
      role: "S3 Student", 
      text: "I improved my Biology score from 60% to 85% in just one month. The mock exams are incredibly helpful.",
      rating: 5
    },
    {
      name: "David M.",
      role: "S3 Student",
      text: "The personalized practice questions make me feel like the app knows exactly what I need to work on.",
      rating: 5
    }
  ];

  const trustedBy = [
    "Rwanda Education Board",
    "Top Schools in Kigali", 
    "National Exam Top Performers",
    "S3 Teachers Nationwide"
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-56 h-56 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute top-40 left-1/3 w-4 h-4 bg-primary/20 rounded-full" />
      <div className="absolute top-60 right-1/4 w-3 h-3 bg-secondary/30 rounded-full" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Hero Content */}
        <div className="pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="transition-all duration-1000 transform translate-y-0 opacity-100">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-sm px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-primary rounded-sm animate-pulse" />
                <span className="text-sm font-semibold uppercase tracking-wider">New: AI Tutor Available 24/7</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-none mb-6">
                Ace Your
                <br />
                <span className="text-primary">National Exams</span>
                <br />
                <span className="relative">
                  With Confidence
                  <div className="absolute bottom-2 left-0 w-full h-3 bg-primary/10 -z-10 rounded-sm" />
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                The smartest way for Rwandan S3 students to prepare for national exams in 
                <span className="font-semibold text-primary"> Biology</span>, 
                <span className="font-semibold text-secondary"> Chemistry</span>, and 
                <span className="font-semibold text-primary"> Entrepreneurship</span>.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-sm text-sm font-medium bg-background text-foreground border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                  >
                    {feature}
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 rounded-sm px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105"
                  >
                    Start Learning Free
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto rounded-sm px-8 py-6 text-base font-semibold border-2 border-border hover:border-primary/30 hover:text-primary transition-all hover:scale-105"
                  >
                    Watch Demo
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-sm bg-primary/20 border-2 border-background flex items-center justify-center text-primary text-xs font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span>Joined by <strong className="text-foreground">1,500+ students</strong></span>
              </div>
            </div>

            {/* Right Column - Interactive Dashboard Preview */}
            <div className="relative transition-all duration-1000 delay-300 transform translate-x-0 opacity-100">
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="bg-card rounded-sm shadow-2xl shadow-primary/10 border border-border overflow-hidden">
                  {/* Dashboard Header */}
                  <div className="bg-primary p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-sm bg-red-400" />
                        <div className="w-3 h-3 rounded-sm bg-yellow-400" />
                        <div className="w-3 h-3 rounded-sm bg-green-400" />
                      </div>
                      <span className="text-primary-foreground text-xs font-mono">Study Dashboard</span>
                    </div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="p-6">
                    {/* Progress Overview */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-foreground">Today's Progress</h3>
                        <span className="text-primary font-bold text-sm">75%</span>
                      </div>
                      <div className="w-full bg-muted rounded-sm h-2 overflow-hidden">
                        <div className="bg-primary h-full rounded-sm transition-all duration-1000" 
                             style={{ width: '75%' }} />
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-primary/5 rounded-sm p-3 border border-primary/10">
                        <div className="text-2xl font-black text-primary">12</div>
                        <div className="text-xs text-muted-foreground">Questions Today</div>
                      </div>
                      <div className="bg-secondary/5 rounded-sm p-3 border border-secondary/10">
                        <div className="text-2xl font-black text-secondary">3</div>
                        <div className="text-xs text-muted-foreground">Mock Exams</div>
                      </div>
                      <div className="bg-green-50 rounded-sm p-3 border border-green-100">
                        <div className="text-2xl font-black text-green-600">85%</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                      <div className="bg-yellow-50 rounded-sm p-3 border border-yellow-100">
                        <div className="text-2xl font-black text-yellow-600">45m</div>
                        <div className="text-xs text-muted-foreground">Study Time</div>
                      </div>
                    </div>

                    {/* Subject Cards */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-muted rounded-sm p-3 cursor-pointer hover:bg-primary/5 transition-colors">
                        <div>
                          <div className="font-semibold text-foreground text-sm">Biology</div>
                          <div className="text-xs text-muted-foreground">Cell Structure & Function</div>
                        </div>
                        <span className="text-green-600 font-bold text-sm">90%</span>
                      </div>
                      <div className="flex items-center justify-between bg-muted rounded-sm p-3 cursor-pointer hover:bg-secondary/5 transition-colors">
                        <div>
                          <div className="font-semibold text-foreground text-sm">Chemistry</div>
                          <div className="text-xs text-muted-foreground">Acids & Bases</div>
                        </div>
                        <span className="text-yellow-600 font-bold text-sm">65%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-card rounded-sm shadow-xl p-3 border border-border" style={{ animation: 'float 3s ease-in-out infinite' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-sm animate-pulse" />
                    <span className="font-bold text-sm text-foreground">AI Tutor Online</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-primary rounded-sm shadow-xl p-3 text-primary-foreground">
                  <div className="text-lg font-black">National Exam Ready</div>
                  <div className="text-xs opacity-90">Biology • Chemistry • Entrepreneurship</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="py-12 border-t border-border">
          <p className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-wider font-semibold">Aligned with</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {trustedBy.map((item, index) => (
              <div key={index} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="py-12 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((item, index) => (
              <div 
                key={index}
                className="text-center p-4 rounded-sm bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl md:text-4xl font-black text-primary mb-2">
                  {item.value}
                </div>
                <div className="font-bold text-foreground text-sm mb-1">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-12 border-t border-border">
          <h2 className="text-3xl font-black text-center text-foreground mb-8">
            What Students Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-card rounded-sm border border-border p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold text-foreground text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="py-16 text-center">
          <div className="bg-primary rounded-sm p-8 md:p-12 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Excel in Your Exams?
            </h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Join thousands of S3 students who are already improving their grades with our AI-powered platform.
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-background text-primary hover:bg-muted rounded-sm px-12 py-6 text-base font-bold shadow-lg transition-all hover:scale-105"
              >
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>

        {/* Existing Components */}
        <AboutSection />
        <Pricing />
      </div>

      {/* Keyframe animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </section>
  );
}