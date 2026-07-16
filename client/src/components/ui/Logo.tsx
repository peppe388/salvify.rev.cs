export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }
  return (
    <div className={`font-extrabold tracking-tight ${sizes[size]} text-text`}>
      <span className="text-brand-500">S</span>
      <span className="text-text">alvify</span>
    </div>
  )
}

export function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-brand-500/30 ${className}`}>
      S
    </div>
  )
}
