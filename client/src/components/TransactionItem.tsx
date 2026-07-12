'use client'
import { Transaction } from '@/lib/types'

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
  const color = isIncome ? '#10b981' : '#ef4444'
  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
  const date = new Date(t.data + 'T00:00:00').toLocaleDateString('it-IT')

  return (
    <div className="flex justify-between items-center py-3.5 border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.02)] hover:-mx-1.5 hover:px-1.5 hover:rounded-lg transition-all group">
      <div className="flex-1">
        <div className="flex items-center gap-1.5 text-[11px] text-[rgba(255,255,255,0.55)]">
          <span className="w-[7px] h-[7px] rounded-full inline-block" style={{ background: color }} />
          <span>{t.categoria}</span>
          <span className="text-[rgba(255,255,255,0.3)]">{date}</span>
        </div>
        <div className="text-sm font-medium text-[#f1f5f9] mt-0.5">{t.nota}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`text-sm font-bold ${isIncome ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
          {isIncome ? '+' : '-'}{hideAmount ? '••••' : fmt(t.importo)}
        </div>
        <button
          onClick={() => onDelete(t.id)}
          className="text-[rgba(255,255,255,0.3)] hover:bg-[rgba(239,68,68,0.2)] hover:text-[#ef4444] p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
