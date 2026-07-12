'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Transaction, Category, Goal, CategoryBudget } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import GoalCard from '@/components/GoalCard'
import { LogOut, RotateCcw } from 'lucide-react'

export default function ProfiloPage() {
  const { user, loading: authLoading, logout, refreshUser } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [budgets, setBudgets] = useState<Record<string, CategoryBudget>>({})
  const [loadingData, setLoadingData] = useState(true)

  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('€')
  const [budget, setBudget] = useState(0)
  const [autoLock, setAutoLock] = useState(60)
  const [roundUp, setRoundUp] = useState(false)
  const [hide, setHide] = useState(false)

  // Goals form
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalDate, setGoalDate] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setCurrency(user.currency)
    setBudget(user.budget)
    setAutoLock(user.autoLock)
    setRoundUp(user.roundUp)
    setHide(user.hideBalance)
    Promise.all([
      api.getTransactions(),
      api.getCategories(),
      api.getGoals(),
      api.getBudgets(),
    ]).then(([t, c, g, b]) => {
      setTransactions(t)
      setCategories(c)
      setGoals(g)
      const bMap: Record<string, CategoryBudget> = {}
      b.forEach((item: CategoryBudget) => { bMap[item.categoria] = item })
      setBudgets(bMap)
    }).finally(() => setLoadingData(false))
  }, [user])

  async function saveSettings() {
    await api.updateProfile({ name, currency, budget, autoLock, roundUp, hideBalance: hide })
    await refreshUser()
  }

  async function handleLogout() {
    logout()
    router.push('/login')
  }

  async function handleReset() {
    if (!confirm('Sei sicuro? Tutti i dati verranno cancellati!')) return
    const txs = await api.getTransactions()
    for (const t of txs) await api.deleteTransaction(t.id).catch(() => {})
    const pks = await api.getPockets()
    for (const p of pks) await api.deletePocket(p.id).catch(() => {})
    const gls = await api.getGoals()
    for (const g of gls) await api.deleteGoal(g.id).catch(() => {})
    window.location.reload()
  }

  async function handleAddGoal() {
    if (!goalName.trim() || !goalTarget || !goalDate) { alert('Compila tutti i campi'); return }
    const g = await api.createGoal({ nome: goalName.trim(), target: parseFloat(goalTarget), scadenza: goalDate })
    setGoals(prev => [...prev, g])
    setGoalName(''); setGoalTarget(''); setGoalDate('')
  }

  async function handleDeleteGoal(id: number) {
    if (!confirm('Eliminare questo obiettivo?')) return
    await api.deleteGoal(id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  async function handleAddToGoal(id: number, amount: number) {
    await api.updateGoal(id, amount)
    setGoals(prev => prev.map(g => g.id === id ? { ...g, attuale: g.attuale + amount } : g))
  }

  async function handleSetBudget(cat: string, val: string) {
    const v = parseFloat(val)
    if (v > 0) {
      await api.setBudget(cat, v)
      setBudgets(prev => ({ ...prev, [cat]: { id: 0, userId: 0, categoria: cat, budget: v } }))
    } else {
      await api.deleteBudget(cat)
      setBudgets(prev => { const n = { ...prev }; delete n[cat]; return n })
    }
  }

  const currencySym = currency
  const fmt = (n: number) => `${currencySym} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
  const uscitaCats = categories.filter(c => c.tipo === 'uscita')

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
        <h2 className="text-base font-bold text-[#f1f5f9] mb-4">Profilo</h2>

        {/* Settings */}
        <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-[18px] p-4 mb-4">
          <div className="divide-y divide-[rgba(255,255,255,0.06)]">
            <div className="py-3.5 flex justify-between items-center">
              <label className="text-sm text-[#f1f5f9] font-medium">Nome profilo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} onBlur={saveSettings}
                className="max-w-[140px] px-2.5 py-1.5 rounded-lg text-sm bg-black/20 border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] text-right" />
            </div>
            <div className="py-3.5 flex justify-between items-center">
              <label className="text-sm text-[#f1f5f9] font-medium">Valuta</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} onBlur={saveSettings}
                className="max-w-[130px] px-2.5 py-1.5 rounded-lg text-sm bg-black/20 border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed]">
                <option value="€">€ Euro</option>
                <option value="$">$ Dollaro</option>
                <option value="£">£ Sterlina</option>
              </select>
            </div>
            <div className="py-3.5 flex justify-between items-center">
              <label className="text-sm text-[#f1f5f9] font-medium">Budget mensile</label>
              <input type="number" value={budget || ''} onChange={e => setBudget(parseFloat(e.target.value) || 0)} onBlur={saveSettings} placeholder="0"
                className="max-w-[110px] px-2.5 py-1.5 rounded-lg text-sm bg-black/20 border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] text-right" />
            </div>
            <div className="py-3.5 flex justify-between items-center">
              <label className="text-sm text-[#f1f5f9] font-medium">Arrotondamento</label>
              <button
                onClick={async () => { setRoundUp(!roundUp); await api.updateProfile({ roundUp: !roundUp }); await refreshUser() }}
                className={`w-[42px] h-[22px] rounded-full relative transition-colors ${roundUp ? 'bg-[#7c3aed]' : 'bg-[rgba(255,255,255,0.1)]'}`}
              >
                <span className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full transition-transform ${roundUp ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div className="py-3.5 flex justify-between items-center">
              <label className="text-sm text-[#f1f5f9] font-medium">Blocco automatico</label>
              <select value={autoLock} onChange={e => setAutoLock(parseInt(e.target.value))} onBlur={saveSettings}
                className="max-w-[110px] px-2.5 py-1.5 rounded-lg text-sm bg-black/20 border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed]">
                <option value={30}>30s</option>
                <option value={60}>1 min</option>
                <option value={300}>5 min</option>
                <option value={0}>Mai</option>
              </select>
            </div>
            <div className="py-3.5 flex justify-between items-center">
              <label className="text-sm text-[#f1f5f9] font-medium">Nascondi saldo</label>
              <button
                onClick={async () => { setHide(!hide); await api.updateProfile({ hideBalance: !hide }); await refreshUser() }}
                className={`w-[42px] h-[22px] rounded-full relative transition-colors ${hide ? 'bg-[#7c3aed]' : 'bg-[rgba(255,255,255,0.1)]'}`}
              >
                <span className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full transition-transform ${hide ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Budget per categoria */}
        <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-[18px] p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#f1f5f9] mb-3">Budget per categoria</h3>
          {uscitaCats.map(c => {
            const budgetVal = budgets[c.nome]?.budget || 0
            const speso = transactions.filter(t => t.categoria === c.nome && t.tipo === 'uscita' && !t.isRoundUp).reduce((s, t) => s + t.importo, 0)
            const pct = budgetVal > 0 ? Math.min(100, (speso / budgetVal) * 100) : 0
            return (
              <div key={c.id} className="mb-3">
                <div className="flex justify-between text-xs text-[rgba(255,255,255,0.55)] mb-1">
                  <span className="font-medium text-[#f1f5f9]">{c.icona} {c.nome}</span>
                  <span>{budgetVal > 0 ? `${fmt(speso)} / ${fmt(budgetVal)}` : '—'}</span>
                </div>
                {budgetVal > 0 && (
                  <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: speso > budgetVal ? '#ef4444' : '#10b981' }} />
                  </div>
                )}
                <div className="flex gap-1.5 items-center">
                  <input
                    type="number" defaultValue={budgetVal || ''} placeholder="Budget"
                    onBlur={e => handleSetBudget(c.nome, e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg text-xs bg-black/20 border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed]"
                  />
                  {budgetVal > 0 && (
                    <span className={`text-[10px] ${speso > budgetVal ? 'text-[#ef4444]' : 'text-[rgba(255,255,255,0.55)]'}`}>
                      {speso > budgetVal ? '⚠ Superato' : `${(budgetVal - speso).toFixed(0)}€ rimasti`}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Goals */}
        <div className="mb-4">
          {goals.map(g => (
            <GoalCard key={g.id} goal={g} currency={currency} onDelete={handleDeleteGoal} onAdd={handleAddToGoal} hideAmount={hide} />
          ))}
          <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-[18px] p-[18px]">
            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-3">Nuovo obiettivo</h3>
            <div className="space-y-3">
              <input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Es. Vacanza, iPhone..."
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed]" />
              <input type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="1000" step="0.01" min="0"
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed]" />
              <input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed]" />
              <button onClick={handleAddGoal}
                className="w-full py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white shadow-lg shadow-[rgba(124,58,237,0.3)] hover:shadow-xl transition-all">
                Crea obiettivo
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <button onClick={handleReset} className="flex items-center justify-center gap-2 flex-1 py-3 rounded-lg font-semibold text-sm bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.25)] transition-all">
            <RotateCcw size={14} /> Reset dati
          </button>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 flex-1 py-3 rounded-lg font-semibold text-sm bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)] transition-all">
            <LogOut size={14} /> Esci
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
