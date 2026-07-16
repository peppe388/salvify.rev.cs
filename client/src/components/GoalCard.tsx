'use client'
import { useState } from 'react'
import { Goal } from '@/lib/types'
import { Trash2, Plus } from 'lucide-react'

export default function GoalCard({
  goal,
  currency,
  onDelete,
  onAdd,
  hideAmount,
}: {
  goal: Goal
  currency: string
  onDelete: (id: number) => void
  onAdd: (id: number, amount: number) => void
  hideAmount?: boolean
}) {
  const [amount, setAmount] = useState('')
  const pct = Math.min(100, (goal.attuale / goal.target) * 100)
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.scadenza).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`

  function handleAdd() {
    const val = parseFloat(amount)
    if (!val || val <= 0) return
    onAdd(goal.id, val)
    setAmount('')
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text mb-0.5">{goal.nome}</h3>
          <div className="text-xs text-text-muted">
            {fmt(goal.attuale)} di {hideAmount ? '•'.repeat(8) : fmt(goal.target)}
            <span className="text-text-dim"> · {daysLeft > 0 ? `${daysLeft} giorni rimasti` : 'Scaduto'}</span>
          </div>
        </div>
        <button onClick={() => onDelete(goal.id)}
          className="text-text-dim hover:bg-danger/20 hover:text-danger p-1.5 rounded-lg transition-all">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden my-2.5">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-success transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-brand-500">{hideAmount ? '•%' : `${pct.toFixed(0)}%`}</span>
        <span className="text-xs text-text-muted">{daysLeft > 0 ? `${daysLeft}g` : '—'}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="number" value={amount} onChange={e => setAmount(e.target.value)}
          placeholder="+€" step="0.01" min="0"
          className="flex-1 px-2.5 py-2 rounded-lg text-sm bg-surface-hover border border-border text-text outline-none transition-colors placeholder:text-text-dim focus:border-brand-500"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd}
          className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-all">
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
