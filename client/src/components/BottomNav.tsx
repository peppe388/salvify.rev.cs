'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Home, CreditCard, ArrowLeftRight, BarChart3, Settings } from 'lucide-react'

const items = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/carte', label: 'Carte', icon: CreditCard },
  { href: '/movimenti', label: 'Movimenti', icon: ArrowLeftRight },
  { href: '/stats', label: 'Statistiche', icon: BarChart3 },
  { href: '/profilo', label: 'Profilo', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[rgba(255,255,255,0.04)] bg-[rgba(13,13,20,0.95)] backdrop-blur-xl">
      <div className="flex justify-around items-center h-[62px] max-w-md mx-auto px-2">
        {items.map(item => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative text-[10px] font-medium ${
                active ? 'text-[#7c3aed]' : 'text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.55)]'
              }`}
            >
              {active && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#7c3aed] rounded-b-sm" />
              )}
              <Icon size={20} className={`transition-transform ${active ? '-translate-y-0.5' : ''}`} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
