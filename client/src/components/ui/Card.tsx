'use client'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = true, className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-surface border border-border rounded-xl ${padding ? 'p-4' : ''} ${className}`}
      {...props}
    />
  )
)
Card.displayName = 'Card'
