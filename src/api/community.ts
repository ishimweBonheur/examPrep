import { apiDelete, apiGet, apiPost } from '@/api/http'
import type { CommunityPost } from '@/types'

export interface CommunityListParams {
  level?: string
  subject_tag?: string
  search?: string
  order?: 'newest' | 'trending' | 'unanswered'
  page?: number
  limit?: number
  tag?: string
}

export interface CommunityListResponse {
  items: CommunityPost[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export function fetchCommunityPosts(params: CommunityListParams = {}) {
  const qs = new URLSearchParams()
  if (params.level) qs.set('level', params.level)
  if (params.subject_tag) qs.set('subject_tag', params.subject_tag)
  if (params.search) qs.set('search', params.search)
  if (params.order) qs.set('order', params.order)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.tag) qs.set('tag', params.tag)
  const q = qs.toString()
  return apiGet<CommunityListResponse>(`/community-posts${q ? `?${q}` : ''}`)
}

export function fetchCommunityPost(id: string) {
  return apiGet<CommunityPost>(`/community-posts/${id}`)
}

export function createCommunityPost(data: {
  title: string
  content: string
  subject_tag?: string
  tags?: string[]
  level?: string
  is_teacher_only?: boolean
}) {
  return apiPost<CommunityPost>('/community-posts', data)
}

export function addCommunityReply(postId: string, content: string, parentReplyId?: string) {
  return apiPost(`/community-posts/${postId}/replies`, {
    content,
    parent_reply_id: parentReplyId,
  })
}

export function voteCommunityPost(postId: string, voteType: 'up' | 'down') {
  return apiPost<CommunityPost>(`/community-posts/${postId}/vote`, { vote_type: voteType })
}

export function acceptCommunityReply(postId: string, replyId: string) {
  return apiPost<CommunityPost>(`/community-posts/${postId}/replies/${replyId}/accept`)
}

export function deleteCommunityPost(id: string) {
  return apiDelete(`/community-posts/${id}`)
}
