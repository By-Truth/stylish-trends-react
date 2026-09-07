import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cart'
import { usePublicSettings } from '../../lib/usePublicSettings'
import { formatPrice } from '../../lib/format'
import { EmptyState } from '../../components/ui/Spinner'

export function Cart() {
  const { items, removeItem, updateQty, subtotal } = useCartStore()
  const { data: settings } = usePublicSettings()
  const sub = subtotal()
  const threshold = settings?.shipping?.free_shipping_threshold ?? 50000
  const fee = settings?.shipping?.default_fee ?? 2500
  const shipping = sub > 0 ? (sub > threshold ? 0 : fee) : 0

  if (items.length === 0) {
    return (
      <div className="container-narrow py-20">
        <EmptyState
          title="Your cart is empty"
          subtitle="Browse the shop and find something you love."
          action={
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-wide py-10">
      <h1 className="section-title mb-8">Your Cart</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex items-center gap-4 py-5">
              <div className="h-20 w-16 shrink-0 overflow-hidden bg-sand">
                {item.image && <img src={item.image} className="h-full w-full object-cover" alt="" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-ink-soft">Size: {item.size}</p>
              </div>
              <div className="flex items-center border border-line">
                <button onClick={() => updateQty(item.id, item.size, item.qty - 1)} className="h-9 w-9">−</button>
                <span className="w-8 text-center text-sm">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.size, item.qty + 1)} className="h-9 w-9">+</button>
              </div>
              <p className="w-24 text-right font-display">{formatPrice(item.price * item.qty)}</p>
              <button onClick={() => removeItem(item.id, item.size)} className="text-ink-soft hover:text-rust" aria-label="Remove">
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="card h-fit space-y-4 p-6">
          <p className="font-display text-lg">Order Summary</p>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(sub)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-4 font-display text-lg">
            <span>Total</span>
            <span>{formatPrice(sub + shipping)}</span>
          </div>
          <Link to="/checkout" className="btn-primary block w-full text-center">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
