# Backend additions for the React admin panel

Your existing PHP project (`api/index.php` + `includes/config.php` +
`includes/schema.sql`) already covers everything the **storefront** needs:
products, auth, orders, Paystack, coupons, reviews. Nothing in this folder
touches those files.

The admin panel, though, needs a few endpoints the original API doesn't
have — categories CRUD, coupons CRUD, a customers list, review moderation,
a settings store, image upload/media library, and CSV export. The two files
here add exactly that, as a **separate, additive file** next to your
existing API.

## Install (two steps, ~2 minutes)

1. Copy `admin-extra.php` into your existing project's `api/` folder, so
   you end up with both `api/index.php` and `api/admin-extra.php` side by
   side. It reuses `getDB()`, `jsonResponse()`, `sanitize()`, `requireAuth()`
   and `requireAdmin()` from your existing `includes/config.php` — no
   changes needed there.

2. Run `extra-schema.sql` once against your existing `stylish_trends`
   database (phpMyAdmin → Import, or `mysql -u root stylish_trends <
   extra-schema.sql`). It only adds one new table, `settings`, seeded with
   sensible defaults for store info, shipping zones, WhatsApp, and payment
   display settings. It does not alter any existing table.

That's it — `admin-extra.php` is immediately reachable at
`/api/admin-extra.php?resource=...` on whatever host serves your existing
`api/index.php`.

## What it adds

| Endpoint | Purpose |
|---|---|
| `?resource=me` | Who's logged in (there's no such endpoint in the original API) |
| `?resource=public-settings` | Unauthenticated: WhatsApp number, shipping thresholds, store info — safe to expose |
| `?resource=categories` | Full CRUD (the original API can filter products by category but never lets you manage categories) |
| `?resource=coupons` | Full CRUD (the original API can only *validate* a coupon at checkout) |
| `?resource=customers` | List + detail with order history, computed from `users`/`orders` |
| `?resource=reviews` | List all reviews (incl. unapproved) + moderate/delete |
| `?resource=settings` | Get/update the general/shipping/whatsapp/payments key-value settings |
| `?resource=media` (GET/POST/DELETE) | List, upload, and delete files in `images/` — backs both the Media Library page and the image picker on the Products form |
| `?resource=export&type=orders\|products` | Streams a CSV |

## A known limitation, on purpose

`api/index.php`'s `createOrder()` calculates shipping with a hardcoded
₦50,000 threshold / ₦2,500 fee. The Shipping Zones admin page writes to the
new `settings` table and the storefront *displays* those numbers, but the
original file was left untouched, so the real order total at checkout still
uses the hardcoded values. If you want the Shipping page to actually
control pricing, add a few lines to `createOrder()` in `index.php` that
read from `settings` instead of the literals — that's a one-file, ~5-line
change, deliberately left to you rather than made silently in a file you
asked to keep intact.
