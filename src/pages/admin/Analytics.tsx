import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { Spinner } from '../../components/ui/Spinner'
import { StatCard } from '../../components/admin/StatCard'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function Analytics() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats })
  if (isLoading || !stats) return <Spinner />

  const yearTotal = stats.monthly_revenue.reduce((sum: number, m: any) => sum + Number(m.rev), 0)
  const maxRev = Math.max(...stats.monthly_revenue.map((m: any) => Number(m.rev)), 1)

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Sales Analytics</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Year-to-Date Revenue" value={formatPrice(yearTotal)} />
        <StatCard label="This Month" value={formatPrice(stats.revenue_month)} accent="var(--color-ink)" />
        <StatCard label="Total Orders" value={String(stats.total_orders)} accent="var(--color-moss)" />
      </div>

      <div className="card p-5">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-soft">Revenue by Month</p>
        <div className="flex h-56 items-end gap-3">
          {MONTHS.map((m, i) => {
            const found = stats.monthly_revenue.find((r: any) => Number(r.m) === i + 1)
            const rev = found ? Number(found.rev) : 0
            return (
              <div key={m} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[0.6rem] text-ink-soft">{rev > 0 ? formatPrice(rev) : ''}</span>
                <div className="w-full bg-clay" style={{ height: `${Math.max((rev / maxRev) * 160, rev > 0 ? 4 : 1)}px` }} />
                <span className="text-[0.65rem] text-ink-soft">{m}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-soft">Top Products by Units Sold</p>
        <div className="space-y-3">
          {stats.top_products.map((p: any, i: number) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="w-5 text-sm font-semibold text-ink-soft">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="font-semibold">{p.sold} sold</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-sand">
                  <div className="h-full bg-clay" style={{ width: `${(p.sold / stats.top_products[0].sold) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
