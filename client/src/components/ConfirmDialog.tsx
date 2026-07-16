'use client'
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './ui/Button'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmOptions & { resolve: (v: boolean) => void } | null>(null)

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ ...opts, resolve })
    })
  }

  const dialog = state ? (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => { state.resolve(false); setState(null) }}>
      <div className="absolute inset-0 bg-overlay animate-fade-in" />
      <div
        className="relative z-10 w-full max-w-sm mx-4 bg-surface rounded-2xl border border-border shadow-modal animate-slide-up p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-4">
          <AlertTriangle size={24} className="text-danger" />
        </div>
        <h3 className="text-lg font-bold text-text mb-1">{state.title}</h3>
        <p className="text-sm text-text-muted mb-6">{state.message}</p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => { state.resolve(false); setState(null) }}
            className="flex-1"
          >
            {state.cancelLabel || 'Annulla'}
          </Button>
          <Button
            variant={state.variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => { state.resolve(true); setState(null) }}
            className="flex-1"
          >
            {state.confirmLabel || 'Conferma'}
          </Button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, dialog }
}
