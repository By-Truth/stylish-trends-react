// Lightweight Playwright smoke test — no test runner, just a script that
// walks the storefront and fails loudly (via console output) if anything
// throws or a request errors. Run the dev server first (`npm run dev`),
// against a working PHP+MySQL backend, then `node e2e/smoke-storefront.mjs`.
import { chromium } from 'playwright'
import fs from 'node:fs'

const SHOTS_DIR = process.env.SHOTS_DIR || 'e2e/screenshots'
fs.mkdirSync(SHOTS_DIR, { recursive: true })

const errors = []
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
})
const page = await browser.newPage()
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
page.on('console', (msg) => {
  if (msg.type() === 'error' && !msg.text().includes('ERR_TUNNEL') && !msg.text().includes('ERR_NAME_NOT_RESOLVED')) {
    errors.push(`[console] ${msg.text()}`)
  }
})

async function shot(name) {
  await page.screenshot({ path: `${SHOTS_DIR}/${name}.png`, fullPage: true })
}

const base = process.env.BASE_URL || 'http://127.0.0.1:5173'

console.log('--- Home ---')
await page.goto(`${base}/`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('01-home')

console.log('--- Shop ---')
await page.goto(`${base}/shop`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('02-shop')

console.log('--- Product detail ---')
await page.goto(`${base}/product/1`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('03-product')

console.log('--- Add to cart flow ---')
await page.click('button:has-text("M")').catch(() => {})
await page.click('text=Add to Cart').catch(() => {})
await page.waitForTimeout(500)
await shot('04-product-added')

console.log('--- Cart ---')
await page.goto(`${base}/cart`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('05-cart')

console.log('--- Register ---')
await page.goto(`${base}/register`, { waitUntil: 'networkidle' })
const rand = Date.now()
await page.fill('input[placeholder="Full Name"]', 'Test User')
await page.fill('input[placeholder="Email address"]', `test${rand}@example.com`)
await page.fill('input[placeholder="Password (min. 8 characters)"]', 'Password123')
await page.fill('input[placeholder="Confirm Password"]', 'Password123')
await page.click('button:has-text("Create Account")')
await page.waitForTimeout(1000)
await shot('06-after-register')
console.log('URL after register:', page.url())

console.log('--- Checkout ---')
await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('07-checkout')

console.log('--- Admin login ---')
await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
await page.fill('input[placeholder="Admin email"]', 'admin@stylishtrends.ng')
await page.fill('input[placeholder="Password"]', 'Admin@123456')
await page.click('button:has-text("Sign In")')
await page.waitForTimeout(1000)
await shot('08-admin-dashboard')
console.log('URL after admin login:', page.url())

console.log('--- Admin orders ---')
await page.goto(`${base}/admin/orders`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('09-admin-orders')

console.log('--- Admin products ---')
await page.goto(`${base}/admin/products`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('10-admin-products')

console.log('--- Admin categories ---')
await page.goto(`${base}/admin/categories`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('11-admin-categories')

console.log('--- Admin coupons ---')
await page.goto(`${base}/admin/coupons`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('12-admin-coupons')

console.log('--- Admin customers ---')
await page.goto(`${base}/admin/customers`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('13-admin-customers')

console.log('--- Admin reviews ---')
await page.goto(`${base}/admin/reviews`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('14-admin-reviews')

console.log('--- Admin media ---')
await page.goto(`${base}/admin/media`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('15-admin-media')

console.log('--- Admin analytics ---')
await page.goto(`${base}/admin/analytics`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot('16-admin-analytics')

console.log('--- Admin settings/shipping/payments/whatsapp ---')
await page.goto(`${base}/admin/settings`, { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
await shot('17-admin-settings')
await page.goto(`${base}/admin/shipping`, { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
await shot('18-admin-shipping')
await page.goto(`${base}/admin/payments`, { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
await shot('19-admin-payments')
await page.goto(`${base}/admin/whatsapp`, { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
await shot('20-admin-whatsapp')

await browser.close()

console.log('\n=== ERRORS ===')
if (errors.length === 0) console.log('None!')
else errors.forEach((e) => console.log(e))
