import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { settingsApi } from '../../lib/api'
import { Spinner } from '../../components/ui/Spinner'

export function Whatsapp() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get })
  const [form, setForm] = useState({ number: '', order_notifications_enabled: true, greeting: '' })

  useEffect(() => {
    if (data?.whatsapp) setForm(data.whatsapp)
  }, [data])

  const save = useMutation({
    mutationFn: () => settingsApi.update('whatsapp', form),
    onSuccess: () => { toast.success('WhatsApp settings saved'); qc.invalidateQueries({ queryKey: ['settings'] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <h2 className="mb-5 font-display text-2xl">WhatsApp Config</h2>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate() }} className="card max-w-xl space-y-4 p-6">
        <div>
          <label className="label">WhatsApp Business Number</label>
          <input className="input" placeholder="2348000000000" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} />
          <p className="mt-1 text-xs text-ink-soft">International format, no + or spaces.</p>
        </div>
        <div>
          <label className="label">Default Greeting</label>
          <textarea className="input" rows={2} value={form.greeting} onChange={(e) => setForm((f) => ({ ...f, greeting: e.target.value }))} />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.order_notifications_enabled}
            onChange={(e) => setForm((f) => ({ ...f, order_notifications_enabled: e.target.checked }))}
          />
          Send order status updates via WhatsApp
        </label>
        <p className="text-xs text-ink-soft">
          Order and status-update messages are currently logged server-side (see <code>sendWhatsAppOrderNotification</code> in
          <code> api/index.php</code>) — wire in Twilio or 360dialog there to send them for real.
        </p>
        <button disabled={save.isPending} className="btn-primary">{save.isPending ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  )
}
