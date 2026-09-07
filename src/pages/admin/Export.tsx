import { exportUrl } from '../../lib/api'

export function Export() {
  return (
    <div>
      <h2 className="mb-5 font-display text-2xl">Export Data</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <p className="font-display text-lg">Orders</p>
          <p className="mt-1 text-sm text-ink-soft">Download every order with status, payment, and totals as a CSV file.</p>
          <a href={exportUrl('orders')} className="btn-outline mt-4 inline-flex">Download Orders CSV</a>
        </div>
        <div className="card p-6">
          <p className="font-display text-lg">Products</p>
          <p className="mt-1 text-sm text-ink-soft">Download your full product catalogue with pricing and stock as a CSV file.</p>
          <a href={exportUrl('products')} className="btn-outline mt-4 inline-flex">Download Products CSV</a>
        </div>
      </div>
    </div>
  )
}
