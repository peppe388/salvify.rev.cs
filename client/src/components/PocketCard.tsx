'use client'
import { Pocket } from '@/lib/types'
import { Trash2 } from 'lucide-react'

const colorMap: Record<string, { bg: string; ring: string }> = {
  purple: { bg: 'bg-brand-500/15', ring: 'ring-brand-500/30' },
  gold: { bg: 'bg-warning/15', ring: 'ring-warning/30' },
  green: { bg: 'bg-success/15', ring: 'ring-success/30' },
  pink: { bg: 'bg-pink-500/15', ring: 'ring-pink-500/30' },
  blue: { bg: 'bg-blue-500/15', ring: 'ring-blue-500/30' },
}

export default function PocketCard({
  pocket,
  currency,
  onDelete,
  hideAmount,
}: {
  pocket: Pocket
  currency: string
  onDelete: (id: number) => void
  hideAmount?: boolean
}) {
  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
  const c = colorMap[pocket.colore] || colorMap.purple

  return (
    <div className="flex justify-between items-center bg-surface border border-border rounded-xl p-4 mb-2.5 hover:border-brand-500/30 transition-all group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center text-base font-bold text-text ring-1 ${c.ring}`}>
          {pocket.nome[0].toUpperCase()}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text">{pocket.nome}</h3>
          <span className="text-xs text-text-muted">Saldo disponibile</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="text-base font-bold text-text">
          {hideAmount ? '••••' : fmt(pocket.saldo)}
        </div>
        <button
          onClick={() => onDelete(pocket.id)}
          className="text-text-dim hover:bg-danger/20 hover:text-danger p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
