'use client'
import { Pocket } from '@/lib/types'

const icons: Record<string, string> = { purple: '💜', gold: '⭐', green: '💚', pink: '🩷', blue: '💙' }

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

  return (
    <div className="flex justify-between items-center bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-[18px] p-4 mb-2.5 hover:border-[rgba(124,58,237,0.2)] transition-all group">
      <div className="flex items-center gap-3">
        <div
          className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center text-lg ${pocket.colore === 'purple' ? 'bg-[rgba(124,58,237,0.2)]' : pocket.colore === 'gold' ? 'bg-[rgba(245,158,11,0.2)]' : pocket.colore === 'green' ? 'bg-[rgba(16,185,129,0.2)]' : pocket.colore === 'pink' ? 'bg-[rgba(236,72,153,0.2)]' : 'bg-[rgba(59,130,246,0.2)]'}`}
        >
          {icons[pocket.colore] || '💳'}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#f1f5f9]">{pocket.nome}</h3>
          <span className="text-[11px] text-[rgba(255,255,255,0.3)]">Saldo</span>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <div className="text-base font-bold text-[#f1f5f9]">
          {hideAmount ? '••••' : fmt(pocket.saldo)}
        </div>
        <button
          onClick={() => onDelete(pocket.id)}
          className="text-[rgba(255,255,255,0.3)] hover:bg-[rgba(239,68,68,0.2)] hover:text-[#ef4444] p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
