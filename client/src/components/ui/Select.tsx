'use client'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = '', children, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-surface border border-border text-text outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
)
Select.displayName = 'Select'
