'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import QuickAddModal from './QuickAddModal'

export default function Fab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-15 bottom-[78px] right-4 w-14 h-14 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] text-white shadow-lg shadow-[rgba(124,58,237,0.4)] hover:shadow-xl hover:shadow-[rgba(124,58,237,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      >
        <Plus size={28} />
      </button>
      {open && <QuickAddModal onClose={() => setOpen(false)} />}
    </>
  )
}
