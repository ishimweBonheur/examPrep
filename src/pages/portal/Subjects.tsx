import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Microscope, FlaskConical, Lightbulb, ArrowRight, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClassificationBanner from '@/components/portal/ClassificationBanner';
import { useStudentLevel } from '@/hooks/use-student-level';
import { levelLabel, matchesStudentLevel } from '@/lib/student-level';
import type { Subject, Topic } from '@/types';

interface ColorScheme {
  bg: string;
  text: string;
  border: string;
}

const iconMap: Record<string, LucideIcon> = {
  'Biology': Microscope,
  'Chemistry': FlaskConical,
  'Entrepreneurship': Lightbulb,
};

const colorMap: Record<string, ColorScheme> = {
  'Biology': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  'Chemistry': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  'Entrepreneurship': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
};

export default function Subjects() {
  const studentLevel = useStudentLevel();

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ['subjects', studentLevel],
    queryFn: async () => {
      const all = await base44.entities.Subject.list() as Subject[];
      return all.filter((s) => matchesStudentLevel(s.level, studentLevel));
    },
  });

  return (
    <div className="space-y-8">
      <ClassificationBanner level={studentLevel} />

      <div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground">Subjects</h1>
        <p className="text-muted-foreground mt-1">Browse topics for {levelLabel(studentLevel)} subjects.</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1,2,3].map((i: number) => (
            <Card key={i} className="animate-pulse border border-border">
              <CardContent className="p-6 h-64" />
            </Card>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="p-12 text-center text-muted-foreground">
            <p>Subjects will be added soon. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {subjects.map((subject: Subject) => {
            const Icon = iconMap[subject.name] || Microscope;
            const colors = colorMap[subject.name] || colorMap['Biology'];
            return (
              <Card key={subject.id} className={`border ${colors.border} hover:shadow-lg transition-all group`}>
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${colors.text}`} />
                  </div>
                  <Badge variant="outline" className="mb-3">{subject.level}</Badge>
                  <h3 className="font-heading font-bold text-xl text-foreground">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{subject.description}</p>
                  
                  {subject.topics && subject.topics.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topics</p>
                      {subject.topics.slice(0, 4).map((t: Topic, i: number) => (
                        <p key={i} className="text-sm text-foreground">• {t.name}</p>
                      ))}
                      {subject.topics.length > 4 && (
                        <p className="text-xs text-primary font-medium">+{subject.topics.length - 4} more topics</p>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{subject.progress ?? 0}%</span>
                    </div>
                    <Progress value={subject.progress ?? 0} />
                  </div>

                  <div className="flex gap-2 mt-5">
                    <Link to={`/dashboard/subjects/${subject.id}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-xl">View Topics</Button>
                    </Link>
                    <Link to={`/dashboard/practice?subject=${subject.id}`} className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90 rounded-xl gap-2">
                        Practice <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}