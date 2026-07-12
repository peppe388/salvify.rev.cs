'use client'
import { useState } from 'react'
import { Goal } from '@/lib/types'

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
    <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-[18px] p-[18px] mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-[#f1f5f9] font-semibold mb-1">{goal.nome}</h3>
          <div className="text-[11px] text-[rgba(255,255,255,0.55)]">
            {fmt(goal.attuale)} di {hideAmount ? '•'.repeat(8) : fmt(goal.target)} · {daysLeft > 0 ? `${daysLeft} giorni` : 'Scaduto'}
          </div>
        </div>
        <button onClick={() => onDelete(goal.id)} className="text-[rgba(255,255,255,0.3)] hover:bg-[rgba(239,68,68,0.2)] hover:text-[#ef4444] p-1 rounded-md transition-all text-sm">✕</button>
      </div>
      <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden my-2">
        <div className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#10b981] transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs font-semibold text-[#7c3aed] text-right mb-2">{hideAmount ? '•%' : `${pct.toFixed(0)}%`}</div>
      <div className="flex gap-1.5">
        <input
          type="number" value={amount} onChange={e => setAmount(e.target.value)}
          placeholder="+€" step="0.01" min="0"
          className="flex-1 px-2.5 py-2 rounded-lg text-sm bg-black/20 border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white transition-all hover:scale-105">+</button>
      </div>
    </div>
  )
}
