'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Transaction, Category, Pocket } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import Fab from '@/components/Fab'
import Card3D from '@/components/Card3D'
import TransactionItem from '@/components/TransactionItem'
import { Eye, EyeOff } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pockets, setPockets] = useState<Pocket[]>([])
  const [hide, setHide] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    setHide(user.hideBalance)
    Promise.all([
      api.getTransactions(),
      api.getCategories(),
      api.getPockets(),
    ]).then(([t, c, p]) => {
      setTransactions(t)
      setCategories(c)
      setPockets(p)
    }).finally(() => setLoadingData(false))
  }, [user])

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.data + 'T00:00:00')
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear && !t.isRoundUp
  })
  const monthIncome = monthTransactions.filter(t => t.tipo === 'entrata').reduce((s, t) => s + t.importo, 0)
  const monthExpense = monthTransactions.filter(t => t.tipo === 'uscita').reduce((s, t) => s + t.importo, 0)
  const balance = monthIncome - monthExpense

  const totalIncome = transactions.filter(t => t.tipo === 'entrata' && !t.isRoundUp).reduce((s, t) => s + t.importo, 0)
  const totalExpense = transactions.filter(t => t.tipo === 'uscita' && !t.isRoundUp).reduce((s, t) => s + t.importo, 0)
  const totalBalance = totalIncome - totalExpense

  const recent = [...transactions].filter(t => !t.isRoundUp).sort((a, b) => b.id - a.id).slice(0, 5)

  const currency = user?.currency || '€'
  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`

  // Today spending
  const today = new Date().toISOString().split('T')[0]
  const todayExpenses = transactions.filter(t => t.data === today && t.tipo === 'uscita' && !t.isRoundUp)
  const todayTotal = todayExpenses.reduce((s, t) => s + t.importo, 0)

  // Budget
  const monthlyBudget = user?.budget || 0
  const budgetPct = monthlyBudget > 0 ? Math.min(100, (monthExpense / monthlyBudget) * 100) : 0
  const budgetRemaining = monthlyBudget - monthExpense

  async function toggleHide() {
    const newVal = !hide
    setHide(newVal)
    await api.updateProfile({ hideBalance: newVal })
    await refreshUser()
  }

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
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#f1f5f9] to-[#a78bfa] bg-clip-text text-transparent">
            Salvify
          </h1>
          <div className="flex items-center gap-2.5">
            <button onClick={toggleHide} className="text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)] transition-colors">
              {hide ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <div
              onClick={() => router.push('/profilo')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-[rgba(124,58,237,0.2)] cursor-pointer"
            >
              {(user?.name || 'G')[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Card */}
        <Card3D saldo={totalBalance} nome={user?.name || 'Giuseppe'} currency={currency} />

        {/* Month summary */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5">
            <div className="text-[11px] text-[rgba(255,255,255,0.3)] uppercase tracking-wider mb-1">Entrate</div>
            <div className="text-lg font-bold text-[#10b981]">{hide ? '••••' : fmt(monthIncome)}</div>
          </div>
          <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5">
            <div className="text-[11px] text-[rgba(255,255,255,0.3)] uppercase tracking-wider mb-1">Uscite</div>
            <div className="text-lg font-bold text-[#ef4444]">{hide ? '••••' : fmt(monthExpense)}</div>
          </div>
        </div>

        {/* Today spending */}
        <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 mb-4 flex items-center gap-3">
          {todayTotal > 0 ? (
            <>
              <span className="text-2xl opacity-60">📌</span>
              <div>
                <div className="text-xs text-[rgba(255,255,255,0.55)]">Oggi</div>
                <div className="text-sm font-medium text-[#f1f5f9]">Hai speso {fmt(todayTotal)}</div>
              </div>
            </>
          ) : (
            <>
              <span className="text-2xl opacity-60">✅</span>
              <div>
                <div className="text-xs text-[rgba(255,255,255,0.55)]">Oggi</div>
                <div className="text-sm font-medium text-[#f1f5f9]">Nessuna spesa oggi. Ottimo!</div>
              </div>
            </>
          )}
        </div>

        {/* Budget */}
        {monthlyBudget > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[rgba(255,255,255,0.55)] mb-1">
              <span className="font-semibold text-[#f1f5f9]">Budget mensile</span>
              <span>{fmt(monthExpense)} / {fmt(monthlyBudget)}</span>
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${budgetPct}%`, background: budgetRemaining > 0 ? '#10b981' : '#ef4444' }} />
            </div>
            <div className="text-[10px] font-semibold mt-1" style={{ color: budgetRemaining > 0 ? '#10b981' : '#ef4444' }}>
              {budgetRemaining >= 0 ? `Rimangono ${fmt(budgetRemaining)}` : `Superato di ${fmt(Math.abs(budgetRemaining))}`}
            </div>
          </div>
        )}

        {/* Recent transactions */}
        <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-[18px] p-4 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-[rgba(255,255,255,0.55)]">Saldo totale</span>
            <span className={`text-base font-bold ${totalBalance >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {hide ? '••••••' : fmt(totalBalance)}
            </span>
          </div>
        </div>

        <div className="text-xs font-semibold text-[rgba(255,255,255,0.55)] mb-2.5">Ultime transazioni</div>
        {recent.length === 0 ? (
          <div className="text-center text-[rgba(255,255,255,0.3)] text-sm py-8">
            <div className="text-4xl opacity-30 mb-3">📭</div>
            Nessuna transazione ancora.<br />Aggiungine una!
          </div>
        ) : (
          <>
            {recent.map(t => (
              <TransactionItem key={t.id} t={t} currency={currency} onDelete={deleteTransaction} hideAmount={hide} />
            ))}
            <button onClick={() => router.push('/movimenti')} className="block mx-auto mt-3 text-xs font-semibold text-[#7c3aed] bg-transparent border-none cursor-pointer">
              Vedi tutte →
            </button>
          </>
        )}
      </div>

      <Fab />
      <BottomNav />
    </div>
  )
}
