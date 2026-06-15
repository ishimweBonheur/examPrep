import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface InputOTPProps {
  maxLength: number
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  autoFocus?: boolean
  autoComplete?: string
}

export function InputOTP({ maxLength, value, onChange, children, autoFocus }: InputOTPProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  return (
    <div className="relative flex items-center gap-2">
      <div className="flex items-center gap-2" aria-hidden="true">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg border border-input bg-background text-lg font-semibold',
              value[i] && 'border-primary'
            )}
          >
            {value[i] ?? ''}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, maxLength))}
        className="absolute inset-0 opacity-0 cursor-text"
        aria-label="OTP code"
      />
      {children}
    </div>
  )
}

export function InputOTPGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('hidden', className)}>{children}</div>
}

export function InputOTPSlot({ index }: { index: number; className?: string }) {
  return <span data-index={index} className="hidden" />
}
