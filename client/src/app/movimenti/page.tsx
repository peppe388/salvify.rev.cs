'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'
import TransactionItem from '@/components/TransactionItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList, SkeletonCard } from '@/components/ui/Skeleton'
import { AuthGuard } from '@/components/AuthGuard'
import { Search, Filter } from 'lucide-react'

export default function MovimentiPage() {
  return (
    <AuthGuard>
      <MovimentiContent />
    </AuthGuard>
  )
}

function MovimentiContent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: api.getTransactions,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transazione eliminata')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const currency = user?.currency || '€'
  const hide = user?.hideBalance || false

  let list = [...transactions].filter(t => !t.isRoundUp).sort((a, b) => b.id - a.id)
  if (search) list = list.filter(t => t.nota.toLowerCase().includes(search.toLowerCase()) || t.categoria.toLowerCase().includes(search.toLowerCase()))
  if (filterCat !== 'all') list = list.filter(t => t.categoria === filterCat)

  function deleteTransaction(id: number) {
    if (!window.confirm('Eliminare questa transazione?')) return
    deleteMutation.mutate(id)
  }

  if (txLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-4">
          <div className="h-6 w-32 skeleton-shimmer rounded-lg" />
          <SkeletonCard />
          <SkeletonList count={8} />
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        <h2 className="text-lg font-bold text-text mb-5">Movimenti</h2>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca transazioni..."
              className="w-full pl-8 pr-3 py-2.5 rounded-lg text-sm bg-surface border border-border text-text outline-none transition-colors placeholder:text-text-dim focus:border-brand-500" />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="pl-8 pr-3 py-2.5 rounded-lg text-sm bg-surface border border-border text-text outline-none transition-colors focus:border-brand-500 appearance-none">
              <option value="all">Tutte</option>
              {categories.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={<Search size={28} />}
            title="Nessuna transazione"
            description={search || filterCat !== 'all' ? 'Prova a modificare i filtri di ricerca' : 'Aggiungi la tua prima transazione'}
          />
        ) : (
          <div>
            {list.map(t => (
              <TransactionItem key={t.id} t={t} currency={currency} onDelete={deleteTransaction} hideAmount={hide} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
