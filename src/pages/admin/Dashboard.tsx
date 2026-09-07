import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../../lib/api'
import { StatCard } from '../../components/admin/StatCard'
import { Spinner } from '../../components/ui/Spinner'
import { formatPrice } from '../../lib/format'
import { useAuthStore } from '../../store/auth'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats })

  if (isLoading || !stats) return <Spinner />

  const maxRev = Math.max(...stats.monthly_revenue.map((m: any) => Number(m.rev)), 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-ink p-6 text-cream">
        <div>
          <p className="font-display text-xl">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
          <p className="mt-1 text-sm text-cream/50">Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products" className="btn-clay">+ Add Product</Link>
          <Link to="/admin/orders" className="btn-outline border-white text-white hover:bg-white hover:text-ink">View Orders</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (This Month)" value={formatPrice(stats.revenue_month)} accent="var(--color-clay)" />
        <StatCard label="Total Orders" value={String(stats.total_orders)} accent="var(--color-ink)" />
        <StatCard label="New Customers (30d)" value={String(stats.new_customers)} accent="var(--color-moss)" />
        <StatCard label="Pending Orders" value={String(stats.pending_orders)} accent="var(--color-rust)" hint={stats.pending_orders > 0 ? 'Needs attention' : undefined} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="card p-5">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-soft">Monthly Revenue ({new Date().getFullYear()})</p>
          <div className="flex h-40 items-end gap-2">
            {MONTHS.map((m, i) => {
              const monthNum = i + 1
              const found = stats.monthly_revenue.find((r: any) => Number(r.m) === monthNum)
              const rev = found ? Number(found.rev) : 0
              return (
                <div key={m} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className="w-full bg-clay transition-all"
                    style={{ height: `${Math.max((rev / maxRev) * 140, rev > 0 ? 4 : 1)}px` }}
                    title={formatPrice(rev)}
                  />
                  <span className="text-[0.6rem] text-ink-soft">{m}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-5">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-soft">Low Stock Alert</p>
          <p className="font-display text-3xl">{stats.low_stock}</p>
          <p className="mt-1 text-sm text-ink-soft">products at 3 units or fewer</p>
          <Link to="/admin/products" className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-clay">
            Manage Inventory →
          </Link>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-soft">Top Selling Products</p>
        <div className="space-y-3">
          {stats.top_products.map((p: any) => (
            <div key={p.name} className="flex items-center justify-between text-sm">
              <span>{p.name}</span>
              <span className="font-semibold text-clay">{p.sold} sold</span>
            </div>
          ))}
          {stats.top_products.length === 0 && <p className="text-sm text-ink-soft">No sales yet.</p>}
        </div>
      </div>
    </div>
  )
}
