import { Routes, Route } from 'react-router-dom'
import { StorefrontLayout } from './layouts/StorefrontLayout'
import { AdminLayout } from './layouts/AdminLayout'

import { Home } from './pages/storefront/Home'
import { Shop } from './pages/storefront/Shop'
import { ProductDetail } from './pages/storefront/ProductDetail'
import { Cart } from './pages/storefront/Cart'
import { Checkout } from './pages/storefront/Checkout'
import { OrderSuccess } from './pages/storefront/OrderSuccess'
import { About } from './pages/storefront/About'
import { Contact } from './pages/storefront/Contact'
import { Login } from './pages/storefront/Login'
import { Register } from './pages/storefront/Register'
import { NotFound } from './pages/storefront/NotFound'

import { AdminLogin } from './pages/admin/AdminLogin'
import { Dashboard } from './pages/admin/Dashboard'
import { Orders } from './pages/admin/Orders'
import { Products } from './pages/admin/Products'
import { Categories } from './pages/admin/Categories'
import { Coupons } from './pages/admin/Coupons'
import { Customers } from './pages/admin/Customers'
import { Reviews } from './pages/admin/Reviews'
import { Media } from './pages/admin/Media'
import { Analytics } from './pages/admin/Analytics'
import { Export } from './pages/admin/Export'
import { Settings } from './pages/admin/Settings'
import { Shipping } from './pages/admin/Shipping'
import { Payments } from './pages/admin/Payments'
import { Whatsapp } from './pages/admin/Whatsapp'

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="media" element={<Media />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="export" element={<Export />} />
        <Route path="settings" element={<Settings />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="payments" element={<Payments />} />
        <Route path="whatsapp" element={<Whatsapp />} />
      </Route>

      <Route path="*" element={<StorefrontLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
