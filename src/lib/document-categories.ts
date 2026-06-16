import type { DocumentCategory } from '@/types'

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  past_paper: 'Past Paper',
  solutions: 'Solutions',
  study_notes: 'Study Notes',
  revision_guide: 'Revision Guide',
  syllabus: 'Course of Study',
  notes: 'Notes',
  assignments: 'Assignments',
  exams: 'Exams',
  resources: 'Resources',
}

export const DOCUMENT_CATEGORY_COLORS: Record<DocumentCategory, string> = {
  past_paper: 'bg-blue-100 text-blue-700 border-blue-200',
  solutions: 'bg-green-100 text-green-700 border-green-200',
  study_notes: 'bg-purple-100 text-purple-700 border-purple-200',
  revision_guide: 'bg-amber-100 text-amber-700 border-amber-200',
  syllabus: 'bg-teal-100 text-teal-700 border-teal-200',
  notes: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  assignments: 'bg-orange-100 text-orange-700 border-orange-200',
  exams: 'bg-red-100 text-red-700 border-red-200',
  resources: 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

export const PAST_PAPER_CATEGORIES: DocumentCategory[] = [
  'past_paper',
  'solutions',
  'study_notes',
  'revision_guide',
]

export const ALL_RESOURCE_CATEGORIES: DocumentCategory[] = [
  'past_paper',
  'study_notes',
  'solutions',
  'revision_guide',
  'syllabus',
  'notes',
  'assignments',
  'exams',
  'resources',
]

export const RESOURCE_CATEGORY_SHORT: Record<DocumentCategory, string> = {
  past_paper: 'Past Papers',
  study_notes: 'Notes',
  solutions: 'Solutions',
  revision_guide: 'Revision',
  syllabus: 'Syllabi',
  notes: 'Notes',
  assignments: 'Assignments',
  exams: 'Exams',
  resources: 'Resources',
}

export interface ResourceCategoryMeta {
  key: DocumentCategory | 'all'
  label: string
  description: string
}

export const RESOURCE_TABS: ResourceCategoryMeta[] = [
  { key: 'all', label: 'All Resources', description: 'Everything uploaded for your class level' },
  { key: 'past_paper', label: 'Past Papers', description: 'National exam papers by year and subject' },
  { key: 'study_notes', label: 'Study Notes', description: 'Topic summaries and class notes' },
  { key: 'notes', label: 'Notes', description: 'Additional class notes and summaries' },
  { key: 'assignments', label: 'Assignments', description: 'Homework and assignment sheets' },
  { key: 'exams', label: 'Exams', description: 'Exam papers and tests' },
  { key: 'solutions', label: 'Solutions', description: 'Marking schemes and worked answers' },
  { key: 'revision_guide', label: 'Revision Guides', description: 'Exam prep and revision materials' },
  { key: 'resources', label: 'Resources', description: 'General study resources' },
  { key: 'syllabus', label: 'Syllabi', description: 'Official courses of study' },
]

export function categoryLabel(category: string): string {
  return DOCUMENT_CATEGORY_LABELS[category as DocumentCategory] ?? category
}

export function categoryColor(category: string): string {
  return DOCUMENT_CATEGORY_COLORS[category as DocumentCategory] ?? 'bg-muted text-muted-foreground'
}
