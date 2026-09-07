const COLORS: Record<string, string> = {
  pending: 'bg-clay-soft text-clay-dark',
  processing: 'bg-black/5 text-ink',
  dispatched: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  unpaid: 'bg-clay-soft text-clay-dark',
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider ${
        COLORS[status] || 'bg-black/5 text-ink'
      }`}
    >
      {status}
    </span>
  )
}
