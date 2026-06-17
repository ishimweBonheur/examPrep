import { useMemo, useRef, useState, useEffect, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageUp, Mic, Pause, Play, Send, Square, Trash2 } from 'lucide-react'

async function optimizeImage(file: File) {
  const maxDim = 1600
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * ratio))
  const h = Math.max(1, Math.round(bitmap.height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, w, h)

  const toWebp = (quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))

  let quality = 0.82
  let blob = await toWebp(quality)
  while (blob && blob.size > 10 * 1024 * 1024 && quality > 0.5) {
    quality = Math.max(0.5, quality - 0.08)
    blob = await toWebp(quality)
  }

  if (!blob) return file
  const name = file.name.replace(/\.\w+$/, '') + '.webp'
  return new File([blob], name, { type: 'image/webp' })
}

async function audioDurationSeconds(blob: Blob) {
  const url = URL.createObjectURL(blob)
  try {
    const audio = document.createElement('audio')
    audio.src = url
    return await new Promise<number>((resolve) => {
      const done = () => resolve(Number.isFinite(audio.duration) ? audio.duration : 0)
      audio.addEventListener('loadedmetadata', done, { once: true })
      audio.addEventListener('error', () => resolve(0), { once: true })
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function formatDuration(sec: number) {
  const s = Math.round(sec)
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${mm}:${String(ss).padStart(2, '0')}`
}

function useObjectUrl(blob: Blob | null) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
  useEffect(() => {
    if (!url) return
    return () => URL.revokeObjectURL(url)
  }, [url])
  return url
}

function Waveform({ analyser, active }: { analyser: AnalyserNode | null; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!active || !analyser) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const data = new Uint8Array(analyser.fftSize)
    let raf = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(data)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(99,102,241,1)'
      ctx.beginPath()
      const slice = canvas.width / data.length
      let x = 0
      for (let i = 0; i < data.length; i++) {
        const v = data[i]! / 128.0
        const y = (v * canvas.height) / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        x += slice
      }
      ctx.stroke()
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [active, analyser])
  return <canvas ref={canvasRef} width={240} height={40} className="block" />
}

export interface ChatComposerProps {
  input: string
  onInputChange: (value: string) => void
  onSend: (payload: { content: string; files: File[]; onProgress?: (pct: number) => void }) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export function ChatComposer({
  input,
  onInputChange,
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}: ChatComposerProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadPct, setUploadPct] = useState(0)
  const [sending, setSending] = useState(false)
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null)
  const [voiceDuration, setVoiceDuration] = useState(0)
  const [recordState, setRecordState] = useState<'idle' | 'recording' | 'paused' | 'ready'>('idle')
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canSend = useMemo(
    () => (!!input.trim() || pendingFiles.length > 0 || voiceBlob) && !sending && !disabled,
    [disabled, input, pendingFiles.length, sending, voiceBlob]
  )

  const addImages = async (files: FileList | null) => {
    if (!files) return
    const chosen = Array.from(files).filter((f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024)
    const optimized = await Promise.all(chosen.map((f) => optimizeImage(f).catch(() => f)))
    setPendingFiles((prev) => [...prev, ...optimized])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const startRecording = async () => {
    if (recordState === 'recording' || recordState === 'paused') return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) throw new Error('Audio recording is not supported')
    const audioCtx = new AudioContextCtor()
    const source = audioCtx.createMediaStreamSource(stream)
    const a = audioCtx.createAnalyser()
    a.fftSize = 2048
    source.connect(a)
    setAnalyser(a)

    const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm']
    const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m))
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    mediaRecorderRef.current = recorder
    chunksRef.current = []
    recorder.ondataavailable = (evt) => {
      if (evt.data?.size) chunksRef.current.push(evt.data)
    }
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
      setVoiceBlob(blob)
      setVoiceDuration(await audioDurationSeconds(blob))
      setRecordState('ready')
      setAnalyser(null)
      audioCtx.close().catch(() => {})
      stream.getTracks().forEach((t) => t.stop())
    }
    recorder.start(250)
    setVoiceBlob(null)
    setVoiceDuration(0)
    setRecordState('recording')
  }

  const deleteVoice = () => {
    setVoiceBlob(null)
    setVoiceDuration(0)
    setRecordState('idle')
  }

  const send = async () => {
    if (!canSend) return
    const voiceFile =
      voiceBlob && voiceBlob.size <= 10 * 1024 * 1024 && voiceDuration <= 120
        ? new File([voiceBlob], `voice-note-${Date.now()}.webm`, { type: voiceBlob.type || 'audio/webm' })
        : null
    const files = [...pendingFiles, ...(voiceFile ? [voiceFile] : [])]

    setSending(true)
    setUploadPct(0)
    try {
      await onSend({ content: input.trim(), files, onProgress: setUploadPct })
      onInputChange('')
      setPendingFiles([])
      deleteVoice()
    } finally {
      setSending(false)
      setUploadPct(0)
    }
  }

  const voiceUrl = useObjectUrl(voiceBlob)

  return (
    <div className="border-t border-border/80 bg-background/95 backdrop-blur-sm p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addImages(e.target.files)}
      />

      {pendingFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {pendingFiles.map((f, idx) => (
            <div key={`${f.name}-${idx}`} className="text-xs rounded-full border border-border bg-muted/50 px-3 py-1 flex items-center gap-2">
              <span className="max-w-[160px] truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => setPendingFiles((p) => p.filter((_, i) => i !== idx))}
                className="text-muted-foreground hover:text-foreground"
                disabled={sending}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(recordState === 'recording' || recordState === 'paused') && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex items-center gap-3">
            <Waveform analyser={analyser} active />
            <div className="text-xs text-primary font-medium">Recording…</div>
          </div>
          <div className="flex items-center gap-2">
            {recordState === 'recording' ? (
              <Button onClick={() => { mediaRecorderRef.current?.pause(); setRecordState('paused') }} variant="secondary" size="sm" className="rounded-xl">
                <Pause className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={() => { mediaRecorderRef.current?.resume(); setRecordState('recording') }} variant="secondary" size="sm" className="rounded-xl">
                <Play className="w-4 h-4" />
              </Button>
            )}
            <Button onClick={() => mediaRecorderRef.current?.stop()} size="sm" className="rounded-xl bg-primary">
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {recordState === 'ready' && voiceBlob && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 px-3 py-2">
          <div className="flex-1 min-w-0">
            {voiceUrl && <audio controls src={voiceUrl} className="w-full h-9" />}
            <div className="text-xs text-muted-foreground mt-1">Voice note · {formatDuration(voiceDuration)}</div>
          </div>
          <Button onClick={deleteVoice} variant="secondary" size="sm" className="rounded-xl shrink-0" disabled={sending}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {sending && uploadPct > 0 && (
        <div className="mb-3">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadPct}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="icon" className="rounded-xl shrink-0 h-11 w-11" disabled={sending || disabled}>
          <ImageUp className="w-5 h-5" />
        </Button>
        <Button
          onClick={startRecording}
          variant="secondary"
          size="icon"
          className="rounded-xl shrink-0 h-11 w-11"
          disabled={sending || disabled || recordState === 'recording' || recordState === 'paused'}
        >
          <Mic className="w-5 h-5" />
        </Button>
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-xl min-h-11"
          disabled={sending || disabled}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              send()
            }
          }}
        />
        <Button onClick={send} disabled={!canSend} size="icon" className="bg-primary rounded-xl shrink-0 h-11 w-11 shadow-md shadow-primary/20">
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
