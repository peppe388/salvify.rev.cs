'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Category, Pocket } from '@/lib/types'

export default function QuickAddModal({ onClose }: { onClose: () => void }) {
  const [tipo, setTipo] = useState('uscita')
  const [importo, setImporto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pocketId, setPocketId] = useState('')
  const [nota, setNota] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [categories, setCategories] = useState<Category[]>([])
  const [pockets, setPockets] = useState<Pocket[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getCategories().then(setCategories)
    api.getPockets().then(setPockets)
  }, [])

  const filtered = categories.filter(c => c.tipo === tipo)

  async function handleSubmit() {
    const amt = parseFloat(importo)
    if (!amt || amt <= 0) { alert('Inserisci un importo valido'); return }
    setLoading(true)
    try {
      await api.createTransaction({
        tipo, importo: amt,
        categoria: categoria || filtered[0]?.nome || 'Altro',
        nota: nota || (tipo === 'uscita' ? 'Uscita' : 'Entrata'),
        data, pocketId: pocketId ? parseInt(pocketId) : null,
      })
      onClose()
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-[#111118] rounded-t-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.23, 1, 0.32, 1)' }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
        <div className="w-9 h-1 bg-[rgba(255,255,255,0.15)] rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-bold text-[#f1f5f9] mb-4">Nuova transazione</h2>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1">Tipo</label>
            <select value={tipo} onChange={e => { setTipo(e.target.value); setCategoria('') }}
              className="w-full px-3.5 py-3 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors">
              <option value="uscita">Uscita</option>
              <option value="entrata">Entrata</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1">Importo (€)</label>
            <input type="number" value={importo} onChange={e => setImporto(e.target.value)} placeholder="0.00" step="0.01" min="0"
              className="w-full px-3.5 py-3 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1">Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)}
              className="w-full px-3.5 py-3 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors">
              {filtered.map(c => <option key={c.id} value={c.nome}>{c.icona} {c.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1">Pocket</label>
            <select value={pocketId} onChange={e => setPocketId(e.target.value)}
              className="w-full px-3.5 py-3 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors">
              <option value="">— Nessuno —</option>
              {pockets.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1">Nota</label>
            <input type="text" value={nota} onChange={e => setNota(e.target.value)} placeholder="Descrizione..."
              className="w-full px-3.5 py-3 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-[rgba(255,255,255,0.55)] mb-1">Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)}
              className="w-full px-3.5 py-3 rounded-lg text-sm bg-[rgba(20,20,30,0.85)] border border-[rgba(255,255,255,0.06)] text-[#f1f5f9] outline-none focus:border-[#7c3aed] transition-colors" />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 rounded-lg font-bold text-sm bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white shadow-lg shadow-[rgba(124,58,237,0.3)] hover:shadow-xl transition-all disabled:opacity-50">
            {loading ? 'Salvataggio...' : 'Salva transazione'}
          </button>
        </div>
      </div>
    </div>
  )
}
