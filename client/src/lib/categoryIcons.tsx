import {
  ShoppingCart, Home, Utensils, Car, Heart, Zap, Smartphone,
  Music, Plane, Gift, Book, Coffee, Briefcase, DollarSign,
  TrendingUp, PiggyBank, Shirt, Gamepad2, Pill, GraduationCap,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  'Alimentari': ShoppingCart,
  'Casa': Home,
  'Ristoranti': Utensils,
  'Trasporti': Car,
  'Salute': Heart,
  'Bollette': Zap,
  'Tecnologia': Smartphone,
  'Intrattenimento': Music,
  'Viaggi': Plane,
  'Regali': Gift,
  'Scuola': Book,
  'Caffè': Coffee,
  'Lavoro': Briefcase,
  'Stipendio': DollarSign,
  'Investimenti': TrendingUp,
  'Risparmio': PiggyBank,
  'Abbigliamento': Shirt,
  'Giochi': Gamepad2,
  'Farmacia': Pill,
  'Formazione': GraduationCap,
}

const fallbackFallback: LucideIcon = DollarSign

export function getCategoryIcon(name: string): LucideIcon {
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return iconMap[name] || fallbackFallback
}

export function getCategoryColor(name: string, tipo: string): string {
  if (tipo === 'entrata') return 'text-success'
  const colors = ['text-brand-400', 'text-danger', 'text-warning', 'text-pink-400', 'text-blue-400', 'text-teal-400', 'text-orange-400', 'text-cyan-400']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return colors[Math.abs(hash) % colors.length]
}
