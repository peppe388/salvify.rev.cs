'use client'
import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-5">
          <div className="max-w-sm text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-danger" />
            </div>
            <h2 className="text-lg font-bold text-text mb-2">Qualcosa è andato storto</h2>
            <p className="text-sm text-text-muted mb-6">
              Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all"
            >
              <RefreshCw size={16} />
              Ricarica
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
