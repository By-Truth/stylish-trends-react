import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { settingsApi } from '../../lib/api'
import { Spinner } from '../../components/ui/Spinner'

export function Payments() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get })
  const [form, setForm] = useState({
    paystack_enabled: true, bank_transfer_enabled: true, whatsapp_pay_enabled: true,
    bank_name: '', account_name: '', account_number: '',
  })

  useEffect(() => {
    if (data?.payments) setForm(data.payments)
  }, [data])

  const save = useMutation({
    mutationFn: () => settingsApi.update('payments', form),
    onSuccess: () => { toast.success('Payment settings saved'); qc.invalidateQueries({ queryKey: ['settings'] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <h2 className="mb-5 font-display text-2xl">Payment Methods</h2>
      <div className="max-w-xl space-y-6">
        <div className="card space-y-3 p-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-ink-soft">Enabled Methods</p>
          {[
            { key: 'paystack_enabled', label: 'Paystack (card, bank transfer, USSD, mobile money)' },
            { key: 'bank_transfer_enabled', label: 'Direct Bank Transfer' },
            { key: 'whatsapp_pay_enabled', label: 'Order via WhatsApp' },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={(form as any)[opt.key]}
                onChange={(e) => setForm((f) => ({ ...f, [opt.key]: e.target.checked }))}
              />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="card space-y-4 p-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-ink-soft">Bank Transfer Details</p>
          <div>
            <label className="label">Bank Name</label>
            <input className="input" value={form.bank_name} onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Account Name</label>
            <input className="input" value={form.account_name} onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Account Number</label>
            <input className="input" value={form.account_number} onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))} />
          </div>
        </div>

        <p className="text-xs text-ink-soft">
          Paystack API keys live in your server's <code>includes/config.php</code> for security — they're never exposed
          through this panel.
        </p>

        <button disabled={save.isPending} onClick={() => save.mutate()} className="btn-primary">
          {save.isPending ? 'Saving…' : 'Save Payment Settings'}
        </button>
      </div>
    </div>
  )
}
