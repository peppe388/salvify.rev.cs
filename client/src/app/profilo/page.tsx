'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { CategoryBudget } from '@/lib/types'
import AppShell from '@/components/AppShell'
import GoalCard from '@/components/GoalCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { AuthGuard } from '@/components/AuthGuard'
import { LogOut, RotateCcw, Target, Wallet, PiggyBank } from 'lucide-react'

export default function ProfiloPage() {
  return (
    <AuthGuard>
      <ProfiloContent />
    </AuthGuard>
  )
}

function ProfiloContent() {
  const { user, logout, refreshUser } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('€')
  const [budget, setBudget] = useState(0)
  const [autoLock, setAutoLock] = useState(60)
  const [roundUp, setRoundUp] = useState(false)
  const [hide, setHide] = useState(false)

  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalDate, setGoalDate] = useState('')

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: api.getTransactions,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  })

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: api.getGoals,
  })

  const { data: budgetList = [] } = useQuery({
    queryKey: ['budgets'],
    queryFn: api.getBudgets,
  })

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setCurrency(user.currency)
    setBudget(user.budget)
    setAutoLock(user.autoLock)
    setRoundUp(user.roundUp)
    setHide(user.hideBalance)
  }, [user])

  const BudgetMap: Record<string, CategoryBudget> = {}
  budgetList.forEach((item: CategoryBudget) => { BudgetMap[item.categoria] = item })

  const updateProfileMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.updateProfile(data),
    onSuccess: () => refreshUser(),
    onError: (err: Error) => toast.error(err.message),
  })

  const createGoalMutation = useMutation({
    mutationFn: (data: { nome: string; target: number; scadenza: string }) => api.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Obiettivo creato')
      setGoalName(''); setGoalTarget(''); setGoalDate('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteGoalMutation = useMutation({
    mutationFn: (id: number) => api.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Obiettivo eliminato')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, delta }: { id: number; delta: number }) => api.updateGoal(id, delta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Obiettivo aggiornato')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  function saveSettings() {
    updateProfileMutation.mutate({ name, currency, budget, autoLock, roundUp: Boolean(roundUp), hideBalance: Boolean(hide) })
  }

  function handleLogout() { logout(); router.push('/login') }

  async function handleReset() {
    if (!window.confirm('Sei sicuro? Tutti i dati verranno cancellati!')) return
    for (const t of await api.getTransactions()) await api.deleteTransaction(t.id).catch(() => {})
    for (const p of await api.getPockets()) await api.deletePocket(p.id).catch(() => {})
    for (const g of await api.getGoals()) await api.deleteGoal(g.id).catch(() => {})
    toast.success('Dati cancellati')
    queryClient.invalidateQueries()
  }

  function handleAddGoal() {
    if (!goalName.trim() || !goalTarget || !goalDate) { toast.error('Compila tutti i campi'); return }
    createGoalMutation.mutate({ nome: goalName.trim(), target: parseFloat(goalTarget), scadenza: goalDate })
  }

  function handleDeleteGoal(id: number) {
    if (!window.confirm('Eliminare questo obiettivo?')) return
    deleteGoalMutation.mutate(id)
  }

  function handleAddToGoal(id: number, amount: number) {
    updateGoalMutation.mutate({ id, delta: amount })
  }

  async function handleSetBudget(cat: string, val: string) {
    const v = parseFloat(val)
    try {
      if (v > 0) {
        await api.setBudget(cat, v)
      } else {
        await api.deleteBudget(cat)
      }
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget aggiornato')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
  const uscitaCats = categories.filter(c => c.tipo === 'uscita')

  if (goalsLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-4">
          <div className="h-6 w-32 skeleton-shimmer rounded-lg" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        <h2 className="text-lg font-bold text-text mb-5">Profilo</h2>

        <Card className="!p-5 mb-4">
          <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
            <Wallet size={16} className="text-brand-500" />
            Impostazioni
          </h3>
          <div className="divide-y divide-border">
            <SettingRow label="Nome profilo">
              <input type="text" value={name} onChange={e => setName(e.target.value)} onBlur={saveSettings}
                className="w-36 px-2.5 py-1.5 rounded-lg text-sm bg-surface-hover border border-border text-text text-right outline-none focus:border-brand-500" />
            </SettingRow>
            <SettingRow label="Valuta">
              <select value={currency} onChange={e => setCurrency(e.target.value)} onBlur={saveSettings}
                className="w-28 px-2.5 py-1.5 rounded-lg text-sm bg-surface-hover border border-border text-text outline-none focus:border-brand-500">
                <option value="€">€ Euro</option>
                <option value="$">$ Dollaro</option>
                <option value="£">£ Sterlina</option>
              </select>
            </SettingRow>
            <SettingRow label="Budget mensile">
              <input type="number" value={budget || ''} onChange={e => setBudget(parseFloat(e.target.value) || 0)} onBlur={saveSettings} placeholder="0"
                className="w-28 px-2.5 py-1.5 rounded-lg text-sm bg-surface-hover border border-border text-text text-right outline-none focus:border-brand-500" />
            </SettingRow>
            <SettingRow label="Arrotondamento">
              <Toggle checked={roundUp} onChange={() => { setRoundUp(!roundUp); updateProfileMutation.mutate({ roundUp: !roundUp }) }} />
            </SettingRow>
            <SettingRow label="Blocco automatico">
              <select value={autoLock} onChange={e => setAutoLock(parseInt(e.target.value))} onBlur={saveSettings}
                className="w-28 px-2.5 py-1.5 rounded-lg text-sm bg-surface-hover border border-border text-text outline-none focus:border-brand-500">
                <option value={30}>30s</option>
                <option value={60}>1 min</option>
                <option value={300}>5 min</option>
                <option value={0}>Mai</option>
              </select>
            </SettingRow>
            <SettingRow label="Nascondi saldo">
              <Toggle checked={hide} onChange={() => { setHide(!hide); updateProfileMutation.mutate({ hideBalance: !hide }) }} />
            </SettingRow>
          </div>
        </Card>

        <Card className="!p-5 mb-4">
          <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
            <PiggyBank size={16} className="text-brand-500" />
            Budget per categoria
          </h3>
          {uscitaCats.map(c => {
            const budgetVal = BudgetMap[c.nome]?.budget || 0
            const speso = transactions.filter(t => t.categoria === c.nome && t.tipo === 'uscita' && !t.isRoundUp).reduce((s, t) => s + t.importo, 0)
            const pct = budgetVal > 0 ? Math.min(100, (speso / budgetVal) * 100) : 0
            return (
              <div key={c.id} className="mb-3.5">
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span className="font-medium text-text">{c.icona} {c.nome}</span>
                  <span>{budgetVal > 0 ? `${fmt(speso)} / ${fmt(budgetVal)}` : '—'}</span>
                </div>
                {budgetVal > 0 && (
                  <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: speso > budgetVal ? 'var(--color-danger)' : 'var(--color-success)' }} />
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <input type="number" defaultValue={budgetVal || ''} placeholder="Budget" onBlur={e => handleSetBudget(c.nome, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-surface-hover border border-border text-text outline-none focus:border-brand-500" />
                  {budgetVal > 0 && (
                    <span className={`text-xs font-medium ${speso > budgetVal ? 'text-danger' : 'text-text-muted'}`}>
                      {speso > budgetVal ? '⚠ Superato' : `${(budgetVal - speso).toFixed(0)}€ rimasti`}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </Card>

        <div className="mb-5">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <Target size={16} className="text-brand-500" />
            Obiettivi di risparmio
          </h3>
          {goals.map(g => (
            <GoalCard key={g.id} goal={g} currency={currency} onDelete={handleDeleteGoal} onAdd={handleAddToGoal} hideAmount={hide} />
          ))}
          <Card className="!p-5">
            <h4 className="text-sm font-semibold text-text mb-4">Nuovo obiettivo</h4>
            <div className="space-y-3">
              <Input value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Es. Vacanza, iPhone..." />
              <Input type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="Importo target" step="0.01" min="0" />
              <Input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} />
              <Button onClick={handleAddGoal} loading={createGoalMutation.isPending} className="w-full">
                Crea obiettivo
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex gap-3 mb-8">
          <Button variant="danger" onClick={handleReset} className="flex-1">
            <RotateCcw size={14} /> Reset dati
          </Button>
          <Button variant="secondary" onClick={handleLogout} className="flex-1">
            <LogOut size={14} /> Esci
          </Button>
        </div>
      </div>
    </AppShell>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3.5 flex justify-between items-center">
      <label className="text-sm text-text font-medium">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-[24px] rounded-full relative transition-colors ${checked ? 'bg-brand-500' : 'bg-border'}`}
    >
      <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-[22px]' : ''}`} />
    </button>
  )
}
