import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Loader2, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'
import ClassificationBanner from '@/components/portal/ClassificationBanner'
import { useStudentLevel } from '@/hooks/use-student-level'
import { levelLabel, matchesStudentLevel } from '@/lib/student-level'
import { questionToPractice } from '@/lib/practice-utils'
import type { Subject as ApiSubject, PracticeQuestion } from '@/types'

interface Answer extends PracticeQuestion {
  selected_answer: string;
  is_correct: boolean;
}

export default function MockExam() {
  const { user } = useAuth();
  const studentLevel = useStudentLevel();
  const queryClient = useQueryClient();

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finished, setFinished] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);

  const { data: subjects = [] } = useQuery<ApiSubject[]>({
    queryKey: ['subjects', studentLevel],
    queryFn: async () => {
      const all = await base44.entities.Subject.list();
      return all.filter((s) => matchesStudentLevel(s.level, studentLevel));
    },
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (started && !finished) {
      interval = setInterval(() => setTimer((t: number) => t + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [started, finished]);

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const generateMockExam = async (): Promise<void> => {
    setGenerating(true);
    const subjectName = subjects.find((s) => s.id === selectedSubject)?.name || 'General';

    const bank = await base44.entities.Question.filter({
      subject_id: selectedSubject,
      level: studentLevel,
    });

    if (bank.length >= 5) {
      const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, Math.min(15, bank.length));
      setQuestions(shuffled.map(questionToPractice));
      setGenerating(false);
      setStarted(true);
      return;
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a mock national exam for Rwandan ${levelLabel(studentLevel)} students in ${subjectName}. Create 15 multiple choice questions covering material appropriate for ${studentLevel} level. Include questions of varying difficulty (easy, medium, hard). Each question should have 4 options (A, B, C, D) with one correct answer and a brief explanation. Make them similar in style and difficulty to actual Rwandan national exams.`,
    }) as { questions?: Array<{ question_text: string; options: string[]; correct_answer: number; explanation?: string }> };

    const generated = (result.questions || []).slice(0, 15).map((q) =>
      questionToPractice({
        id: '',
        subject_id: selectedSubject,
        topic: '',
        year: new Date().getFullYear(),
        difficulty: 'medium',
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        level: studentLevel,
        created_date: '',
      })
    );

    setQuestions(generated);
    setGenerating(false);
    setStarted(true);
  };

  const handleAnswer = (): void => {
    const q = questions[currentIdx];
    const isCorrect = selectedAnswer === q.correct_answer;
    setAnswers([...answers, { ...q, selected_answer: selectedAnswer, is_correct: isCorrect }]);
    setShowResult(true);
  };

  const nextQuestion = (): void => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
      saveAttempt();
    } else {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer('');
      setShowResult(false);
    }
  };

  const saveAttempt = async (): Promise<void> => {
    const allAnswers = [...answers];
    const correctCount = allAnswers.filter((a: Answer) => a.is_correct).length;
    const score = Math.round((correctCount / allAnswers.length) * 100);
    await base44.entities.ExamAttempt.create({
      student_id: user?.id,
      subject_id: selectedSubject,
      type: 'mock_exam',
      score,
      total_questions: allAnswers.length,
      correct_count: correctCount,
      completed: true,
      time_spent_seconds: timer,
    });
    queryClient.invalidateQueries({ queryKey: ['exam-attempts'] });
  };

  const reset = (): void => {
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers([]);
    setSelectedAnswer('');
    setShowResult(false);
    setFinished(false);
    setTimer(0);
    setStarted(false);
  };

  if (finished) {
    const correctCount = answers.filter((a: Answer) => a.is_correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border border-border overflow-hidden">
          <div className={`p-8 text-center ${score >= 70 ? 'bg-green-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50'}`}>
            <p className="text-6xl font-heading font-extrabold mb-2" style={{ color: score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444' }}>
              {score}%
            </p>
            <p className="text-lg font-medium text-foreground">{correctCount}/{questions.length} Correct</p>
            <p className="text-sm text-muted-foreground mt-1">Time: {formatTime(timer)}</p>
          </div>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-heading font-bold">Review Answers</h3>
            {answers.map((a: Answer, i: number) => (
              <div key={i} className={`p-4 rounded-xl border ${a.is_correct ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <div className="flex items-start gap-2">
                  {a.is_correct ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />}
                  <div>
                    <p className="font-medium text-sm">{a.question_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">Your answer: {a.selected_answer} | Correct: {a.correct_answer}</p>
                    {a.explanation && <p className="text-xs text-muted-foreground mt-1 italic">{a.explanation}</p>}
                  </div>
                </div>
              </div>
            ))}
            <Button onClick={reset} className="w-full bg-primary rounded-xl h-12 gap-2"><RotateCcw className="w-4 h-4" /> Take Another Exam</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ClassificationBanner level={studentLevel} />

      <div>
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Mock Exam</h1>
        <p className="text-muted-foreground mt-1">Take a full mock national exam tailored for {levelLabel(studentLevel)}.</p>
      </div>

      {questions.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="p-8 space-y-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Ready for your mock exam?</h3>
              <p className="text-sm text-muted-foreground mt-2">This exam will contain 15 questions for {levelLabel(studentLevel)} material.</p>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="max-w-xs mx-auto"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={generateMockExam} 
              disabled={!selectedSubject || generating}
              className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 gap-2"
            >
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Exam...</> : <>Start Exam <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Question {currentIdx + 1} of {questions.length}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formatTime(timer)}
              </div>
            </div>
            <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2 mt-3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium text-foreground text-lg leading-relaxed">
              {questions[currentIdx]?.question_text}
            </p>
            <div className="space-y-2.5">
              {(questions[currentIdx]?.options || []).map((opt, i: number) => (
                <button
                  key={i}
                  onClick={() => !showResult && setSelectedAnswer(opt.label)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    showResult
                      ? opt.label === questions[currentIdx].correct_answer
                        ? 'border-green-500 bg-green-50'
                        : opt.label === selectedAnswer
                          ? 'border-red-500 bg-red-50'
                          : 'border-border'
                      : selectedAnswer === opt.label
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className="font-semibold mr-2">{opt.label}.</span>
                  {opt.text}
                </button>
              ))}
            </div>
            {showResult && questions[currentIdx]?.explanation && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm font-medium text-blue-800">💡 Explanation</p>
                <p className="text-sm text-blue-700 mt-1">{questions[currentIdx].explanation}</p>
              </div>
            )}
            <div className="flex gap-3">
              {!showResult ? (
                <Button onClick={handleAnswer} disabled={!selectedAnswer} className="w-full bg-primary rounded-xl h-12">Submit Answer</Button>
              ) : (
                <Button onClick={nextQuestion} className="w-full bg-primary rounded-xl h-12 gap-2">
                  {currentIdx + 1 >= questions.length ? 'See Results' : 'Next Question'} <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}