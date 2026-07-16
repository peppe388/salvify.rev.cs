'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'
import InsightGrid from '@/components/InsightGrid'
import { CategoryChart, MonthlyChart } from '@/components/Charts'
import { Card } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { AuthGuard } from '@/components/AuthGuard'

export default function StatsPage() {
  return (
    <AuthGuard>
      <StatsContent />
    </AuthGuard>
  )
}

function StatsContent() {
  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: api.getTransactions,
  })

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  })

  if (txLoading || catLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-4">
          <div className="h-6 w-32 skeleton-shimmer rounded-lg" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        <h2 className="text-lg font-bold text-text mb-5">Statistiche</h2>
        <InsightGrid transactions={transactions} currency="€" />
        <Card className="mb-3.5">
          <h3 className="text-sm font-semibold text-text mb-3">Uscite per categoria</h3>
          <CategoryChart transactions={transactions} categories={categories} />
        </Card>
        <Card className="mb-3.5">
          <h3 className="text-sm font-semibold text-text mb-3">Andamento mensile</h3>
          <MonthlyChart transactions={transactions} />
        </Card>
      </div>
    </AppShell>
  )
}
