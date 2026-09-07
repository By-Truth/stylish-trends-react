import { NavLink } from 'react-router-dom'

const NAV: { section?: string; to?: string; label?: string }[] = [
  { section: 'Main' },
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/customers', label: 'Customers' },
  { section: 'Catalogue' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/media', label: 'Media Library' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/reviews', label: 'Reviews' },
  { section: 'Reports' },
  { to: '/admin/analytics', label: 'Sales Analytics' },
  { to: '/admin/export', label: 'Export Data' },
  { section: 'Settings' },
  { to: '/admin/settings', label: 'General Settings' },
  { to: '/admin/shipping', label: 'Shipping Zones' },
  { to: '/admin/payments', label: 'Payment Methods' },
  { to: '/admin/whatsapp', label: 'WhatsApp Config' },
]

export function AdminSidebar({ open }: { open: boolean }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-60 overflow-y-auto bg-ink px-4 py-6 text-cream transition-transform lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-6 border-b border-white/10 pb-4">
        <p className="font-display text-xl">Stylish Trends</p>
        <p className="eyebrow mt-1 text-clay">Admin Panel</p>
      </div>

      <nav className="flex flex-col">
        {NAV.map((item, i) =>
          item.section ? (
            <p key={i} className="mb-1.5 mt-3 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/30">
              {item.section}
            </p>
          ) : (
            <NavLink
              key={item.to}
              to={item.to!}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `mb-0.5 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-white/10 text-clay' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="mt-6 border-t border-white/10 pt-4">
        <NavLink to="/" target="_blank" className="block px-3 py-2 text-sm text-white/60 hover:text-white">
          View Storefront ↗
        </NavLink>
      </div>
    </aside>
  )
}
