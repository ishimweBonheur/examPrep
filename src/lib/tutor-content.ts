import type { StudentLevel } from '@/types'
import { levelLabel } from '@/lib/student-level'

export function getWelcomeMessage(level: StudentLevel, subjectNames: string[]): string {
  const label = levelLabel(level)
  const subjects =
    subjectNames.length > 0
      ? subjectNames.join(', ')
      : 'your enrolled subjects'

  return `Hello! I'm your AI Tutor for **${label}**. I help with **${subjects}** using the Rwandan national curriculum at your class level. Ask me to explain a topic, walk through a problem, or quiz you!`
}

const PROMPTS_BY_LEVEL: Record<StudentLevel, string[]> = {
  S1: [
    'Explain the water cycle in simple terms',
    'What are the main parts of a plant cell?',
    'Help me understand fractions step by step',
    'Give me a short quiz on what I learned this week',
  ],
  S2: [
    'Explain chemical reactions with everyday examples',
    'How does the digestive system work?',
    'Help me solve a linear equation',
    'Quiz me on my science topics',
  ],
  S3: [
    'Explain photosynthesis for my national exam',
    'Help me with chemical bonding and equations',
    'What is market research in Entrepreneurship?',
    'Quiz me on cell structure',
  ],
  S6: [
    'Explain advanced genetics for A-level',
    'Help me with organic chemistry mechanisms',
    'How do I structure a long-form exam essay?',
    'Give me a challenging practice question',
  ],
}

export function getSuggestedPrompts(level: StudentLevel, subjectNames: string[]): string[] {
  const base = PROMPTS_BY_LEVEL[level] ?? PROMPTS_BY_LEVEL.S3
  if (subjectNames.length === 0) return base

  const subjectPrompts = subjectNames.slice(0, 2).map(
    (name) => `Explain a key topic in ${name} for ${levelLabel(level)}`
  )

  return [...subjectPrompts, ...base].slice(0, 4)
}

export function getTutorSubtitle(level: StudentLevel, subjectNames: string[]): string {
  const label = levelLabel(level)
  if (subjectNames.length === 0) {
    return `Personal study assistant · ${label} curriculum`
  }
  return `${label} · ${subjectNames.join(' · ')}`
}
