import { Link } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { newsletterApi } from '../../lib/api'
import { usePublicSettings } from '../../lib/usePublicSettings'
import toast from 'react-hot-toast'

export function Footer() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const { data: settings } = usePublicSettings()
  const waNumber = settings?.whatsapp?.number || '2348000000000'

  async function subscribe(e: FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return toast.error('Enter a valid email')
    setBusy(true)
    try {
      const res = await newsletterApi.subscribe({ email, source: 'footer' })
      toast.success(res.message || 'Subscribed!')
      setEmail('')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <footer className="border-t border-line bg-ink text-cream">
      <div className="container-wide py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl">Stylish Trends</p>
            <p className="mt-3 max-w-xs text-sm text-cream/60">
              Nigeria's premier destination for luxury contemporary fashion — curated styles delivered nationwide.
            </p>
            <div className="mt-5 flex gap-3 text-cream/70">
              <a href="https://www.instagram.com/_stylishtrends.ng" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-clay">
                IG
              </a>
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:text-clay">
                WA
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow text-cream/50">Shop</p>
            <ul className="mt-4 space-y-2 text-sm text-cream/75">
              <li><Link to="/" className="hover:text-clay">Home</Link></li>
              <li><Link to="/shop" className="hover:text-clay">Shop All</Link></li>
              <li><Link to="/shop?sort=newest" className="hover:text-clay">New Arrivals</Link></li>
              <li><Link to="/about" className="hover:text-clay">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-clay">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-cream/50">Customer Care</p>
            <ul className="mt-4 space-y-2 text-sm text-cream/75">
              <li><Link to="/login" className="hover:text-clay">My Account</Link></li>
              <li><Link to="/cart" className="hover:text-clay">My Cart</Link></li>
              <li><Link to="/contact" className="hover:text-clay">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-cream/50">Stay In Style</p>
            <p className="mt-4 text-sm text-cream/75">Get 10% off your first order.</p>
            <form onSubmit={subscribe} className="mt-3 flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full border border-cream/20 bg-transparent px-3 py-2 text-sm placeholder:text-cream/40 focus:outline-none"
              />
              <button disabled={busy} className="shrink-0 bg-clay px-4 text-xs font-semibold uppercase tracking-wider disabled:opacity-50">
                Go
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-xs text-cream/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Stylish Trends Nigeria. All rights reserved.</p>
          <div className="flex gap-3">
            <span>Paystack</span>
            <span>Bank Transfer</span>
            <span>WhatsApp Pay</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
