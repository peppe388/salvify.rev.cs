'use client'
import { Transaction, Category } from '@/lib/types'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const COLORS = ['#6C5CE7', '#00B894', '#E17055', '#FDCB6E', '#e84393', '#0984e3', '#00cec9', '#a29bfe', '#fdcb6e', '#6c5ce7', '#e17055', '#00b894']

function getThemeColor(variable: string): string {
  if (typeof document === 'undefined') return '#f1f2f6'
  const val = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  return val || '#f1f2f6'
}

export function CategoryChart({ transactions, categories }: { transactions: Transaction[]; categories: Category[] }) {
  const uscite = transactions.filter(t => t.tipo === 'uscita' && !t.isRoundUp)
  const byCat: Record<string, number> = {}
  uscite.forEach(t => { byCat[t.categoria] = (byCat[t.categoria] || 0) + t.importo })
  const labels = Object.keys(byCat)
  const values = Object.values(byCat)

  if (!labels.length) {
    return <div className="text-center text-text-dim text-sm py-8">Nessun dato disponibile</div>
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
          legend: { position: 'right', labels: { boxWidth: 10, padding: 8, font: { size: 11 }, color: getThemeColor('--text-muted') } },
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
    return <div className="text-center text-text-dim text-sm py-8">Nessun dato disponibile</div>
  }

  const textColor = getThemeColor('--text-muted')
  const gridColor = getThemeColor('--border')

  return (
    <Bar
      data={{
        labels: meses.map(monthLabel),
        datasets: [
          { label: 'Entrate', data: meses.map(m => entrateM[m] || 0), backgroundColor: '#00B894', borderRadius: 4 },
          { label: 'Uscite', data: meses.map(m => usciteM[m] || 0), backgroundColor: '#E17055', borderRadius: 4 },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, font: { size: 11 }, color: textColor } },
        },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: 'transparent' } },
          y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
        },
      }}
    />
  )
}
