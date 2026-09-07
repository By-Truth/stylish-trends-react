import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/storefront/Navbar'
import { Footer } from '../components/storefront/Footer'
import { WhatsAppFloat } from '../components/storefront/WhatsAppFloat'
import { usePublicSettings } from '../lib/usePublicSettings'

export function StorefrontLayout() {
  const { data } = usePublicSettings()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat number={data?.whatsapp?.number} />
    </div>
  )
}
