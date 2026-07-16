'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Category, Pocket } from '@/lib/types'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export default function QuickAddModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [tipo, setTipo] = useState('uscita')
  const [importo, setImporto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pocketId, setPocketId] = useState('')
  const [nota, setNota] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  })

  const { data: pockets = [] } = useQuery({
    queryKey: ['pockets'],
    queryFn: api.getPockets,
  })

  const createMutation = useMutation({
    mutationFn: (data: { tipo: string; importo: number; categoria: string; nota: string; data: string; pocketId: number | null }) =>
      api.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['pockets'] })
      toast.success('Transazione salvata')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const filtered = categories.filter(c => c.tipo === tipo)

  async function handleSubmit() {
    const amt = parseFloat(importo)
    if (!amt || amt <= 0) { toast.error('Inserisci un importo valido'); return }
    createMutation.mutate({
      tipo, importo: amt,
      categoria: categoria || filtered[0]?.nome || 'Altro',
      nota: nota || (tipo === 'uscita' ? 'Uscita' : 'Entrata'),
      data, pocketId: pocketId ? parseInt(pocketId) : null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-overlay flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-border shadow-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-text">Nuova transazione</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-surface-hover">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3.5">
          <Select label="Tipo" value={tipo} onChange={e => { setTipo(e.target.value); setCategoria('') }}>
            <option value="uscita">Uscita</option>
            <option value="entrata">Entrata</option>
          </Select>

          <Input label="Importo" type="number" value={importo} onChange={e => setImporto(e.target.value)} placeholder="0.00" step="0.01" min="0" />

          <Select label="Categoria" value={categoria} onChange={e => setCategoria(e.target.value)}>
            {filtered.map(c => <option key={c.id} value={c.nome}>{c.icona} {c.nome}</option>)}
          </Select>

          <Select label="Pocket" value={pocketId} onChange={e => setPocketId(e.target.value)}>
            <option value="">— Nessuno —</option>
            {pockets.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </Select>

          <Input label="Nota" type="text" value={nota} onChange={e => setNota(e.target.value)} placeholder="Descrizione..." />

          <Input label="Data" type="date" value={data} onChange={e => setData(e.target.value)} />

          <Button onClick={handleSubmit} loading={createMutation.isPending} className="w-full" size="lg">
            Salva transazione
          </Button>
        </div>
      </div>
    </div>
  )
}
