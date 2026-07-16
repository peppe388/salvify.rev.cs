import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-5">
      <div className="max-w-sm text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-surface border border-border flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl font-bold text-text-dim">404</span>
        </div>
        <h1 className="text-xl font-bold text-text mb-2">Pagina non trovata</h1>
        <p className="text-sm text-text-muted mb-6">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all"
        >
          Torna alla dashboard
        </Link>
      </div>
    </div>
  )
}
