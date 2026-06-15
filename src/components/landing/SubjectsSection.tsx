import React from 'react';
import { Link } from 'react-router-dom';
import { Microscope, FlaskConical, Lightbulb, ArrowRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Subject {
  name: string;
  icon: LucideIcon;
  color: string;
  lightBg: string;
  topics: number;
  questions: string;
  description: string;
  image: string;
}

const subjects: Subject[] = [
  {
    name: 'Biology',
    icon: Microscope,
    color: 'bg-green-500',
    lightBg: 'bg-green-50',
    topics: 12,
    questions: '1,800+',
    description: 'Cell biology, genetics, ecology, human body systems, evolution and more.',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=250&fit=crop'
  },
  {
    name: 'Chemistry',
    icon: FlaskConical,
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    topics: 10,
    questions: '1,500+',
    description: 'Atomic structure, chemical bonding, organic chemistry, reactions and more.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop'
  },
  {
    name: 'Entrepreneurship',
    icon: Lightbulb,
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    topics: 8,
    questions: '1,200+',
    description: 'Business planning, marketing, finance, innovation and management.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=250&fit=crop'
  },
];

export default function SubjectsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">S3 Subjects</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-foreground">
            Our Popular Subjects
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Start preparing for your national exams with comprehensive question banks across all three S3 subjects.
          </p>
        </div>

        {/* Category pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {subjects.map((s: Subject, i: number) => (
            <div key={i} className={`${i === 0 ? 'bg-primary text-white' : 'bg-white border border-border'} rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}>
              <div className={`w-12 h-12 ${i === 0 ? 'bg-white/20' : s.lightBg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${i === 0 ? 'text-white' : ''}`} style={i !== 0 ? { color: s.color.includes('green') ? '#22c55e' : s.color.includes('blue') ? '#3b82f6' : '#f59e0b' } : {}} />
              </div>
              <div>
                <p className={`font-heading font-bold ${i === 0 ? '' : 'text-foreground'}`}>{s.name}</p>
                <p className={`text-xs ${i === 0 ? 'text-white/70' : 'text-muted-foreground'}`}>{s.questions} Questions</p>
              </div>
            </div>
          ))}
        </div>

        {/* Subject cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {subjects.map((s: Subject, i: number) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border group">
              <div className="relative overflow-hidden">
                <img src={s.image} alt={s.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className={`absolute top-4 left-4 ${s.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  S3 Level
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="text-xs text-muted-foreground">(4.8)</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">{s.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.description}</p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>📖 {s.topics} Topics</span>
                    <span>👥 {s.questions} Q's</span>
                  </div>
                  <span className="text-secondary font-bold text-sm">FREE</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/register">
            <Button className="bg-primary hover:bg-primary/90 rounded-full px-8 shadow-lg shadow-primary/25">
              Start Learning <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}