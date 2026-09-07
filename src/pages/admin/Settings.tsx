import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { settingsApi } from '../../lib/api'
import { Spinner } from '../../components/ui/Spinner'

export function Settings() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get })
  const [form, setForm] = useState({ store_name: '', store_email: '', store_phone: '', currency: 'NGN', address: '' })

  useEffect(() => {
    if (data?.general) setForm(data.general)
  }, [data])

  const save = useMutation({
    mutationFn: () => settingsApi.update('general', form),
    onSuccess: () => { toast.success('Settings saved'); qc.invalidateQueries({ queryKey: ['settings'] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <h2 className="mb-5 font-display text-2xl">General Settings</h2>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate() }} className="card max-w-xl space-y-4 p-6">
        <div>
          <label className="label">Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm((f) => ({ ...f, store_name: e.target.value }))} />
        </div>
        <div>
          <label className="label">Store Email</label>
          <input type="email" className="input" value={form.store_email} onChange={(e) => setForm((f) => ({ ...f, store_email: e.target.value }))} />
        </div>
        <div>
          <label className="label">Store Phone</label>
          <input className="input" value={form.store_phone} onChange={(e) => setForm((f) => ({ ...f, store_phone: e.target.value }))} />
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
        <button disabled={save.isPending} className="btn-primary">{save.isPending ? 'Saving…' : 'Save Settings'}</button>
      </form>
    </div>
  )
}
