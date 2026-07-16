'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'
import PocketCard from '@/components/PocketCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { AuthGuard } from '@/components/AuthGuard'
import { CreditCard, Plus } from 'lucide-react'

const colors = [
  { value: 'purple', label: 'Viola' },
  { value: 'gold', label: 'Oro' },
  { value: 'green', label: 'Verde' },
  { value: 'pink', label: 'Rosa' },
  { value: 'blue', label: 'Blu' },
]

export default function CartePage() {
  return (
    <AuthGuard>
      <CarteContent />
    </AuthGuard>
  )
}

function CarteContent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [nome, setNome] = useState('')
  const [colore, setColore] = useState('purple')

  const { data: pockets = [], isLoading } = useQuery({
    queryKey: ['pockets'],
    queryFn: api.getPockets,
  })

  const createMutation = useMutation({
    mutationFn: (data: { nome: string; colore: string }) => api.createPocket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pockets'] })
      toast.success('Pocket creato')
      setNome('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deletePocket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pockets'] })
      toast.success('Pocket eliminato')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const currency = user?.currency || '€'
  const hide = user?.hideBalance || false
  const total = pockets.reduce((s, p) => s + p.saldo, 0)
  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`

  function handleAdd() {
    if (!nome.trim()) { toast.error('Inserisci un nome'); return }
    createMutation.mutate({ nome: nome.trim(), colore })
  }

  function handleDelete(id: number) {
    if (!window.confirm('Eliminare questo pocket?')) return
    deleteMutation.mutate(id)
  }

  if (isLoading) {
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
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-text">I tuoi pocket</h2>
        </div>
        <p className="text-xs text-text-muted mb-5">Totale pocket: {fmt(total)}</p>

        {pockets.length === 0 ? (
          <EmptyState
            icon={<CreditCard size={28} />}
            title="Nessun pocket"
            description="Crea un pocket per organizzare i tuoi risparmi per obiettivo"
          />
        ) : (
          pockets.map(p => (
            <PocketCard key={p.id} pocket={p} currency={currency} onDelete={handleDelete} hideAmount={hide} />
          ))
        )}

        <Card className="!p-5 mt-5">
          <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
            <Plus size={16} className="text-brand-500" />
            Nuovo pocket
          </h3>
          <div className="space-y-3.5">
            <Input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Es. Viaggio, Emergenza..."
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Select value={colore} onChange={e => setColore(e.target.value)}>
              {colors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
            <Button onClick={handleAdd} loading={createMutation.isPending} className="w-full">
              Crea pocket
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
