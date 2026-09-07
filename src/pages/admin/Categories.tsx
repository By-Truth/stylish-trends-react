import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { categoriesApi } from '../../lib/api'
import { Spinner } from '../../components/ui/Spinner'
import { Modal } from '../../components/ui/Modal'
import type { Category } from '../../types'

export function Categories() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<{ id: number; name: string; sort_order: string }>({ id: 0, name: '', sort_order: '0' })
  const qc = useQueryClient()

  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { name: form.name, sort_order: parseInt(form.sort_order) || 0 }
      return form.id ? categoriesApi.update(form.id, payload) : categoriesApi.create(payload)
    },
    onSuccess: () => {
      toast.success('Saved')
      qc.invalidateQueries({ queryKey: ['categories'] })
      setModalOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.remove(id),
    onSuccess: () => {
      toast.success('Category removed')
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl">Categories</h2>
        <button onClick={() => { setForm({ id: 0, name: '', sort_order: '0' }); setModalOpen(true) }} className="btn-primary">
          + Add Category
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand text-left text-xs uppercase tracking-widest text-ink-soft">
              <tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Products</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories?.map((c: Category) => (
                <tr key={c.id} className="hover:bg-sand/40">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-ink-soft">{c.slug}</td>
                  <td className="p-3">{c.product_count}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => { setForm({ id: c.id, name: c.name, sort_order: String(c.sort_order) }); setModalOpen(true) }} className="mr-3 text-xs font-bold uppercase text-clay">
                      Edit
                    </button>
                    <button
                      onClick={() => confirm('Delete this category? Products in it will be uncategorised.') && deleteMutation.mutate(c.id)}
                      className="text-xs font-bold uppercase text-rust"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Sort Order</label>
            <input type="number" className="input" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
          </div>
          <button disabled={saveMutation.isPending} className="btn-primary w-full">{saveMutation.isPending ? 'Saving…' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  )
}
