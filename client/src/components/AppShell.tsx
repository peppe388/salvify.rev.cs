'use client'
import { ReactNode } from 'react'
import Particles from './Particles'
import BottomNav from './BottomNav'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <Particles />
      <div className="relative z-10 h-screen overflow-y-auto scrollbar-thin">
        <div className="max-w-lg mx-auto px-5 pt-4 pb-28">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
