export function StatCard({
  label,
  value,
  accent = 'var(--color-clay)',
  hint,
}: {
  label: string
  value: string
  accent?: string
  hint?: string
}) {
  return (
    <div className="card p-5" style={{ borderLeft: `3px solid ${accent}` }}>
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink-soft">{label}</p>
      <p className="font-display mt-2 text-3xl font-light">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  )
}
