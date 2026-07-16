'use client'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Particles from '@/components/Particles'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.push('/dashboard')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      <Particles />

      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-semibold text-text hover:text-brand-500 transition-colors"
          >
            Accedi
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-all"
          >
            Inizia gratis
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-semibold mb-6">
              <Sparkles size={12} />
              Il tuo conto personale
            </div>
          </motion.div>

          <motion.h1
            className="text-[40px] md:text-[56px] font-extrabold text-text tracking-tight leading-[1.1] mb-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Gestisci i tuoi risparmi<br />
            <span className="text-brand-500">in modo intelligente</span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-text-muted leading-relaxed mb-8 max-w-md mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Tieni traccia delle tue entrate e uscite, crea obiettivi di risparmio
            e gestisci il tuo budget con un&apos;app pensata per te.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 text-white font-bold text-base hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
            >
              Crea il tuo conto
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-surface border border-border text-text font-semibold text-base hover:bg-surface-hover transition-all"
            >
              Ho già un conto
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-4 mt-14 max-w-sm mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              { label: 'Entrate & Uscite', desc: 'Traccia tutto' },
              { label: 'Obiettivi', desc: 'Risparmia meglio' },
              { label: 'Budget', desc: 'Controlla le spese' },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="text-[10px] font-semibold text-text tracking-wide mb-0.5">{f.label}</div>
                <div className="text-[10px] text-text-dim">{f.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
