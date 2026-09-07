import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ordersApi } from '../../lib/api'
import { formatPrice, formatDateTime } from '../../lib/format'
import { Spinner, EmptyState } from '../../components/ui/Spinner'
import { StatusPill } from '../../components/admin/StatusPill'
import { Modal } from '../../components/ui/Modal'
import type { Order } from '../../types'

const STATUSES = ['pending', 'processing', 'dispatched', 'delivered', 'cancelled', 'refunded']

export function Orders() {
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [tracking, setTracking] = useState('')
  const qc = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', filter],
    queryFn: () => ordersApi.list(filter || undefined),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      ordersApi.updateStatus(id, { status, tracking_number: tracking || undefined }),
    onSuccess: () => {
      toast.success('Order updated')
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setSelected(null)
      setTracking('')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">Orders</h2>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !orders?.length ? (
        <EmptyState title="No orders yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand text-left text-xs uppercase tracking-widest text-ink-soft">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o: Order) => (
                <tr key={o.id} className="hover:bg-sand/40">
                  <td className="p-3 font-semibold">#{o.order_number}</td>
                  <td className="p-3">{o.cust_name}</td>
                  <td className="p-3">{o.item_count}</td>
                  <td className="p-3 font-medium">{formatPrice(o.total)}</td>
                  <td className="p-3"><StatusPill status={o.payment_status} /></td>
                  <td className="p-3"><StatusPill status={o.status} /></td>
                  <td className="p-3 text-ink-soft">{formatDateTime(o.created_at)}</td>
                  <td className="p-3">
                    <button onClick={() => setSelected(o)} className="text-xs font-bold uppercase text-clay">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order #${selected?.order_number}`}>
        {selected && (
          <div className="space-y-4">
            <div className="text-sm">
              <p><strong>{selected.cust_name}</strong></p>
              <p className="text-ink-soft">{selected.cust_email} · {selected.cust_phone}</p>
              <p className="text-ink-soft">{selected.ship_address}, {selected.ship_city}, {selected.ship_state}</p>
            </div>
            <div className="flex justify-between border-y border-line py-3 text-sm">
              <span>Total</span>
              <span className="font-semibold">{formatPrice(selected.total)}</span>
            </div>
            <div>
              <label className="label">Update Status</label>
              <select
                className="input"
                defaultValue={selected.status}
                onChange={(e) => updateStatus.mutate({ id: selected.id, status: e.target.value })}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tracking Number</label>
              <input className="input" placeholder="e.g. GIG-2394872" value={tracking} onChange={(e) => setTracking(e.target.value)} />
              <button
                onClick={() => updateStatus.mutate({ id: selected.id, status: 'dispatched' })}
                className="btn-outline mt-2 w-full"
              >
                Save Tracking & Mark Dispatched
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
