# Stylish Trends — React Storefront & Admin Panel

A full React + TypeScript rewrite of the frontend and admin panel for
[Stylish Trends](https://www.instagram.com/_stylishtrends.ng), my Nigerian
fashion e-commerce store. Same PHP + MySQL backend as before, but the whole
frontend is new — storefront and full admin panel, both talking to real API
endpoints instead of mock data.

The original PHP/vanilla-JS/Bootstrap build still lives in its own repo and
I haven't touched it. This project only *adds* two small backend files (see
[`server/README.md`](server/README.md)) for admin features the original API
never had — everything else on the PHP side stays exactly as it was.

## Why I rebuilt it

The old frontend never actually talked to its own API — the cart lived in
`localStorage`, login was a `setTimeout` that faked success, and checkout
never touched the real `orders` table, even though `api/index.php` already
had a complete REST API for auth, products, orders, Paystack, coupons, and
reviews sitting there unused. So this rebuild wires a real frontend up to
that real backend: register/login actually authenticate against MySQL, the
cart total at checkout is recalculated server-side, Paystack payments are
verified server-side, and the admin panel manages live data instead of
placeholders.

## Stack

- **React 19 + TypeScript + Vite**
- **React Router 7** for routing (storefront + a separate `/admin/*` tree)
- **TanStack Query** for all server state (no manual loading/error boilerplate)
- **Zustand** for client state (cart, with `localStorage` persistence; auth)
- **Tailwind CSS v4** for styling — I also took the chance to refresh the
  visual identity (serif display type, a warmer ink/clay palette) rather
  than just porting the old design 1:1
- **Playwright** for a couple of end-to-end smoke scripts (`e2e/`)
- Backend: the existing PHP 8 + MySQL API, unchanged, plus one additive
  file (`server/admin-extra.php`) — see below

## Features

**Storefront** — home, shop with real category/price/search filtering and
sorting (server-side) plus client-side size filtering, product detail with
real reviews (read + submit), cart, checkout (real order creation, real
Paystack popup + server-side verification, bank transfer, or WhatsApp
handoff), coupon codes, registration/login against real accounts, about,
contact (opens a pre-filled WhatsApp chat — there's no contact-form
endpoint in the API to send it to).

**Admin panel** (`/admin`, session-gated, `role: admin` only) — dashboard
with real revenue/order stats, orders (filter, status transitions, tracking
numbers), products (create/edit/soft-delete, image upload), categories,
coupons, customers (with order history), review moderation, a media
library, sales analytics, CSV export, and general/shipping/payments/WhatsApp
settings.

## Getting started

### 1. Backend

You need the original PHP project running with its database imported, plus
the two additive files from `server/` — see
**[`server/README.md`](server/README.md)** for the two-minute install.

If you're running XAMPP, that's typically:
`http://localhost/<your-project-folder>`.

### 2. Frontend

```bash
npm install
cp .env.example .env.local
# edit .env.local — set VITE_API_PROXY_TARGET to your XAMPP URL
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` and `/images`
to `VITE_API_PROXY_TARGET` (see `vite.config.ts`), so the browser only ever
talks to one origin — no CORS setup, and PHP session cookies just work.

To get a Paystack **public** key for the checkout popup, sign up at
[dashboard.paystack.com](https://dashboard.paystack.com) and put it in
`.env.local` as `VITE_PAYSTACK_PUBLIC_KEY` (test keys work for `Cash`/test
cards). Without it, Paystack checkout will show a loading state and never
complete — bank transfer and WhatsApp checkout work regardless.

### 3. Try it

Register a customer account through `/register`, or create an admin
directly in the database:

```sql
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@example.com',
        '$2y$12$...' /* php -r "echo password_hash('yourpassword', PASSWORD_BCRYPT, ['cost'=>12]);" */,
        'admin');
```

Then sign in at `/admin/login`.

## End-to-end tests

I wrote two Playwright scripts that exercise the real app against a real
backend (no mocking): one walks the storefront (browse → add to cart →
register → checkout), the other logs into the admin panel and performs a
real create + a real status update.

```bash
npx playwright install chromium   # once
npm run dev                       # in one terminal
npm run e2e:storefront            # in another
ADMIN_EMAIL=you@x.com ADMIN_PASSWORD=yourpass npm run e2e:admin
```

Screenshots land in `e2e/screenshots/` (gitignored) and the script prints
any console/page errors it saw.

## Deployment

**Same-origin (recommended).** Build (`npm run build`) and copy the
contents of `dist/` into the same host/domain that serves `api/` and
`images/` — e.g. the same `public_html` on your cPanel host, replacing the
old static HTML pages there. This keeps everything on one origin, so
session cookies and API calls just work with zero config. You'll want an
`.htaccess` rule that falls back unmatched routes to `index.html` for
client-side routing, while still leaving `/api/*` and `/images/*` alone —
something like:

```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/images/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [L]
```

**Separate domain/subdomain.** Works, but the PHP API's session cookie and
CORS headers (in `includes/config.php`) are set up for a single trusted
origin, not a public cross-site setup with credentials — you'd need to add
`Access-Control-Allow-Credentials: true`, echo back the specific requesting
origin, and set the session cookie's `SameSite=None; Secure`. I've left
that alone for now since same-origin deployment avoids needing it at all.

## Project structure

```
src/
  lib/            API client (lib/api.ts), formatting helpers
  store/          Zustand stores: cart, auth
  types/          Shared TypeScript types matching the DB schema
  components/     ui/ (generic), storefront/, admin/
  layouts/        StorefrontLayout, AdminLayout (route guard included)
  pages/
    storefront/   Home, Shop, ProductDetail, Cart, Checkout, ...
    admin/        Dashboard, Orders, Products, Categories, ...
server/           Additive PHP files for the admin panel (see its README)
e2e/              Playwright smoke scripts
```

