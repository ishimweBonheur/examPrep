import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectContextValue {
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: (o: boolean) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

export function Select({ value, onValueChange, children }: { value?: string; onValueChange?: (v: string) => void; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <SelectContext.Provider value={{ value: value ?? '', onValueChange: onValueChange ?? (() => {}), open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children, id }: { className?: string; children: ReactNode; id?: string }) {
  const ctx = useContext(SelectContext)!
  return (
    <button
      type="button"
      id={id}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(SelectContext)!
  return <span className={cn(!ctx.value && 'text-muted-foreground')}>{ctx.value || placeholder}</span>
}

export function SelectContent({ className, children }: { className?: string; children: ReactNode }) {
  const ctx = useContext(SelectContext)!
  if (!ctx.open) return null
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => ctx.setOpen(false)} />
      <div className={cn('absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-md', className)}>
        {children}
      </div>
    </>
  )
}

export function SelectItem({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(SelectContext)!
  return (
    <button
      type="button"
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none hover:bg-muted',
        ctx.value === value && 'bg-muted font-medium',
        className
      )}
      onClick={() => {
        ctx.onValueChange(value)
        ctx.setOpen(false)
      }}
    >
      {children}
    </button>
  )
}
