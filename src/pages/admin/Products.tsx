import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { productsApi, categoriesApi, mediaApi } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { Spinner, EmptyState } from '../../components/ui/Spinner'
import { Modal } from '../../components/ui/Modal'
import type { Product, Colour } from '../../types'

const emptyForm = {
  id: 0, name: '', description: '', short_desc: '', price: '', compare_price: '',
  category_id: '', images: [] as string[], sizes: [] as string[], colours: [] as Colour[],
  is_featured: false, is_new: false, stock_qty: '',
}

export function Products() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: () => productsApi.list({ q: search || undefined, limit: 100 }),
  })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        description: form.description,
        short_desc: form.short_desc,
        price: parseFloat(form.price) || 0,
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        category_id: parseInt(form.category_id) || null,
        images: form.images,
        sizes: form.sizes,
        colours: form.colours,
        is_featured: form.is_featured ? 1 : 0,
        is_new: form.is_new ? 1 : 0,
        stock_qty: parseInt(form.stock_qty) || 0,
      }
      return form.id ? productsApi.update(form.id, payload) : productsApi.create(payload)
    },
    onSuccess: () => {
      toast.success(form.id ? 'Product updated' : 'Product created')
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      setModalOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => {
      toast.success('Product removed')
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })

  function openCreate() {
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      short_desc: p.short_desc || '',
      price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : '',
      category_id: String(p.category_id || ''),
      images: p.images || [],
      sizes: p.sizes || [],
      colours: p.colours || [],
      is_featured: !!p.is_featured,
      is_new: !!p.is_new,
      stock_qty: String(p.stock_qty),
    })
    setModalOpen(true)
  }

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const res = await mediaApi.upload(file)
      setForm((f) => ({ ...f, images: [...f.images, res.url] }))
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">Products</h2>
        <div className="flex gap-3">
          <input className="input w-auto" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button onClick={openCreate} className="btn-primary">+ Add Product</button>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data?.products?.length ? (
        <EmptyState title="No products" action={<button onClick={openCreate} className="btn-primary">Add your first product</button>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand text-left text-xs uppercase tracking-widest text-ink-soft">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.products.map((p: Product) => (
                <tr key={p.id} className="hover:bg-sand/40">
                  <td className="flex items-center gap-3 p-3">
                    <div className="h-10 w-8 shrink-0 overflow-hidden bg-sand">
                      {p.images?.[0] && <img src={p.images[0]} className="h-full w-full object-cover" alt="" />}
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="p-3">{p.category_name}</td>
                  <td className="p-3">{formatPrice(p.price)}</td>
                  <td className="p-3">
                    <span className={p.stock_qty <= 3 ? 'font-semibold text-rust' : ''}>{p.stock_qty}</span>
                  </td>
                  <td className="p-3">{p.is_active === 0 ? <span className="text-ink-soft">Archived</span> : <span className="text-moss">Active</span>}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(p)} className="mr-3 text-xs font-bold uppercase text-clay">Edit</button>
                    <button onClick={() => confirm('Remove this product?') && deleteMutation.mutate(p.id)} className="text-xs font-bold uppercase text-rust">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? 'Edit Product' : 'Add Product'} wide>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Category</label>
              <select required className="input" value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
                <option value="">Select category</option>
                {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Short Description</label>
            <input className="input" value={form.short_desc} onChange={(e) => setForm((f) => ({ ...f, short_desc: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Price (₦)</label>
              <input required type="number" className="input" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <label className="label">Compare Price (₦)</label>
              <input type="number" className="input" value={form.compare_price} onChange={(e) => setForm((f) => ({ ...f, compare_price: e.target.value }))} />
            </div>
            <div>
              <label className="label">Stock Qty</label>
              <input required type="number" className="input" value={form.stock_qty} onChange={(e) => setForm((f) => ({ ...f, stock_qty: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label">Sizes (comma separated)</label>
            <input
              className="input"
              placeholder="XS, S, M, L, XL"
              value={form.sizes.join(', ')}
              onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
            />
          </div>

          <div>
            <label className="label">Images</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative h-16 w-14 overflow-hidden border border-line">
                  <img src={img} className="h-full w-full object-cover" alt="" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                    className="absolute right-0 top-0 bg-black/60 px-1 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} />
            {uploading && <p className="mt-1 text-xs text-ink-soft">Uploading…</p>}
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_new} onChange={(e) => setForm((f) => ({ ...f, is_new: e.target.checked }))} />
              Mark as New
            </label>
          </div>

          <button disabled={saveMutation.isPending} className="btn-primary w-full">
            {saveMutation.isPending ? 'Saving…' : form.id ? 'Save Changes' : 'Create Product'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
