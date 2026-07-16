'use client'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-surface border border-border text-text outline-none transition-colors placeholder:text-text-dim focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-danger mt-1">{error}</p>
      )}
    </div>
  )
)
Input.displayName = 'Input'
