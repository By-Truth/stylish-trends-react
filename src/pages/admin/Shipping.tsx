import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { settingsApi } from '../../lib/api'
import { Spinner } from '../../components/ui/Spinner'
import { formatPrice } from '../../lib/format'

interface Zone { name: string; fee: number; days: string }

export function Shipping() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get })
  const [threshold, setThreshold] = useState(50000)
  const [defaultFee, setDefaultFee] = useState(2500)
  const [zones, setZones] = useState<Zone[]>([])

  useEffect(() => {
    if (data?.shipping) {
      setThreshold(data.shipping.free_shipping_threshold)
      setDefaultFee(data.shipping.default_fee)
      setZones(data.shipping.zones || [])
    }
  }, [data])

  const save = useMutation({
    mutationFn: () =>
      settingsApi.update('shipping', { free_shipping_threshold: threshold, default_fee: defaultFee, zones }),
    onSuccess: () => { toast.success('Shipping settings saved'); qc.invalidateQueries({ queryKey: ['settings'] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  function updateZone(i: number, key: keyof Zone, value: string) {
    setZones((z) => z.map((zone, idx) => (idx === i ? { ...zone, [key]: key === 'fee' ? Number(value) : value } : zone)))
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      <h2 className="mb-5 font-display text-2xl">Shipping Zones</h2>
      <div className="max-w-2xl space-y-6">
        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <label className="label">Free Shipping Threshold (₦)</label>
            <input type="number" className="input" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Default Shipping Fee (₦)</label>
            <input type="number" className="input" value={defaultFee} onChange={(e) => setDefaultFee(Number(e.target.value))} />
          </div>
          <p className="col-span-2 text-xs text-ink-soft">
            Orders above {formatPrice(threshold)} ship free; everything else pays {formatPrice(defaultFee)} unless a zone below overrides it.
          </p>
        </div>

        <div className="card p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-soft">Zones</p>
          <div className="space-y-3">
            {zones.map((z, i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <input className="input" value={z.name} onChange={(e) => updateZone(i, 'name', e.target.value)} placeholder="Zone name" />
                <input type="number" className="input" value={z.fee} onChange={(e) => updateZone(i, 'fee', e.target.value)} placeholder="Fee" />
                <input className="input" value={z.days} onChange={(e) => updateZone(i, 'days', e.target.value)} placeholder="Delivery days" />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setZones((z) => [...z, { name: '', fee: 0, days: '' }])}
            className="mt-3 text-xs font-bold uppercase text-clay"
          >
            + Add Zone
          </button>
        </div>

        <button disabled={save.isPending} onClick={() => save.mutate()} className="btn-primary">
          {save.isPending ? 'Saving…' : 'Save Shipping Settings'}
        </button>
      </div>
    </div>
  )
}
