'use client'
import { Transaction, Category } from '@/lib/types'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const COLORS = ['#7c3aed', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4', '#84cc16', '#f97316', '#8b5cf6', '#14b8a6', '#e11d48']

export function CategoryChart({ transactions, categories }: { transactions: Transaction[]; categories: Category[] }) {
  const uscite = transactions.filter(t => t.tipo === 'uscita' && !t.isRoundUp)
  const byCat: Record<string, number> = {}
  uscite.forEach(t => { byCat[t.categoria] = (byCat[t.categoria] || 0) + t.importo })
  const labels = Object.keys(byCat)
  const values = Object.values(byCat)

  if (!labels.length) {
    return <div className="text-center text-[rgba(255,255,255,0.3)] text-sm py-8">Nessun dato disponibile</div>
  }

  return (
    <Doughnut
      data={{
        labels: labels.map(l => { const c = categories.find(x => x.nome === l); return (c ? c.icona + ' ' : '') + l }),
        datasets: [{ data: values, backgroundColor: COLORS.slice(0, labels.length), borderWidth: 0 }],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 10, padding: 8, font: { size: 11 }, color: 'rgba(255,255,255,0.7)' } },
        },
      }}
    />
  )
}

export function MonthlyChart({ transactions }: { transactions: Transaction[] }) {
  const entrateM: Record<string, number> = {}
  const usciteM: Record<string, number> = {}
  transactions.filter(t => !t.isRoundUp).forEach(t => {
    const key = t.data.substring(0, 7)
    if (t.tipo === 'entrata') entrateM[key] = (entrateM[key] || 0) + t.importo
    else usciteM[key] = (usciteM[key] || 0) + t.importo
  })
  const meses = Object.keys({ ...entrateM, ...usciteM }).sort()

  const monthLabel = (m: string) => {
    const [y, me] = m.split('-')
    return new Date(parseInt(y), parseInt(me) - 1).toLocaleString('it-IT', { month: 'short', year: '2-digit' }).replace('.', '')
  }

  if (!meses.length) {
    return <div className="text-center text-[rgba(255,255,255,0.3)] text-sm py-8">Nessun dato disponibile</div>
  }

  return (
    <Bar
      data={{
        labels: meses.map(monthLabel),
        datasets: [
          { label: 'Entrate', data: meses.map(m => entrateM[m] || 0), backgroundColor: '#10b981', borderRadius: 4 },
          { label: 'Uscite', data: meses.map(m => usciteM[m] || 0), backgroundColor: '#ef4444', borderRadius: 4 },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, font: { size: 11 }, color: 'rgba(255,255,255,0.7)' } },
        },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }, grid: { color: 'transparent' } },
          y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        },
      }}
    />
  )
}
