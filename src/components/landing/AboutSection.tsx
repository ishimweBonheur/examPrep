import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=450&fit=crop"
            alt="Students learning"
            className="rounded-3xl shadow-xl object-cover w-full h-[400px]"
          />
          <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-primary/10 rounded-3xl -z-10" />
          <div className="absolute top-6 -left-6 bg-secondary text-white rounded-2xl px-5 py-3 shadow-lg">
            <p className="font-heading font-bold text-2xl">7+</p>
            <p className="text-sm opacity-90">Years of Exams</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Get to Know About Us</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-foreground leading-tight">
            Prepare for National Exams and Ignite Your Future!
          </h2>

          <p className="text-muted-foreground mt-6 leading-relaxed">
            Our AI-powered platform is designed specifically for Rwandan secondary students. Practice with real national exam questions from 2018-2025, get instant AI tutoring, and track your progress toward exam success.
          </p>

          <div className="space-y-4 mt-8">
            {[
              'Access all national exam questions from 2018 to 2025',
              'AI-generated practice questions for unlimited revision',
              'Join a community of learners and get help from teachers',
            ].map((text: string, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>

          <Link to="/register">
            <Button className="mt-8 bg-primary hover:bg-primary/90 rounded-full px-8 shadow-lg shadow-primary/25">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}