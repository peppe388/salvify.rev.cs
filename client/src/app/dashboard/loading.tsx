import { SkeletonCard, SkeletonList } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-5 pt-16 pb-28 space-y-6">
        <div className="space-y-3 text-center">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
        <SkeletonList count={4} />
      </div>
    </div>
  )
}
