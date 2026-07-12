'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Pocket } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import PocketCard from '@/components/PocketCard'

export default function CartePage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [pockets, setPockets] = useState<Pocket[]>([])
  const [hide, setHide] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [nome, setNome] = useState('')
  const [colore, setColore] = useState('purple')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    setHide(user.hideBalance)
    api.getPockets().then(setPockets).finally(() => setLoadingData(false))
  }, [user])

  const currency = user?.currency || '€'
  const total = pockets.reduce((s, p) => s + p.saldo, 0)
  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`

  async function handleAdd() {
    if (!nome.trim()) { alert('Inserisci un nome'); return }
    const pocket = await api.createPocket({ nome: nome.trim(), colore })
    setPockets(prev => [...prev, pocket])
    setNome('')
  }

  async function handleDelete(id: number) {
    if (!confirm('Eliminare questo pocket?')) return
    await api.deletePocket(id)
    setPockets(prev => prev.filter(p => p.id !== id))
  }

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050a]">
        <div className="w-10 h-10 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05050a] pb-[80px]">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h2 className="text-base font-bold text-[#f1f5f9] mb-1">I tuoi pocket</h2>
        <div className="text-xs text-[rgba(255,255,255,0.55)] mb-4">Totale pocket: {fmt(total)}</div>

        {pockets.length === 0 ? (
          <div className="text-center text-[rgba(255,255,255,0.3)] text-sm py-8">
            <div className="text-4xl opacity-30 mb-3">💳</div>
            Nessun pocket ancora.<br />Creane uno per organizzare le tue finanze!
          </div>
        ) : (
          pockets.map(p => (
            <PocketCard key={p.id} pocket={p} currency={currency} onDelete={handleDelete} hideAmount={hide} />
          ))
        )}

        <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-[18px] p-[18px] mt-4">
          <h3 className="text-sm font-semibold text-[#f1f5f9] mb-3">Nuovo pocket</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1">Nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Es. Viaggio, Emergenza..."
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1">Colore</label>
              <select value={colore} onChange={e => setColore(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors">
                <option value="purple">Viola</option>
                <option value="gold">Oro</option>
                <option value="green">Verde</option>
                <option value="pink">Rosa</option>
                <option value="blue">Blu</option>
              </select>
            </div>
            <button onClick={handleAdd}
              className="w-full py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white shadow-lg shadow-[rgba(124,58,237,0.3)] hover:shadow-xl transition-all">
              Crea pocket
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
