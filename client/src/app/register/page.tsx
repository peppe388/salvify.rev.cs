'use client'
import { useState, FormEvent } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, name, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#05050a' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#f1f5f9] to-[#a78bfa] bg-clip-text text-transparent">
            Salvify
          </h1>
          <p className="text-sm text-[rgba(255,255,255,0.3)] mt-2">Crea il tuo account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-[#ef4444] text-center bg-[rgba(239,68,68,0.1)] py-2 px-4 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1.5">Nome</label>
            <input
              type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Il tuo nome"
              className="w-full px-4 py-3 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1.5">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="la tua email"
              className="w-full px-4 py-3 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1.5">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white shadow-lg shadow-[rgba(124,58,237,0.3)] hover:shadow-xl hover:shadow-[rgba(124,58,237,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? 'Registrazione...' : 'Registrati'}
          </button>
        </form>

        <p className="text-center text-sm text-[rgba(255,255,255,0.3)] mt-6">
          Hai già un account? <Link href="/login" className="text-[#7c3aed] hover:text-[#a78bfa]">Accedi</Link>
        </p>
      </div>
    </div>
  )
}
