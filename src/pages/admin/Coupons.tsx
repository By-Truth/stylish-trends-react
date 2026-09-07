import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { couponsAdminApi } from '../../lib/api'
import { formatPrice, formatDate } from '../../lib/format'
import { Spinner, EmptyState } from '../../components/ui/Spinner'
import { Modal } from '../../components/ui/Modal'
import type { Coupon } from '../../types'

const emptyForm = { id: 0, code: '', type: 'percent', value: '', min_order: '0', max_uses: '0', expires_at: '' }

export function Coupons() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const qc = useQueryClient()

  const { data: coupons, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: couponsAdminApi.list })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        code: form.code,
        type: form.type,
        value: parseFloat(form.value) || 0,
        min_order: parseFloat(form.min_order) || 0,
        max_uses: parseInt(form.max_uses) || 0,
        expires_at: form.expires_at || null,
      }
      return form.id ? couponsAdminApi.update(form.id, payload) : couponsAdminApi.create(payload)
    },
    onSuccess: () => { toast.success('Saved'); qc.invalidateQueries({ queryKey: ['coupons'] }); setModalOpen(false) },
    onError: (e: Error) => toast.error(e.message),
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: number }) => couponsAdminApi.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => couponsAdminApi.remove(id),
    onSuccess: () => { toast.success('Removed'); qc.invalidateQueries({ queryKey: ['coupons'] }) },
  })

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl">Coupons</h2>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true) }} className="btn-primary">+ Add Coupon</button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !coupons?.length ? (
        <EmptyState title="No coupons yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand text-left text-xs uppercase tracking-widest text-ink-soft">
              <tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Min Order</th><th className="p-3">Uses</th><th className="p-3">Expires</th><th className="p-3">Active</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((c: Coupon) => (
                <tr key={c.id} className="hover:bg-sand/40">
                  <td className="p-3 font-mono font-semibold">{c.code}</td>
                  <td className="p-3">{c.type === 'percent' ? `${c.value}%` : formatPrice(c.value)}</td>
                  <td className="p-3">{formatPrice(c.min_order)}</td>
                  <td className="p-3">{c.used_count}{c.max_uses > 0 ? ` / ${c.max_uses}` : ''}</td>
                  <td className="p-3">{c.expires_at ? formatDate(c.expires_at) : '—'}</td>
                  <td className="p-3">
                    <button onClick={() => toggleActive.mutate({ id: c.id, is_active: c.is_active ? 0 : 1 })} className={c.is_active ? 'text-moss' : 'text-ink-soft'}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setForm({ id: c.id, code: c.code, type: c.type, value: String(c.value), min_order: String(c.min_order), max_uses: String(c.max_uses), expires_at: c.expires_at?.slice(0, 10) || '' })
                        setModalOpen(true)
                      }}
                      className="mr-3 text-xs font-bold uppercase text-clay"
                    >
                      Edit
                    </button>
                    <button onClick={() => confirm('Delete this coupon?') && deleteMutation.mutate(c.id)} className="text-xs font-bold uppercase text-rust">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? 'Edit Coupon' : 'Add Coupon'}>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }} className="space-y-4">
          <div>
            <label className="label">Code</label>
            <input required className="input font-mono uppercase" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} disabled={!!form.id} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed (₦)</option>
              </select>
            </div>
            <div>
              <label className="label">Value</label>
              <input required type="number" className="input" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min Order (₦)</label>
              <input type="number" className="input" value={form.min_order} onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))} />
            </div>
            <div>
              <label className="label">Max Uses (0 = unlimited)</label>
              <input type="number" className="input" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Expires (optional)</label>
            <input type="date" className="input" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
          </div>
          <button disabled={saveMutation.isPending} className="btn-primary w-full">{saveMutation.isPending ? 'Saving…' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  )
}
