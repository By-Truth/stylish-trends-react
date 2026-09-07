import type { ReactNode } from 'react'

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10" onClick={onClose}>
      <div
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} bg-paper p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl">{title}</h3>
          <button onClick={onClose} className="text-xl text-ink-soft hover:text-ink" aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
