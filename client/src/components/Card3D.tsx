'use client'
import { useState, useRef, useMemo } from 'react'

export default function Card3D({
  saldo,
  nome,
  currency,
  onClick,
  userId,
}: {
  saldo: number
  nome: string
  currency: string
  onClick?: () => void
  userId?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glow, setGlow] = useState({ x: 50, y: 50 })

  const lastFour = useMemo(() => {
    const n = (userId || Math.floor(Math.random() * 10000)) % 10000
    return String(n).padStart(4, '0')
  }, [userId])

  const expiry = useMemo(() => {
    const now = new Date()
    const y = (now.getFullYear() + 3) % 100
    const m = String(now.getMonth() + 1).padStart(2, '0')
    return `${m}/${y}`
  }, [])

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setRotateX(-(y - 0.5) * 8)
    setRotateY((x - 0.5) * 8)
    setGlow({ x: x * 100, y: y * 100 })
  }

  function handleMouseLeave() {
    setRotateX(0)
    setRotateY(0)
    setGlow({ x: 50, y: 50 })
  }

  const fmt = (n: number) => `${currency} ${n.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`

  return (
    <div className="perspective-[1000px] mb-5 select-none">
      <div
        ref={ref}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="relative w-full h-[220px] rounded-2xl cursor-pointer [transform-style:preserve-3d] overflow-hidden"
      >
        {/* Gradiente base */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#1e1e3a] to-[#0d0d1a]" />

        {/* Shine dinamico che segue il mouse */}
        <div
          className="absolute inset-0 rounded-2xl opacity-[0.12] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
          }}
        />

        {/* Sovrapposizione metallica */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] via-transparent to-black/30" />

        {/* Pattern esagonale sottile */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l17.32 10v20L20 40 2.68 30V10z' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }} />

        {/* Bagliori angolari */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-400/8 rounded-full blur-3xl pointer-events-none" />

        {/* Contenuto */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6">
          {/* Top row: brand + chip */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white/70 text-xs font-bold tracking-[4px]">SALVIFY</div>
            </div>
            <div className="flex items-center gap-2.5">
              {/* Chip SVG */}
              <svg width="38" height="28" viewBox="0 0 38 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                <rect x="0.5" y="0.5" width="37" height="27" rx="3.5" fill="url(#chip-grad)" stroke="rgba(0,0,0,0.15)" />
                <rect x="4" y="3" width="30" height="22" rx="2" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
                <path d="M19 7v14M12 10l7 4l-7 4M26 10l-7 4l7 4" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
                <rect x="16" y="10" width="6" height="8" rx="1" fill="rgba(0,0,0,0.06)" />
                <defs>
                  <linearGradient id="chip-grad" x1="0" y1="0" x2="38" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FCD34D" />
                    <stop offset="0.5" stopColor="#F59E0B" />
                    <stop offset="1" stopColor="#D97706" />
                  </linearGradient>
                </defs>
              </svg>
              {/* NFC */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                <path d="M7 12a5 5 0 0 1 10 0M9.5 12a2.5 2.5 0 0 1 5 0M12 14.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
                <path d="M4 12a8 8 0 0 1 16 0M6.5 12a5.5 5.5 0 0 1 11 0" strokeWidth="1" opacity="0.4" />
              </svg>
            </div>
          </div>

          {/* Spazio flessibile */}
          <div className="flex-1" />

          {/* Saldo centrato */}
          <div className="text-center mb-1">
            <div className="text-white/45 text-[10px] uppercase tracking-[2px] mb-1">Disponibile</div>
            <div className="text-white text-[30px] font-extrabold tracking-tight drop-shadow-lg leading-none">
              {fmt(saldo)}
            </div>
          </div>

          {/* Spazio */}
          <div className="flex-1" />

          {/* Bottom section: nome + dettagli */}
          <div>
            {/* Nome grande in evidenza */}
            <div className="text-white/90 text-xl font-extrabold tracking-wide mb-2 drop-shadow-sm">
              {nome.toUpperCase()}
            </div>

            {/* Ultime cifre + scadenza */}
            <div className="flex justify-between items-end">
              <div className="font-mono text-white/50 text-sm tracking-[4px]">
                •••• {lastFour}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-white/35 text-[9px] uppercase tracking-[1px]">Scad.</div>
                  <div className="text-white/70 text-xs font-medium">{expiry}</div>
                </div>
                {/* Visa logo */}
                <svg width="44" height="14" viewBox="0 0 44 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                  <rect width="44" height="14" rx="2" fill="#1A1F71" />
                  <text x="4" y="11" fontFamily="Arial" fontSize="9" fontWeight="800" fill="white">VISA</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
