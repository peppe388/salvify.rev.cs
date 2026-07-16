'use client'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Transaction, Category } from '@/lib/types'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export default function EditTransactionModal({
  transaction,
  categories,
  onClose,
}: {
  transaction: Transaction
  categories: Category[]
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [tipo, setTipo] = useState(transaction.tipo)
  const [importo, setImporto] = useState(String(transaction.importo))
  const [categoria, setCategoria] = useState(transaction.categoria)
  const [nota, setNota] = useState(transaction.nota)
  const [data, setData] = useState(transaction.data)

  const filtered = categories.filter(c => c.tipo === tipo)

  const updateMutation = useMutation({
    mutationFn: (data: Partial<{ tipo: string; importo: number; categoria: string; nota: string; data: string }>) =>
      api.updateTransaction(transaction.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transazione aggiornata')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  function handleSubmit() {
    const amt = parseFloat(importo)
    if (!amt || amt <= 0) { toast.error('Inserisci un importo valido'); return }
    updateMutation.mutate({
      tipo,
      importo: amt,
      categoria: categoria || filtered[0]?.nome || 'Altro',
      nota: nota || (tipo === 'uscita' ? 'Uscita' : 'Entrata'),
      data,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-overlay flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-border shadow-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-text">Modifica transazione</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-surface-hover">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3.5">
          <Select label="Tipo" value={tipo} onChange={e => { setTipo(e.target.value as 'entrata' | 'uscita'); setCategoria('') }}>
            <option value="uscita">Uscita</option>
            <option value="entrata">Entrata</option>
          </Select>

          <Input label="Importo" type="number" value={importo} onChange={e => setImporto(e.target.value)} placeholder="0.00" step="0.01" min="0" />

          <Select label="Categoria" value={categoria} onChange={e => setCategoria(e.target.value)}>
            {filtered.map(c => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
          </Select>

          <Input label="Nota" type="text" value={nota} onChange={e => setNota(e.target.value)} placeholder="Descrizione..." />

          <Input label="Data" type="date" value={data} onChange={e => setData(e.target.value)} />

          <Button onClick={handleSubmit} loading={updateMutation.isPending} className="w-full" size="lg">
            Salva modifiche
          </Button>
        </div>
      </div>
    </div>
  )
}
