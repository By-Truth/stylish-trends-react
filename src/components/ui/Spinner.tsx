import type { ReactNode } from 'react'

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink" />
    </div>
  )
}

export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-xl font-light">{title}</p>
      {subtitle && <p className="mt-2 max-w-sm text-sm text-ink-soft">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
