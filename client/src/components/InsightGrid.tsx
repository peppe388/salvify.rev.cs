'use client'
import { Transaction } from '@/lib/types'
import { TrendingDown, TrendingUp, Calendar, PiggyBank } from 'lucide-react'

export default function InsightGrid({
  transactions,
  currency,
}: {
  transactions: Transaction[]
  currency: string
}) {
  const uscite = transactions.filter(t => t.tipo === 'uscita' && !t.isRoundUp)

  const last30 = uscite.filter(t => {
    const diff = (Date.now() - new Date(t.data + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 30
  })
  const dailyAvg = last30.length ? last30.reduce((s, t) => s + t.importo, 0) / 30 : 0

  const roundupTotal = transactions.filter(t => t.isRoundUp).reduce((s, t) => s + t.importo, 0)

  const dayMap: Record<string, number> = {}
  uscite.forEach(t => { dayMap[t.data] = (dayMap[t.data] || 0) + t.importo })
  const days = Object.keys(dayMap)
  let bestDay = '', worstDay = ''
  if (days.length) {
    bestDay = days.reduce((a, b) => dayMap[a] < dayMap[b] ? a : b)
    worstDay = days.reduce((a, b) => dayMap[a] > dayMap[b] ? a : b)
  }

  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
  const dateFmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'short' })

  const cards = [
    { icon: TrendingDown, label: 'Media/giorno', value: fmt(dailyAvg) },
    { icon: TrendingUp, label: 'Miglior giorno', value: bestDay ? dateFmt(bestDay) : '-', sub: bestDay ? fmt(dayMap[bestDay]) : '' },
    { icon: Calendar, label: 'Giorno + caro', value: worstDay ? dateFmt(worstDay) : '-', sub: worstDay ? fmt(dayMap[worstDay]) : '' },
    { icon: PiggyBank, label: 'Round-up salvato', value: fmt(roundupTotal) },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5 mb-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div key={i} className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={12} className="text-[rgba(255,255,255,0.3)]" />
              <div className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-wide">{card.label}</div>
            </div>
            <div className="text-base font-bold text-[#f1f5f9]">{card.value}</div>
            {card.sub && <div className="text-[10px] text-[rgba(255,255,255,0.55)]">{card.sub}</div>}
          </div>
        )
      })}
    </div>
  )
}
