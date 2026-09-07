export interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
}

export interface Colour {
  name: string
  hex: string
}

export interface Product {
  id: number
  sku: string
  name: string
  slug: string
  description?: string
  short_desc?: string
  price: string | number
  compare_price?: string | number | null
  cost_price?: string | number | null
  category_id?: number
  category_name?: string
  category_slug?: string
  images: string[]
  sizes: string[]
  colours: Colour[]
  tags?: string
  is_featured?: number
  is_new?: number
  is_active?: number
  stock_qty: number
  avg_rating: number
  review_count: number
  variants?: ProductVariant[]
  created_at?: string
}

export interface ProductVariant {
  id: number
  product_id: number
  size: string
  colour: string
  stock_qty: number
}

export interface Category {
  id: number
  name: string
  slug: string
  image?: string | null
  parent_id?: number | null
  sort_order: number
  product_count?: number
}

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  qty: number
  size: string
  colour?: string
}

export interface OrderItem {
  id?: number
  product_id: number
  product_name: string
  size: string
  colour?: string
  qty: number
  unit_price: number
  total_price: number
}

export interface Order {
  id: number
  order_number: string
  user_id?: number | null
  status: 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled' | 'refunded'
  payment_method: 'paystack' | 'bank_transfer' | 'whatsapp'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_ref?: string
  subtotal: number
  shipping_fee: number
  discount_amount: number
  total: number
  coupon_code?: string
  cust_name: string
  cust_email: string
  cust_phone: string
  ship_address?: string
  ship_city?: string
  ship_state?: string
  ship_notes?: string
  tracking_number?: string
  item_count?: number
  items?: OrderItem[]
  created_at: string
}

export interface Review {
  id: number
  product_id: number
  product_name?: string
  user_id?: number | null
  author_name: string
  rating: number
  title?: string
  body: string
  is_approved: number
  created_at: string
}

export interface Coupon {
  id: number
  code: string
  type: 'percent' | 'fixed'
  value: number
  min_order: number
  max_uses: number
  used_count: number
  expires_at?: string | null
  is_active: number
  created_at: string
}

export interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  newsletter: number
  created_at: string
  order_count: number
  lifetime_value: number
  orders?: Order[]
}

export interface DashboardStats {
  revenue_month: number
  total_orders: number
  pending_orders: number
  new_customers: number
  low_stock: number
  monthly_revenue: { m: number; rev: number }[]
  top_products: { name: string; sold: number }[]
}

export interface MediaFile {
  name: string
  url: string
  size: number
  modified: string
}

export interface Settings {
  general?: {
    store_name: string
    store_email: string
    store_phone: string
    currency: string
    address: string
  }
  shipping?: {
    free_shipping_threshold: number
    default_fee: number
    zones: { name: string; fee: number; days: string }[]
  }
  whatsapp?: {
    number: string
    order_notifications_enabled: boolean
    greeting: string
  }
  payments?: {
    paystack_enabled: boolean
    bank_transfer_enabled: boolean
    whatsapp_pay_enabled: boolean
    bank_name: string
    account_name: string
    account_number: string
  }
}
