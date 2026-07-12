'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Transaction, Category } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import Fab from '@/components/Fab'
import TransactionItem from '@/components/TransactionItem'
import { Search } from 'lucide-react'

export default function MovimentiPage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [hide, setHide] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    setHide(user.hideBalance)
    Promise.all([api.getTransactions(), api.getCategories()])
      .then(([t, c]) => { setTransactions(t); setCategories(c) })
      .finally(() => setLoadingData(false))
  }, [user])

  const currency = user?.currency || '€'

  let list = [...transactions].filter(t => !t.isRoundUp).sort((a, b) => b.id - a.id)
  if (search) list = list.filter(t => t.nota.toLowerCase().includes(search.toLowerCase()) || t.categoria.toLowerCase().includes(search.toLowerCase()))
  if (filterCat !== 'all') list = list.filter(t => t.categoria === filterCat)

  async function deleteTransaction(id: number) {
    if (!confirm('Eliminare questa transazione?')) return
    await api.deleteTransaction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
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
        <h2 className="text-base font-bold text-[#f1f5f9] mb-4">Movimenti</h2>

        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.3)]" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cerca transazione..."
              className="w-full pl-8 pr-3 py-2.5 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors">
            <option value="all">Tutte</option>
            {categories.map(c => <option key={c.id} value={c.nome}>{c.icona} {c.nome}</option>)}
          </select>
        </div>

        {list.length === 0 ? (
          <div className="text-center text-[rgba(255,255,255,0.3)] text-sm py-12">
            <div className="text-4xl opacity-30 mb-3">📋</div>
            Nessuna transazione trovata
          </div>
        ) : (
          list.map(t => (
            <TransactionItem key={t.id} t={t} currency={currency} onDelete={deleteTransaction} hideAmount={hide} />
          ))
        )}
      </div>
      <Fab />
      <BottomNav />
    </div>
  )
}
