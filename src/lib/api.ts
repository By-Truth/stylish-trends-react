import axios from 'axios'

// Same-origin by default: in dev, Vite's proxy (vite.config.ts) forwards
// /api and /images to the PHP backend so the browser never crosses
// origins (no CORS/cookie headaches). In production, deploy the built
// dist/ files alongside the PHP project on the same domain so relative
// paths keep working. See README for both setups.
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

// ---- Auth ----
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/admin-extra.php', { params: { resource: 'me' } }).then((r) => r.data.user),
}

// ---- Products ----
export interface ProductQuery {
  category?: string
  q?: string
  min_price?: number
  max_price?: number
  sort?: string
  page?: number
  limit?: number
}
export const productsApi = {
  list: (params: ProductQuery = {}) => api.get('/products', { params }).then((r) => r.data),
  get: (id: number) => api.get(`/products/${id}`).then((r) => r.data.product),
  create: (data: Record<string, unknown>) => api.post('/products', data).then((r) => r.data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/products/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/products/${id}`).then((r) => r.data),
}

// ---- Categories (admin-extra) ----
export const categoriesApi = {
  list: () => api.get('/admin-extra.php', { params: { resource: 'categories' } }).then((r) => r.data.categories),
  create: (data: Record<string, unknown>) =>
    api.post('/admin-extra.php?resource=categories', data).then((r) => r.data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/admin-extra.php?resource=categories&id=${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/admin-extra.php?resource=categories&id=${id}`).then((r) => r.data),
}

// ---- Orders ----
export const ordersApi = {
  list: (status?: string) =>
    api.get('/orders', { params: status ? { status } : {} }).then((r) => r.data.orders),
  create: (data: Record<string, unknown>) => api.post('/orders', data).then((r) => r.data),
  updateStatus: (id: number, data: { status: string; tracking_number?: string }) =>
    api.put(`/orders/${id}/status`, data).then((r) => r.data),
}

// ---- Paystack ----
export const paystackApi = {
  verify: (data: { reference: string; order_id: number }) =>
    api.post('/paystack/verify', data).then((r) => r.data),
}

// ---- Newsletter ----
export const newsletterApi = {
  subscribe: (data: { email: string; name?: string; source?: string }) =>
    api.post('/newsletter/subscribe', data).then((r) => r.data),
}

// ---- Coupons ----
export const couponApi = {
  validate: (data: { code: string; subtotal: number }) =>
    api.post('/coupon/validate', data).then((r) => r.data),
}
export const couponsAdminApi = {
  list: () => api.get('/admin-extra.php', { params: { resource: 'coupons' } }).then((r) => r.data.coupons),
  create: (data: Record<string, unknown>) => api.post('/admin-extra.php?resource=coupons', data).then((r) => r.data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/admin-extra.php?resource=coupons&id=${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/admin-extra.php?resource=coupons&id=${id}`).then((r) => r.data),
}

// ---- Reviews ----
export const reviewsApi = {
  list: (productId: number) => api.get(`/reviews/${productId}`).then((r) => r.data),
  create: (data: { product_id: number; rating: number; author_name?: string; title?: string; body: string }) =>
    api.post('/reviews', data).then((r) => r.data),
}
export const reviewsAdminApi = {
  listAll: () => api.get('/admin-extra.php', { params: { resource: 'reviews' } }).then((r) => r.data.reviews),
  moderate: (id: number, is_approved: boolean) =>
    api.put(`/admin-extra.php?resource=reviews&id=${id}`, { is_approved: is_approved ? 1 : 0 }).then((r) => r.data),
  remove: (id: number) => api.delete(`/admin-extra.php?resource=reviews&id=${id}`).then((r) => r.data),
}

// ---- Customers ----
export const customersApi = {
  list: () => api.get('/admin-extra.php', { params: { resource: 'customers' } }).then((r) => r.data.customers),
  get: (id: number) =>
    api.get('/admin-extra.php', { params: { resource: 'customers', id } }).then((r) => r.data.customer),
}

// ---- Dashboard ----
export const dashboardApi = {
  stats: () => api.get('/dashboard').then((r) => r.data.stats),
}

// ---- Settings ----
export const settingsApi = {
  get: () => api.get('/admin-extra.php', { params: { resource: 'settings' } }).then((r) => r.data.settings),
  getPublic: () => api.get('/admin-extra.php', { params: { resource: 'public-settings' } }).then((r) => r.data.settings),
  update: (key: string, value: unknown) =>
    api.put('/admin-extra.php?resource=settings', { key, value }).then((r) => r.data),
}

// ---- Media ----
export const mediaApi = {
  list: () => api.get('/admin-extra.php', { params: { resource: 'media' } }).then((r) => r.data.media),
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post('/admin-extra.php?resource=media', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
  remove: (name: string) =>
    api.delete('/admin-extra.php', { params: { resource: 'media', file: name } }).then((r) => r.data),
}

// ---- Export ----
export const exportUrl = (type: 'orders' | 'products') => `/api/admin-extra.php?resource=export&type=${type}`
