import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DialogContextValue {
  open: boolean
  setOpen: (o: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

export function Dialog({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (o: boolean) => void; children: ReactNode }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  return <DialogContext.Provider value={{ open: isOpen, setOpen }}>{children}</DialogContext.Provider>
}

export function DialogTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  const ctx = useContext(DialogContext)!
  if (asChild && children && typeof children === 'object' && 'props' in (children as object)) {
    const child = children as React.ReactElement<{ onClick?: () => void }>
    return (
      <span onClick={() => ctx.setOpen(true)}>{child}</span>
    )
  }
  return (
    <button type="button" onClick={() => ctx.setOpen(true)}>
      {children}
    </button>
  )
}

export function DialogContent({ className, children }: { className?: string; children: ReactNode }) {
  const ctx = useContext(DialogContext)!
  if (!ctx.open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => ctx.setOpen(false)} />
      <div className={cn('relative z-50 w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-lg max-h-[90vh] overflow-y-auto', className)}>
        <button type="button" className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100" onClick={() => ctx.setOpen(false)}>
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)}>{children}</div>
}

export function DialogTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>{children}</h2>
}
