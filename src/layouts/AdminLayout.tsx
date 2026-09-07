import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { AdminTopbar } from '../components/admin/AdminTopbar'
import { useAuthStore } from '../store/auth'
import { Spinner } from '../components/ui/Spinner'

const TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/products': 'Products',
  '/admin/customers': 'Customers',
  '/admin/categories': 'Categories',
  '/admin/media': 'Media Library',
  '/admin/coupons': 'Coupons',
  '/admin/reviews': 'Reviews',
  '/admin/analytics': 'Sales Analytics',
  '/admin/export': 'Export Data',
  '/admin/settings': 'General Settings',
  '/admin/shipping': 'Shipping Zones',
  '/admin/payments': 'Payment Methods',
  '/admin/whatsapp': 'WhatsApp Config',
}

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { user, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized) return <Spinner />
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return (
    <div className="min-h-screen bg-sand">
      <AdminSidebar open={open} />
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-60">
        <AdminTopbar title={TITLES[location.pathname] || 'Admin'} onMenu={() => setOpen(!open)} />
        <div className="p-5">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
