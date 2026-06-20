/** Resolve API-relative upload paths to absolute URLs for img src */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http')) return url
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'
  const origin = apiBase.startsWith('http') ? new URL(apiBase).origin : window.location.origin
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`
}
