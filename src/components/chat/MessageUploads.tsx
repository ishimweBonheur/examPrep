import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchPrivateFile, type ChatUpload } from '@/api/messages'

function useObjectUrl(blob: Blob | null) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
  useEffect(() => {
    if (!url) return
    return () => URL.revokeObjectURL(url)
  }, [url])
  return url
}

function ImageUploadView({ blob, name }: { blob: Blob | null; name: string }) {
  const url = useObjectUrl(blob)
  return (
    <div className="rounded-xl overflow-hidden border border-border/60 bg-background/50">
      {url ? (
        <img src={url} alt={name} className="w-full max-h-64 object-contain" />
      ) : (
        <div className="h-32 flex items-center justify-center text-xs text-muted-foreground animate-pulse">Loading image…</div>
      )}
    </div>
  )
}

function AudioUploadView({ blob, name }: { blob: Blob | null; name: string }) {
  const url = useObjectUrl(blob)
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-2 min-w-[200px]">
      {url ? (
        <audio controls src={url} className="w-full h-9" />
      ) : (
        <div className="text-xs text-muted-foreground animate-pulse">Loading audio…</div>
      )}
      <div className="text-xs text-muted-foreground mt-1 truncate">{name}</div>
    </div>
  )
}

export function MessageUploads({ uploads }: { uploads: ChatUpload[] }) {
  const [blobs, setBlobs] = useState<Record<string, Blob>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const ensure = useCallback(async (u: ChatUpload) => {
    if (blobs[u.id] || loading[u.id]) return
    setLoading((p) => ({ ...p, [u.id]: true }))
    try {
      const res = await fetchPrivateFile(u.id)
      setBlobs((p) => ({ ...p, [u.id]: res.blob }))
    } finally {
      setLoading((p) => ({ ...p, [u.id]: false }))
    }
  }, [blobs, loading])

  useEffect(() => {
    uploads.forEach((u) => {
      if (u.mime_type.startsWith('image/') || u.mime_type.startsWith('audio/')) {
        ensure(u)
      }
    })
  }, [ensure, uploads])

  if (!uploads.length) return null

  return (
    <div className="mt-2 space-y-2">
      {uploads.map((u) => {
        const blob = blobs[u.id] ?? null
        if (u.mime_type.startsWith('image/')) {
          return <ImageUploadView key={u.id} blob={blob} name={u.original_name} />
        }
        if (u.mime_type.startsWith('audio/')) {
          return <AudioUploadView key={u.id} blob={blob} name={u.original_name} />
        }
        return null
      })}
    </div>
  )
}
