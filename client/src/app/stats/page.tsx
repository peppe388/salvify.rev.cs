'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Transaction, Category } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import InsightGrid from '@/components/InsightGrid'
import { CategoryChart, MonthlyChart } from '@/components/Charts'

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    setError(null)
    Promise.all([api.getTransactions(), api.getCategories()])
      .then(([t, c]) => {
        setTransactions(t)
        setCategories(c)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingData(false))
  }, [user])

  const currency = user?.currency || '€'

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050a]">
        <div className="w-10 h-10 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05050a] text-[#ef4444] text-sm">
        <p>Errore: {error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-[#7c3aed]">Riprova</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05050a] pb-[80px]">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h2 className="text-base font-bold text-[#f1f5f9] mb-4">Statistiche</h2>

        <InsightGrid transactions={transactions} currency={currency} />

        <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-[18px] p-4 mb-3.5">
          <h3 className="text-sm font-semibold text-[#f1f5f9] mb-2.5">Uscite per categoria</h3>
          <CategoryChart transactions={transactions} categories={categories} />
        </div>

        <div className="bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-[18px] p-4 mb-3.5">
          <h3 className="text-sm font-semibold text-[#f1f5f9] mb-2.5">Andamento mensile</h3>
          <MonthlyChart transactions={transactions} />
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
