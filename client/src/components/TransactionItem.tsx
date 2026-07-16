'use client'
import { Transaction } from '@/lib/types'
import { Trash2 } from 'lucide-react'

const categoryIcons: Record<string, string> = {
  'Altro uscite': '🛒',
  'Altro entrate': '💰',
}

export default function TransactionItem({
  t,
  currency,
  onDelete,
  hideAmount,
}: {
  t: Transaction
  currency: string
  onDelete: (id: number) => void
  hideAmount?: boolean
}) {
  const isIncome = t.tipo === 'entrata'
  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
  const date = new Date(t.data + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-hover transition-all group last:rounded-b-2xl">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
        isIncome ? 'bg-success/10' : 'bg-danger/10'
      }`}>
        {categoryIcons[t.categoria] || (isIncome ? '📥' : '📤')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text truncate">{t.nota}</div>
        <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
          <span>{t.categoria}</span>
          <span className="w-1 h-1 rounded-full bg-text-dim" />
          <span>{date}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className={`text-sm font-bold ${isIncome ? 'text-success' : 'text-danger'}`}>
          {isIncome ? '+' : '-'}{hideAmount ? '••••' : fmt(t.importo)}
        </div>
        <button
          onClick={() => onDelete(t.id)}
          className="text-text-dim hover:bg-danger/20 hover:text-danger p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
