'use client'
import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm animate-fade-in" />
      <div
        className="relative z-10 w-full max-w-md mx-4 bg-surface rounded-2xl border border-border shadow-modal animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-lg font-bold text-text">{title}</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-surface-hover">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 pb-5">
          {children}
        </div>
      </div>
    </div>
  )
}

export function ModalContent({ children }: { children: ReactNode }) {
  return <div className="space-y-3.5">{children}</div>
}
