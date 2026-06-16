import type { DocumentCategory } from '@/types'

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  past_paper: 'Past Paper',
  solutions: 'Solutions',
  study_notes: 'Study Notes',
  revision_guide: 'Revision Guide',
  syllabus: 'Course of Study',
}

export const DOCUMENT_CATEGORY_COLORS: Record<DocumentCategory, string> = {
  past_paper: 'bg-blue-100 text-blue-700 border-blue-200',
  solutions: 'bg-green-100 text-green-700 border-green-200',
  study_notes: 'bg-purple-100 text-purple-700 border-purple-200',
  revision_guide: 'bg-amber-100 text-amber-700 border-amber-200',
  syllabus: 'bg-teal-100 text-teal-700 border-teal-200',
}

export const PAST_PAPER_CATEGORIES: DocumentCategory[] = [
  'past_paper',
  'solutions',
  'study_notes',
  'revision_guide',
]

/** All document types students can browse (admin uploads) */
export const ALL_RESOURCE_CATEGORIES: DocumentCategory[] = [
  'past_paper',
  'study_notes',
  'solutions',
  'revision_guide',
  'syllabus',
]

export const RESOURCE_CATEGORY_SHORT: Record<DocumentCategory, string> = {
  past_paper: 'Past Papers',
  study_notes: 'Notes',
  solutions: 'Solutions',
  revision_guide: 'Revision',
  syllabus: 'Syllabi',
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
  { key: 'solutions', label: 'Solutions', description: 'Marking schemes and worked answers' },
  { key: 'revision_guide', label: 'Revision Guides', description: 'Exam prep and revision materials' },
  { key: 'syllabus', label: 'Syllabi', description: 'Official courses of study' },
]

export function categoryLabel(category: string): string {
  return DOCUMENT_CATEGORY_LABELS[category as DocumentCategory] ?? category
}

export function categoryColor(category: string): string {
  return DOCUMENT_CATEGORY_COLORS[category as DocumentCategory] ?? 'bg-muted text-muted-foreground'
}
