import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Microscope, FlaskConical, Lightbulb, ArrowRight, BookOpen, Users, Star, ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Subject {
  name: string;
  icon: LucideIcon;
  color: string;
  lightBg: string;
  textColor: string;
  borderColor: string;
  topics: number;
  questions: string;
  description: string;
  image: string;
  studentsEnrolled: string;
  averageRating: number;
}

const subjects: Subject[] = [
  {
    name: 'Biology',
    icon: Microscope,
    color: 'bg-green-500',
    lightBg: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    topics: 12,
    questions: '1,800+',
    description: 'Cell biology, genetics, ecology, human body systems, evolution and more.',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=250&fit=crop',
    studentsEnrolled: '850+',
    averageRating: 4.8
  },
  {
    name: 'Chemistry',
    icon: FlaskConical,
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    topics: 10,
    questions: '1,500+',
    description: 'Atomic structure, chemical bonding, organic chemistry, reactions and more.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop',
    studentsEnrolled: '720+',
    averageRating: 4.7
  },
  {
    name: 'Entrepreneurship',
    icon: Lightbulb,
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    topics: 8,
    questions: '1,200+',
    description: 'Business planning, marketing, finance, innovation and management.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=250&fit=crop',
    studentsEnrolled: '650+',
    averageRating: 4.6
  }
];

export default function SubjectsSection() {
  const [activeSubject, setActiveSubject] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    return stars;
  };

  const getPopularityPercentage = (subjectName) => {
    if (subjectName === 'Biology') return '95%';
    if (subjectName === 'Chemistry') return '88%';
    return '82%';
  };

  const currentSubject = subjects[activeSubject];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header with CSS animation instead of state */}
        <div className="text-center mb-14 animate-fadeInUp">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">S3 Subjects</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-foreground">
            Our Popular Subjects
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Start preparing for your national exams with comprehensive question banks across all three S3 subjects.
          </p>
        </div>

        {/* Interactive Category Pills with CSS animation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          {subjects.map((subject, index) => (
            <button
              key={index}
              onClick={() => setActiveSubject(index)}
              className={`rounded-sm p-5 flex items-center gap-4 transition-all duration-300 transform hover:scale-105
                ${activeSubject === index 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                  : 'bg-card text-foreground border border-border hover:border-primary/30 hover:shadow-md'
                }`}
            >
              <div className={`w-12 h-12 rounded-sm flex items-center justify-center transition-all duration-300
                ${activeSubject === index ? 'bg-primary-foreground/20' : subject.lightBg}`}>
                <subject.icon className={`w-6 h-6 ${activeSubject === index ? 'text-primary-foreground' : subject.textColor}`} />
              </div>
              <div className="text-left">
                <p className="font-heading font-bold">{subject.name}</p>
                <p className={`text-xs ${activeSubject === index ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {subject.questions} Questions
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Featured Subject Showcase with CSS animation */}
        <div className="mb-12 animate-scaleIn" key={activeSubject}>
          <div className="bg-card rounded-sm border border-border overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative overflow-hidden">
                <img 
                  src={currentSubject.image} 
                  alt={currentSubject.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className={`${currentSubject.color} text-white text-xs font-bold px-3 py-1 rounded-sm`}>
                    S3 Level
                  </span>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <currentSubject.icon className={`w-6 h-6 ${currentSubject.textColor}`} />
                  <h3 className="font-heading font-bold text-2xl text-foreground">{currentSubject.name}</h3>
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {currentSubject.description}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{currentSubject.topics} Topics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{currentSubject.studentsEnrolled} Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{currentSubject.questions} Questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(currentSubject.averageRating)}
                    <span className="text-sm text-muted-foreground ml-1">({currentSubject.averageRating})</span>
                  </div>
                </div>
                <Link to={`/register`}>
                  <Button className="bg-primary hover:bg-primary/90 rounded-sm w-fit shadow-lg shadow-primary/25 transition-all hover:scale-105">
                    Start Learning {currentSubject.name} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Cards Grid with CSS animation */}
        <div className="grid md:grid-cols-3 gap-8 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          {subjects.map((subject, index) => (
            <div 
              key={index} 
              className={`bg-card rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border group cursor-pointer
                ${hoveredCard === index ? 'scale-105' : ''}
                ${activeSubject === index ? 'ring-2 ring-primary' : ''}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setActiveSubject(index)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={subject.image} 
                  alt={subject.name} 
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className={`absolute top-4 left-4 ${subject.color} text-white text-xs font-bold px-3 py-1 rounded-sm`}>
                  S3 Level
                </div>
                {hoveredCard === index && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button className="bg-white text-foreground hover:bg-gray-100 rounded-sm shadow-lg">
                      Preview <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <subject.icon className={`w-5 h-5 ${subject.textColor}`} />
                  <h3 className="font-heading font-bold text-lg text-foreground">{subject.name}</h3>
                </div>
                
                {/* Star Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(subject.averageRating)}
                  <span className="text-xs text-muted-foreground ml-1">({subject.averageRating})</span>
                </div>
                
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{subject.description}</p>
                
                {/* Progress Bar */}
                <div className="mt-4 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Popularity</span>
                    <span className="text-xs text-primary font-semibold">
                      {getPopularityPercentage(subject.name)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-sm h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-sm transition-all duration-1000 ${subject.color}`}
                      style={{ width: getPopularityPercentage(subject.name) }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {subject.topics} Topics
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {subject.studentsEnrolled}
                    </span>
                  </div>
                  <span className="text-primary font-bold text-sm">FREE</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action with CSS animation */}
        <div className="text-center mt-12 animate-fadeInUp" style={{ animationDelay: '600ms' }}>
          <div className="inline-flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              Not sure where to start? Try all subjects for free!
            </p>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90 rounded-sm px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105">
                Start Learning Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

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
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }
      `}</style>
    </section>
  );
}