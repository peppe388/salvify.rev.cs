'use client'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CreditCard, ArrowLeftRight, BarChart3, User } from 'lucide-react'
import { useState } from 'react'
import QuickAddModal from './QuickAddModal'

const items = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/carte', label: 'Pocket', icon: CreditCard },
  { href: '/movimenti', label: 'Movimenti', icon: ArrowLeftRight },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/profilo', label: 'Profilo', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [fabOpen, setFabOpen] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-bg via-bg to-transparent pb-safe">
        <div className="max-w-2xl mx-auto flex justify-around items-center h-[72px] px-2">
          {items.map(item => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center justify-center gap-1 w-14 h-full rounded-2xl transition-all relative ${
                  active ? 'text-brand-500' : 'text-text-muted hover:text-text'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  active ? 'bg-brand-500/10' : ''
                }`}>
                  <Icon size={active ? 20 : 18} />
                </div>
                <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* FAB fluttuante */}
        <button
          onClick={() => setFabOpen(true)}
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center shadow-xl shadow-brand-500/40 hover:shadow-brand-500/60 hover:scale-105 active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10 4v12M4 10h12" />
          </svg>
        </button>
      </nav>
      {fabOpen && <QuickAddModal onClose={() => setFabOpen(false)} />}
    </>
  )
}
