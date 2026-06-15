import type { PracticeQuestion, Question } from '@/types'

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const

export function questionToPractice(q: Question): PracticeQuestion {
  return {
    question_text: q.question_text,
    options: q.options.map((text, i) => ({
      label: OPTION_LABELS[i] ?? String(i + 1),
      text,
    })),
    correct_answer: OPTION_LABELS[q.correct_answer] ?? 'A',
    explanation: q.explanation,
    difficulty: q.difficulty,
  }
}

export function llmQuestionToPractice(q: {
  question_text: string
  options: { label: string; text: string }[] | string[]
  correct_answer: number | string
  explanation?: string
  difficulty?: string
}): PracticeQuestion {
  if (Array.isArray(q.options) && q.options.length > 0 && typeof q.options[0] === 'string') {
    return questionToPractice({
      id: '',
      subject_id: '',
      topic: '',
      year: new Date().getFullYear(),
      difficulty: 'medium',
      question_text: q.question_text,
      options: q.options as string[],
      correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer : 0,
      explanation: q.explanation,
      level: 'S3',
      created_date: '',
    })
  }

  const options = q.options as { label: string; text: string }[]
  const correct =
    typeof q.correct_answer === 'string'
      ? q.correct_answer
      : OPTION_LABELS[q.correct_answer] ?? 'A'

  return {
    question_text: q.question_text,
    options,
    correct_answer: correct,
    explanation: q.explanation,
    difficulty: q.difficulty,
  }
}
