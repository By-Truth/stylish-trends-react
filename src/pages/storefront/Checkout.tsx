import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCartStore } from '../../store/cart'
import { ordersApi, paystackApi, couponApi } from '../../lib/api'
import { usePublicSettings } from '../../lib/usePublicSettings'
import { formatPrice } from '../../lib/format'

const STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo',
  'Ekiti','Enugu','FCT (Abuja)','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
]

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY'

export function Checkout() {
  const { items, subtotal, clear } = useCartStore()
  const navigate = useNavigate()
  const { data: settings } = usePublicSettings()
  const sub = subtotal()
  const threshold = settings?.shipping?.free_shipping_threshold ?? 50000
  const defaultFee = settings?.shipping?.default_fee ?? 2500

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    address: '', address2: '', city: '', state: 'Lagos', notes: '',
  })
  const [payment, setPayment] = useState<'paystack' | 'bank_transfer' | 'whatsapp'>('paystack')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [busy, setBusy] = useState(false)

  const discount = coupon?.discount || 0
  const shipping = sub > 0 ? (sub - discount > threshold ? 0 : defaultFee) : 0
  const total = sub - discount + shipping

  if (items.length === 0) {
    return (
      <div className="container-narrow py-20 text-center">
        <p className="mb-4">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return
    try {
      const res = await couponApi.validate({ code: couponCode, subtotal: sub })
      if (res.valid) {
        setCoupon({ code: res.code, discount: res.discount })
        toast.success(res.message)
      } else {
        toast.error(res.error)
        setCoupon(null)
      }
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const orderRes = await ordersApi.create({
        items: items.map((i) => ({ id: i.id, qty: i.qty, size: i.size, colour: i.colour })),
        cust_name: `${form.first_name} ${form.last_name}`,
        cust_email: form.email,
        cust_phone: form.phone,
        ship_address: `${form.address}${form.address2 ? ', ' + form.address2 : ''}`,
        ship_city: form.city,
        ship_state: form.state,
        ship_notes: form.notes,
        payment_method: payment,
        coupon_code: coupon?.code,
      })

      if (payment === 'paystack') {
        if (!window.PaystackPop) {
          toast.error('Payment gateway still loading — please try again in a moment.')
          setBusy(false)
          return
        }
        const handler = window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: form.email,
          amount: Math.round(orderRes.total * 100),
          currency: 'NGN',
          ref: orderRes.paystack_ref,
          metadata: { order_id: orderRes.order_id },
          callback: async (response) => {
            try {
              await paystackApi.verify({ reference: response.reference, order_id: orderRes.order_id })
              clear()
              navigate(`/order-success?order=${orderRes.order_number}&id=${orderRes.order_id}`)
            } catch (err) {
              toast.error((err as Error).message)
            }
          },
          onClose: () => toast('Payment cancelled — your order is saved as pending.'),
        })
        handler.openIframe()
        setBusy(false)
        return
      }

      if (payment === 'whatsapp') {
        let msg = `*New Order - Stylish Trends* 🛍️\n\n*Order:* #${orderRes.order_number}\n*Customer:* ${form.first_name} ${form.last_name}\n*Phone:* ${form.phone}\n*Address:* ${form.address}, ${form.city}, ${form.state}\n\n*Items:*\n`
        items.forEach((i) => (msg += `• ${i.name} (Size: ${i.size}) x${i.qty} - ${formatPrice(i.price * i.qty)}\n`))
        msg += `\n*Total:* ${formatPrice(orderRes.total)}\n\nPlease confirm my order. Thank you!`
        window.open(`https://wa.me/${settings?.whatsapp?.number || '2348000000000'}?text=${encodeURIComponent(msg)}`, '_blank')
      }

      clear()
      navigate(`/order-success?order=${orderRes.order_number}&id=${orderRes.order_id}`)
    } catch (err) {
      toast.error((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="border-b border-line bg-sand py-10">
        <div className="container-wide">
          <p className="eyebrow">Almost There</p>
          <h1 className="section-title">Checkout</h1>
        </div>
      </div>

      <form onSubmit={submit} className="container-wide grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest">Contact Information</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <input required className="input" placeholder="First Name" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
              <input required className="input" placeholder="Last Name" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
            </div>
            <input required type="email" className="input mt-4" placeholder="Email Address" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <input required type="tel" className="input mt-4" placeholder="Phone Number" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest">Delivery Address</p>
            <input required className="input" placeholder="Street Address" value={form.address} onChange={(e) => update('address', e.target.value)} />
            <input className="input mt-4" placeholder="Apartment / Suite (Optional)" value={form.address2} onChange={(e) => update('address2', e.target.value)} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required className="input" placeholder="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
              <select required className="input" value={form.state} onChange={(e) => update('state', e.target.value)}>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <textarea className="input mt-4" rows={3} placeholder="Delivery Notes (Optional)" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest">Payment Method</p>
            <div className="space-y-3">
              {[
                { id: 'paystack', label: 'Pay with Paystack', desc: 'Card, bank transfer, USSD, or mobile money' },
                { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Pay directly to our bank account' },
                { id: 'whatsapp', label: 'Order via WhatsApp', desc: "We'll guide you through payment on WhatsApp" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-4 border p-4 ${payment === opt.id ? 'border-ink' : 'border-line'}`}
                >
                  <input type="radio" name="payment" checked={payment === opt.id} onChange={() => setPayment(opt.id as typeof payment)} />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-ink-soft">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {payment === 'bank_transfer' && (
              <div className="mt-3 bg-sand p-4 text-sm">
                <p><strong>Bank:</strong> GTBank</p>
                <p><strong>Account Name:</strong> Stylish Trends Nigeria Ltd</p>
                <p><strong>Account Number:</strong> 0123456789</p>
                <p className="mt-2 text-xs text-ink-soft">Send proof of payment via WhatsApp after transfer.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card h-fit space-y-4 p-6" style={{ position: 'sticky', top: '5.5rem' }}>
          <p className="font-display text-lg">Your Order</p>
          <div className="max-h-64 space-y-3 overflow-y-auto border-b border-line pb-4">
            {items.map((i) => (
              <div key={`${i.id}-${i.size}`} className="flex justify-between text-sm">
                <span className="text-ink-soft">{i.name} × {i.qty} ({i.size})</span>
                <span>{formatPrice(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <button type="button" onClick={applyCoupon} className="btn-outline shrink-0">Apply</button>
          </div>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-clay"><span>Discount ({coupon?.code})</span><span>-{formatPrice(discount)}</span></div>
          )}
          <div className="flex justify-between text-sm"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
          <div className="flex justify-between border-t border-line pt-4 font-display text-lg"><span>Total</span><span>{formatPrice(total)}</span></div>
          <button disabled={busy} className="btn-primary w-full">
            {busy ? 'Processing…' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  )
}
