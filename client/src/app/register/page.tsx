'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Particles from '@/components/Particles'
import { Eye, EyeOff, TrendingUp, Target, PiggyBank, Check } from 'lucide-react'

const features = [
  { icon: TrendingUp, title: 'Traccia le spese', desc: 'Registra entrate e uscite in un colpo solo' },
  { icon: Target, title: 'Crea obiettivi', desc: 'Risparmia per ciò che conta davvero' },
  { icon: PiggyBank, title: 'Budget intelligente', desc: 'Controlla le tue abitudini di spesa' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pwStrength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 12 ? 2
    : 3

  const strengthLabel = ['', 'Debole', 'Media', 'Forte']
  const strengthColor = ['', 'bg-danger', 'bg-warning', 'bg-success']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) { setError('Compila tutti i campi'); return }
    if (password.length < 8) { setError('La password deve avere almeno 8 caratteri'); return }
    setLoading(true)
    try {
      await register(email, name, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex relative overflow-hidden">
      <Particles />

      <div className="relative z-10 w-full flex flex-col lg:flex-row-reverse">
        {/* Right — Form */}
        <div className="flex-1 flex flex-col min-h-dvh">
          <div className="flex items-center justify-between px-6 py-5">
            <Logo size="md" />
            <ThemeToggle />
          </div>

          <div className="flex-1 flex items-center justify-center px-6 pb-16">
            <motion.div
              className="w-full max-w-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-8">
                <h1 className="text-[28px] font-extrabold text-text tracking-tight mb-2">
                  Crea il tuo conto
                </h1>
                <p className="text-sm text-text-muted leading-relaxed">
                  Inizia a gestire i tuoi risparmi in modo intelligente.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/15 text-sm text-danger font-medium"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <Input
                  label="Nome"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Il tuo nome"
                  autoComplete="name"
                />

                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome@esempio.it"
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimo 8 caratteri"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 bottom-2.5 text-text-muted hover:text-text transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {password.length > 0 && (
                  <motion.div
                    className="space-y-1.5"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(level => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            pwStrength >= level ? strengthColor[pwStrength] : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-[11px] text-text-dim">
                      {strengthLabel[pwStrength]}
                      {pwStrength < 3 && ' — usa almeno 12 caratteri per una password più sicura'}
                    </div>
                  </motion.div>
                )}

                <ul className="space-y-1.5">
                  {[
                    { label: 'Almeno 8 caratteri', ok: password.length >= 8 },
                    { label: 'Massimo 128 caratteri', ok: password.length <= 128 && password.length > 0 },
                  ].map((r, i) => (
                    <li key={i} className={`flex items-center gap-2 text-xs ${r.ok ? 'text-success' : 'text-text-dim'}`}>
                      <Check size={12} className={r.ok ? 'text-success' : 'text-text-dim'} />
                      {r.label}
                    </li>
                  ))}
                </ul>

                <Button type="submit" loading={loading} className="w-full h-12 rounded-xl text-base" size="lg">
                  Crea conto
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-text-muted text-center">
                  Hai già un conto?{' '}
                  <Link href="/login" className="text-brand-500 font-semibold hover:underline">
                    Accedi
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Left — Feature cards (hidden on mobile) */}
        <div className="hidden lg:flex w-[380px] xl:w-[440px] bg-surface border-r border-border p-8 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="text-lg font-bold text-text mb-6">Perché Salvify?</h3>
            <div className="space-y-5">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  className="flex gap-4 p-4 rounded-2xl bg-surface-hover border border-border"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                    <f.icon size={18} className="text-brand-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text">{f.title}</div>
                    <div className="text-xs text-text-muted mt-0.5">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10">
              <p className="text-xs text-text-muted leading-relaxed">
                &ldquo;L&apos;app più semplice per tenere traccia delle mie finanze. Finalmente
                riesco a risparmiare ogni mese.&rdquo;
              </p>
              <div className="text-xs font-semibold text-text mt-2">— Marco, utente Salvify</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
