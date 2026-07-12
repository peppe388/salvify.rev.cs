'use client'
import { useState, useRef } from 'react'

export default function Card3D({ saldo, nome, currency }: { saldo: number; nome: string; currency: string }) {
  const [flipped, setFlipped] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  function handleMouseMove(e: React.MouseEvent) {
    if (flipped) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotateX(-y * 12)
    setRotateY(x * 12)
  }

  function handleMouseLeave() {
    if (!flipped) { setRotateX(0); setRotateY(0) }
  }

  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`

  return (
    <div className="perspective-[1000px] mb-5">
      <div
        ref={ref}
        onClick={() => setFlipped(!flipped)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${flipped ? 'rotateY(180deg)' : ''}` }}
        className="relative w-full h-[200px] rounded-[18px] cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]"
      >
        {/* FRONT */}
        <div className="absolute inset-0 rounded-[18px] p-6 flex flex-col justify-between overflow-hidden [backface-visibility:hidden] bg-gradient-to-br from-[#2d1b69] to-[#11998e] shadow-lg shadow-[rgba(45,27,105,0.3)]">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="flex justify-between items-start text-white/90 text-sm">
            <span>saldo</span>
            <div className="w-10 h-[30px] rounded-[5px] bg-gradient-to-br from-yellow-400 to-yellow-500 relative overflow-hidden">
              <div className="absolute inset-[5px] border border-black/20 rounded-[3px]" />
            </div>
          </div>
          <div>
            <div className="text-white/70 text-[11px] uppercase tracking-wider mb-1">Disponibile</div>
            <div className="text-white text-[30px] font-extrabold tracking-tight drop-shadow-sm">{fmt(saldo)}</div>
          </div>
          <div className="flex justify-between items-end text-white/80 text-xs tracking-wider">
            <div className="font-mono text-base tracking-widest">•••• •••• •••• 8492</div>
            <div className="text-right">
              <div className="text-[9px] opacity-60">TITOLARE</div>
              <div className="text-[11px]">{nome}</div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 rounded-[18px] [backface-visibility:hidden] bg-gradient-to-br from-[#11998e] to-[#2d1b69] [transform:rotateY(180deg)] flex flex-col justify-between shadow-lg shadow-[rgba(45,27,105,0.3)]">
          <div className="absolute top-[30px] left-0 w-full h-10 bg-black/30" />
          <div className="flex-1" />
          <div className="px-5 pb-6 flex justify-between items-end text-white/80 text-xs">
            <div className="text-white/70 font-mono text-sm">CCV: 123</div>
            <div className="text-white/50 text-[9px] tracking-wider">saldo virtuale</div>
          </div>
        </div>
      </div>
    </div>
  )
}
