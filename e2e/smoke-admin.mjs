// Walks the admin panel: logs in, creates a product, updates an order's
// status. Needs a real admin user in the database (see README) and at
// least one existing order to click "Manage" on.
//
// Usage: ADMIN_EMAIL=you@x.com ADMIN_PASSWORD=secret node e2e/smoke-admin.mjs
import { chromium } from 'playwright'
import fs from 'node:fs'

const SHOTS_DIR = process.env.SHOTS_DIR || 'e2e/screenshots'
fs.mkdirSync(SHOTS_DIR, { recursive: true })

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@stylishtrends.ng'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456'

const errors = []
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
})
const page = await browser.newPage()
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
page.on('console', (msg) => {
  if (msg.type() === 'error' && !msg.text().includes('ERR_TUNNEL')) errors.push(`[console] ${msg.text()}`)
})

const base = process.env.BASE_URL || 'http://127.0.0.1:5173'

await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
await page.fill('input[placeholder="Admin email"]', ADMIN_EMAIL)
await page.fill('input[placeholder="Password"]', ADMIN_PASSWORD)
await page.click('button:has-text("Sign In")')
await page.waitForTimeout(800)

console.log('--- Create product ---')
await page.goto(`${base}/admin/products`, { waitUntil: 'networkidle' })
await page.click('button:has-text("+ Add Product")')
await page.waitForTimeout(300)
await page.fill('.fixed input:below(:text("Name"))', 'Test Silk Scarf')
await page.selectOption('.fixed select', { index: 1 })
await page.fill('.fixed input:below(:text("Price"))', '12000')
await page.fill('.fixed input:below(:text("Stock Qty"))', '25')
await page.click('button:has-text("Create Product")')
await page.waitForTimeout(800)
await page.screenshot({ path: `${SHOTS_DIR}/admin-product-created.png`, fullPage: true })
const bodyText = await page.textContent('body')
console.log('Contains "Test Silk Scarf":', bodyText.includes('Test Silk Scarf'))

console.log('--- Update order status ---')
await page.goto(`${base}/admin/orders`, { waitUntil: 'networkidle' })
await page.click('text=Manage >> nth=0')
await page.waitForTimeout(300)
await page.selectOption('.fixed select', 'processing')
await page.waitForTimeout(800)
await page.screenshot({ path: `${SHOTS_DIR}/admin-order-updated.png`, fullPage: true })

await browser.close()
console.log('\n=== ERRORS ===')
errors.length ? errors.forEach((e) => console.log(e)) : console.log('None!')
