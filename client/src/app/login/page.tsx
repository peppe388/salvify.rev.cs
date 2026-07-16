'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Compila tutti i campi'); return }
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex items-center justify-between px-6 py-5">
        <Logo size="md" />
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-[28px] font-extrabold text-text tracking-tight mb-2">
              Bentornato
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Accedi per gestire i tuoi risparmi, <br />budget e obiettivi finanziari.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/15 text-sm text-danger font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
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
                  placeholder="Inserisci la password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 bottom-2.5 text-text-muted hover:text-text transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full h-12 rounded-xl text-base" size="lg">
              Accedi
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-text-muted">
              Non hai un conto?{' '}
              <Link href="/register" className="text-brand-500 font-semibold hover:underline">
                Registrati
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
