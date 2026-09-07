import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { customersApi } from '../../lib/api'
import { formatPrice, formatDate } from '../../lib/format'
import { Spinner, EmptyState } from '../../components/ui/Spinner'
import { Modal } from '../../components/ui/Modal'
import { StatusPill } from '../../components/admin/StatusPill'
import type { Customer } from '../../types'

export function Customers() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data: customers, isLoading } = useQuery({ queryKey: ['customers'], queryFn: customersApi.list })
  const { data: detail } = useQuery({
    queryKey: ['customer', selectedId],
    queryFn: () => customersApi.get(selectedId!),
    enabled: !!selectedId,
  })

  return (
    <div>
      <h2 className="mb-5 font-display text-2xl">Customers</h2>

      {isLoading ? (
        <Spinner />
      ) : !customers?.length ? (
        <EmptyState title="No customers yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand text-left text-xs uppercase tracking-widest text-ink-soft">
              <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Orders</th><th className="p-3">Lifetime Value</th><th className="p-3">Joined</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((c: Customer) => (
                <tr key={c.id} className="hover:bg-sand/40">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.order_count}</td>
                  <td className="p-3 font-semibold">{formatPrice(c.lifetime_value)}</td>
                  <td className="p-3 text-ink-soft">{formatDate(c.created_at)}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setSelectedId(c.id)} className="text-xs font-bold uppercase text-clay">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selectedId} onClose={() => setSelectedId(null)} title={detail?.name || 'Customer'} wide>
        {detail && (
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">{detail.email} · {detail.phone}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">Order History</p>
            {detail.orders?.length ? (
              <div className="divide-y divide-line border-y border-line">
                {detail.orders.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="font-medium">#{o.order_number}</span>
                    <StatusPill status={o.status} />
                    <span>{formatPrice(o.total)}</span>
                    <span className="text-ink-soft">{formatDate(o.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-soft">No orders yet.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
