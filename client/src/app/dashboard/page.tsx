'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { api, getAllTransactions } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import AppShell from '@/components/AppShell'
import Card3D from '@/components/Card3D'
import CardDrawer from '@/components/CardDrawer'
import TransactionItem from '@/components/TransactionItem'
import { MonthlyChart } from '@/components/Charts'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Card } from '@/components/ui/Card'
import { SkeletonCard, SkeletonList } from '@/components/ui/Skeleton'
import { AuthGuard } from '@/components/AuthGuard'
import { ArrowUpRight, ArrowDownRight, TrendingUp, ChevronRight } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 } as const,
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [cardOpen, setCardOpen] = useState(false)

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => getAllTransactions(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transazione eliminata')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  function deleteTransaction(id: number) {
    deleteMutation.mutate(id)
  }

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const filtered = transactions.filter(t => !t.isRoundUp)

  const monthTx = filtered.filter(t => {
    const d = new Date(t.data + 'T00:00:00')
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const monthIncome = monthTx.filter(t => t.tipo === 'entrata').reduce((s, t) => s + t.importo, 0)
  const monthExpense = monthTx.filter(t => t.tipo === 'uscita').reduce((s, t) => s + t.importo, 0)

  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear
  const prevTx = filtered.filter(t => {
    const d = new Date(t.data + 'T00:00:00')
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear
  })
  const prevExpense = prevTx.filter(t => t.tipo === 'uscita').reduce((s, t) => s + t.importo, 0)
  const expenseTrend = prevExpense > 0 ? ((monthExpense - prevExpense) / prevExpense) * 100 : 0

  const totalIncome = filtered.filter(t => t.tipo === 'entrata').reduce((s, t) => s + t.importo, 0)
  const totalExpense = filtered.filter(t => t.tipo === 'uscita').reduce((s, t) => s + t.importo, 0)
  const totalBalance = totalIncome - totalExpense

  const monthlyBudget = user?.budget || 0
  const budgetPct = monthlyBudget > 0 ? Math.min(100, (monthExpense / monthlyBudget) * 100) : 0
  const budgetRemaining = monthlyBudget - monthExpense

  const recent = [...filtered].sort((a, b) => b.id - a.id).slice(0, 5)

  const currency = user?.currency || '€'
  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-2xl mx-auto px-5 pt-16 pb-28 space-y-6">
          <div className="space-y-3 text-center">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
          <SkeletonList count={4} />
        </div>
      </div>
    )
  }

  return (
    <>
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Header minimal */}
        <motion.div variants={item} className="flex items-center justify-between mb-8 pt-2">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => router.push('/profilo')}
              className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all"
            >
              {(user?.name || 'G')[0].toUpperCase()}
            </button>
          </div>
        </motion.div>

        {/* Saldo — HERO */}
        <motion.div variants={item} className="text-center mb-8">
          <p className="text-xs font-medium text-text-muted uppercase tracking-[2px] mb-2">Saldo disponibile</p>
          <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight mb-2 ${totalBalance >= 0 ? 'text-text' : 'text-danger'}`}>
            {fmt(totalBalance)}
          </h1>
          {monthExpense > 0 && (
            <div className="flex items-center justify-center gap-1.5 text-xs">
              <TrendingUp size={12} className={expenseTrend <= 0 ? 'text-success' : 'text-danger'} />
              <span className={expenseTrend <= 0 ? 'text-success' : 'text-danger'}>
                {expenseTrend <= 0 ? '-' : '+'}{Math.abs(expenseTrend).toFixed(1)}% rispetto al mese scorso
              </span>
            </div>
          )}
        </motion.div>

        {/* Carta */}
        <motion.div variants={item} className="mb-8">
          <Card3D
            saldo={totalBalance}
            nome={user?.name || 'Giuseppe'}
            currency={currency}
            userId={user?.id}
            onClick={() => setCardOpen(true)}
          />
        </motion.div>

        {/* Riepilogo mese inline */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-success/5 border border-success/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center">
                <ArrowUpRight size={14} className="text-success" />
              </div>
              <span className="text-xs text-text-muted uppercase tracking-wide">Entrate</span>
            </div>
            <div className="text-lg font-bold text-success">{fmt(monthIncome)}</div>
            <div className="text-xs text-text-dim mt-0.5">Questo mese</div>
          </div>
          <div className="bg-danger/5 border border-danger/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-danger/15 flex items-center justify-center">
                <ArrowDownRight size={14} className="text-danger" />
              </div>
              <span className="text-xs text-text-muted uppercase tracking-wide">Uscite</span>
            </div>
            <div className="text-lg font-bold text-danger">{fmt(monthExpense)}</div>
            <div className="text-xs text-text-dim mt-0.5">Questo mese</div>
          </div>
        </motion.div>

        {/* Budget */}
        {monthlyBudget > 0 && (
          <motion.div variants={item} className="mb-6">
            <div className="flex justify-between text-xs text-text-muted mb-2">
              <span className="font-medium text-text">Budget mensile</span>
              <span>{fmt(monthExpense)} / {fmt(monthlyBudget)}</span>
            </div>
            <div className="h-2.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${budgetPct}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                style={{ background: budgetRemaining > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
              />
            </div>
            <div className="text-xs font-medium mt-1.5 text-text-muted">
              {budgetRemaining >= 0 ? `Rimangono ${fmt(budgetRemaining)}` : `Superato di ${fmt(Math.abs(budgetRemaining))}`}
            </div>
          </motion.div>
        )}

        {/* Grafico mensile */}
        <motion.div variants={item} className="mb-6">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text">Statistiche mensili</h3>
              <button onClick={() => router.push('/stats')} className="text-text-dim hover:text-text transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
            <MonthlyChart transactions={transactions} />
          </Card>
        </motion.div>

        {/* Transazioni recenti */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text">Transazioni recenti</h3>
            <button onClick={() => router.push('/movimenti')} className="text-xs font-medium text-brand-500 hover:underline">
              Vedi tutte
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-3">
                <TrendingUp size={24} className="text-text-dim" />
              </div>
              <p className="text-sm text-text-muted">Nessuna transazione ancora</p>
              <p className="text-xs text-text-dim mt-1">Aggiungine una con il pulsante + in basso</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
              {recent.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                >
                  <TransactionItem t={t} currency={currency} onDelete={deleteTransaction} hideAmount={false} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AppShell>
      <CardDrawer
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        transactions={transactions}
        user={user!}
        currency={currency}
        deleteTransaction={deleteTransaction}
        hide={user?.hideBalance || false}
      />
    </>
  )
}
