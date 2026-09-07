import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCartStore } from '../../store/cart'
import { useAuthStore } from '../../store/auth'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?cat=women', label: 'Women' },
  { to: '/shop?cat=accessories', label: 'Accessories' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const count = useCartStore((s) => s.count())
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="container-wide flex h-20 items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-tight">
          Stylish Trends
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    isActive ? 'text-clay' : 'text-ink hover:text-clay'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          {user ? (
            <div className="group relative hidden sm:block">
              <button className="text-[0.72rem] font-semibold uppercase tracking-[0.1em]">Hi, {user.name.split(' ')[0]}</button>
              <div className="invisible absolute right-0 z-50 mt-2 w-40 border border-line bg-paper opacity-0 shadow-sm transition-all group-hover:visible group-hover:opacity-100">
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-4 py-2.5 text-sm hover:bg-sand">
                    Admin panel
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await logout()
                    navigate('/')
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-sand"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="hidden text-ink hover:text-clay sm:block" title="Account" aria-label="Account">
              <UserIcon />
            </Link>
          )}
          <Link to="/cart" className="relative text-ink hover:text-clay" title="Cart" aria-label="Cart">
            <BagIcon />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[0.6rem] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-cream lg:hidden">
          <ul className="container-wide flex flex-col gap-1 py-3">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to={user ? '/account' : '/login'} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium">
                {user ? 'Account' : 'Login / Register'}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}

function UserIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}
function BagIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}
