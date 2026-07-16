export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function SkeletonTransaction() {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border">
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTransaction key={i} />
      ))}
    </div>
  )
}
