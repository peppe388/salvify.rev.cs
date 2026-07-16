'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Transaction, User } from '@/lib/types'
import Card3D from './Card3D'
import InsightGrid from './InsightGrid'
import { MonthlyChart } from './Charts'
import TransactionItem from './TransactionItem'
import { Card } from './ui/Card'

export default function CardDrawer({
  transactions,
  user,
  currency,
  open,
  onClose,
  deleteTransaction,
  hide,
}: {
  transactions: Transaction[]
  user: User
  currency: string
  open: boolean
  onClose: () => void
  deleteTransaction: (id: number) => void
  hide: boolean
}) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const monthTx = transactions.filter(t => {
    const d = new Date(t.data + 'T00:00:00')
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear && !t.isRoundUp
  })
  const monthIncome = monthTx.filter(t => t.tipo === 'entrata').reduce((s, t) => s + t.importo, 0)
  const monthExpense = monthTx.filter(t => t.tipo === 'uscita').reduce((s, t) => s + t.importo, 0)

  const totalIncome = transactions.filter(t => t.tipo === 'entrata' && !t.isRoundUp).reduce((s, t) => s + t.importo, 0)
  const totalExpense = transactions.filter(t => t.tipo === 'uscita' && !t.isRoundUp).reduce((s, t) => s + t.importo, 0)
  const totalBalance = totalIncome - totalExpense

  const monthlyBudget = user.budget || 0
  const budgetPct = monthlyBudget > 0 ? Math.min(100, (monthExpense / monthlyBudget) * 100) : 0
  const budgetRemaining = monthlyBudget - monthExpense

  const recent = [...transactions].filter(t => !t.isRoundUp).sort((a, b) => b.id - a.id).slice(0, 8)

  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
  const userFullName = user.name || 'Giuseppe'

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-2xl mx-auto mt-8 mb-0 bg-bg rounded-t-3xl shadow-modal border border-border flex flex-col max-h-[90vh] animate-slide-up-drawer"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-end pt-4 pr-4">
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-thin">
          <div className="max-w-sm mx-auto -mt-2 mb-6">
            <Card3D saldo={totalBalance} nome={userFullName} currency={currency} userId={user.id} />
          </div>

          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-text-muted">Saldo totale</span>
            <span className={`text-base font-bold ${totalBalance >= 0 ? 'text-success' : 'text-danger'}`}>
              {hide ? '••••••' : fmt(totalBalance)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 my-4">
            <Card>
              <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Entrate (mese)</div>
              <div className="text-lg font-bold text-success">{hide ? '••••' : fmt(monthIncome)}</div>
            </Card>
            <Card>
              <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Uscite (mese)</div>
              <div className="text-lg font-bold text-danger">{hide ? '••••' : fmt(monthExpense)}</div>
            </Card>
          </div>

          {monthlyBudget > 0 && (
            <Card className="mb-4">
              <div className="flex justify-between text-xs text-text-muted mb-1.5">
                <span className="font-semibold text-text">Budget mensile</span>
                <span>{fmt(monthExpense)} / {fmt(monthlyBudget)}</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${budgetPct}%`, background: budgetRemaining > 0 ? 'var(--color-success)' : 'var(--color-danger)' }} />
              </div>
              <div className="text-xs font-semibold mt-1" style={{ color: budgetRemaining > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {budgetRemaining >= 0 ? `Rimangono ${fmt(budgetRemaining)}` : `Superato di ${fmt(Math.abs(budgetRemaining))}`}
              </div>
            </Card>
          )}

          <InsightGrid transactions={transactions} currency={currency} />

          <Card className="mb-4">
            <h3 className="text-sm font-semibold text-text mb-2.5">Statistiche mensili</h3>
            <MonthlyChart transactions={transactions} />
          </Card>

          <div className="text-xs font-semibold text-text-muted mb-2.5 uppercase tracking-wide">Ultime transazioni</div>
          {recent.length === 0 ? (
            <div className="text-center text-text-dim text-sm py-6">
              Nessuna transazione ancora.
            </div>
          ) : (
            recent.map(t => (
              <TransactionItem key={t.id} t={t} currency={currency} onDelete={deleteTransaction} hideAmount={hide} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
