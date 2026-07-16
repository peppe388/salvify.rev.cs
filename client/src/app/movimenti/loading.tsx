import { SkeletonCard, SkeletonList } from '@/components/ui/Skeleton'

export default function MovimentiLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-4">
        <div className="h-6 w-32 skeleton-shimmer rounded-lg" />
        <SkeletonCard />
        <SkeletonList count={8} />
      </div>
    </div>
  )
}
