import { Link, useSearchParams } from 'react-router-dom'

export function OrderSuccess() {
  const [params] = useSearchParams()
  const orderNumber = params.get('order')

  return (
    <div className="container-narrow py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-clay-soft text-2xl text-clay">
        ✓
      </div>
      <h1 className="section-title">Order Placed!</h1>
      <p className="mt-3 text-ink-soft">
        Thank you for shopping with Stylish Trends. Your order{' '}
        {orderNumber && <span className="font-semibold text-ink">#{orderNumber}</span>} has been received and is
        being processed.
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        We'll send updates to your WhatsApp and email as your order is prepared and dispatched.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        <Link to="/" className="btn-outline">Back Home</Link>
      </div>
    </div>
  )
}
