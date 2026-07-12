'use client'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.push(user ? '/dashboard' : '/login')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#05050a' }}>
      <div className="w-12 h-12 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
