import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { questionToPractice, llmQuestionToPractice } from '@/lib/practice-utils'
import ClassificationBanner from '@/components/portal/ClassificationBanner'
import { useStudentLevel } from '@/hooks/use-student-level'
import { levelLabel, matchesStudentLevel } from '@/lib/student-level'
import type { PracticeAnswer, PracticeQuestion, Question, Subject } from '@/types'

export default function Practice() {
  const { user } = useAuth()
  const studentLevel = useStudentLevel()
  const queryClient = useQueryClient()
  const urlParams = new URLSearchParams(window.location.search)
  const preSelectedSubject = urlParams.get('subject') || ''

  const [selectedSubject, setSelectedSubject] = useState(preSelectedSubject)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<PracticeAnswer[]>([])
  const [finished, setFinished] = useState(false)
  const [generating, setGenerating] = useState(false)

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects', studentLevel],
    queryFn: async () => {
      const all = await base44.entities.Subject.list() as Subject[]
      return all.filter((s) => matchesStudentLevel(s.level, studentLevel))
    },
  })

  const { data: questionBank = [] } = useQuery<Question[]>({
    queryKey: ['questions', selectedSubject, selectedTopic, studentLevel],
    queryFn: async () => {
      const all = await base44.entities.Question.filter({
        ...(selectedSubject ? { subject_id: selectedSubject } : {}),
        ...(selectedTopic && selectedTopic !== 'all' ? { topic: selectedTopic } : {}),
        level: studentLevel,
      }) as Question[]
      return all
    },
    enabled: !!selectedSubject,
  })

  const currentSubject = subjects.find((s) => s.id === selectedSubject)
  const topics = currentSubject?.topics || []

  const generateQuestions = async () => {
    setGenerating(true)
    setFinished(false)
    setCurrentIdx(0)
    setAnswers([])
    setSelectedAnswer('')
    setShowResult(false)

    if (questionBank.length >= 5) {
      const shuffled = [...questionBank].sort(() => Math.random() - 0.5).slice(0, 10)
      setQuestions(shuffled.map(questionToPractice))
      setGenerating(false)
      return
    }

    const subjectName = currentSubject?.name || 'General'
    const topicName = selectedTopic && selectedTopic !== 'all' ? selectedTopic : 'various topics'
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5 multiple choice questions for Rwandan ${levelLabel(studentLevel)} students studying ${subjectName} on the topic of ${topicName}. Each question should have 4 options (A, B, C, D) with one correct answer and a brief explanation.`,
    }) as { questions?: Array<{ question_text: string; options: string[]; correct_answer: number; explanation?: string }> }

    const generated = (result.questions || []).map((q) =>
      llmQuestionToPractice({ ...q, options: q.options })
    )
    setQuestions(generated)
    setGenerating(false)
  }

  const handleAnswer = () => {
    const q = questions[currentIdx]
    const isCorrect = selectedAnswer === q.correct_answer
    setAnswers([...answers, { ...q, selected_answer: selectedAnswer, is_correct: isCorrect }])
    setShowResult(true)
  }

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true)
      void saveAttempt()
    } else {
      setCurrentIdx(currentIdx + 1)
      setSelectedAnswer('')
      setShowResult(false)
    }
  }

  const saveAttempt = async () => {
    const allAnswers = [...answers]
    if (!showResult && selectedAnswer) {
      const q = questions[currentIdx]
      allAnswers.push({ ...q, selected_answer: selectedAnswer, is_correct: selectedAnswer === q.correct_answer })
    }
    const correctCount = allAnswers.filter((a) => a.is_correct).length
    const score = Math.round((correctCount / allAnswers.length) * 100)
    await base44.entities.ExamAttempt.create({
      student_id: user?.id,
      subject_id: selectedSubject,
      type: 'practice',
      topic: selectedTopic || currentSubject?.name,
      score,
      total_questions: allAnswers.length,
      correct_count: correctCount,
      completed: true,
    })
    queryClient.invalidateQueries({ queryKey: ['exam-attempts'] })
  }

  const reset = () => {
    setQuestions([])
    setCurrentIdx(0)
    setAnswers([])
    setSelectedAnswer('')
    setShowResult(false)
    setFinished(false)
  }

  const correctCount = answers.filter((a) => a.is_correct).length
  const totalAnswered = answers.length

  if (finished) {
    const score = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border border-border overflow-hidden">
          <div className={`p-8 text-center ${score >= 70 ? 'bg-green-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50'}`}>
            <p className="text-6xl font-heading font-extrabold mb-2" style={{ color: score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444' }}>
              {score}%
            </p>
            <p className="text-lg font-medium text-foreground">{correctCount}/{questions.length} Correct</p>
          </div>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-heading font-bold">Review Answers</h3>
            {answers.map((a, i) => (
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
            <div className="flex gap-3">
              <Button onClick={reset} variant="outline" className="flex-1 rounded-xl gap-2"><RotateCcw className="w-4 h-4" /> Try Again</Button>
              <Button onClick={generateQuestions} className="flex-1 bg-primary rounded-xl gap-2">New Questions <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ClassificationBanner level={studentLevel} />

      <div>
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Practice Mode</h1>
        <p className="text-muted-foreground mt-1">Select a subject and topic for {levelLabel(studentLevel)} practice.</p>
      </div>

      {questions.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Subject</label>
                <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); setSelectedTopic('') }}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Topic (Optional)</label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger><SelectValue placeholder="All topics" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {topics.map((t, i) => <SelectItem key={i} value={t.name}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={generateQuestions} disabled={!selectedSubject || generating} className="w-full bg-primary rounded-xl h-12 gap-2">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <>Start Practice <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Question {currentIdx + 1} of {questions.length}</Badge>
              <span className="text-sm text-muted-foreground">{correctCount}/{totalAnswered} correct</span>
            </div>
            <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2 mt-3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium text-foreground text-lg leading-relaxed">{questions[currentIdx]?.question_text}</p>
            <div className="space-y-2.5">
              {(questions[currentIdx]?.options || []).map((opt, i) => (
                <button
                  key={i}
                  type="button"
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
                <p className="text-sm font-medium text-blue-800">Explanation</p>
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
  )
}
