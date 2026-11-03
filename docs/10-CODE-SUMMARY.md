# Pulse Gear: what the code has, how it works, and where to improve

Written for the owner first, with a technical appendix at the end for a developer.

---

## 1. What the system is, in one paragraph

A Next.js website (hosted on Vercel) with a Supabase database. Customers browse second-hand and new running gear, reserve items, request products you do not stock, subscribe to the newsletter and create accounts. You run the shop from an admin area: products, reservations, requests, deals, sales, customers, and a finance layer that turns your sales into revenue, profit, ad return and euro figures. Telegram tells you when something happens. Brevo sends the newsletter. Meta (optional) supplies ad spend.

## 2. The parts, and how a customer's action becomes a number

```
Customer on the site
  |-- views products, taps WhatsApp/Instagram  --> tracking records source + campaign (cookie)
  |-- reserves an item / sends a product request --> saved in Supabase + Telegram message to you
  |-- subscribes / creates an account            --> Supabase (+ Brevo list when they tick the box)
You in the admin
  |-- confirm a reservation, complete a deal, add a sale --> a row in the sales ledger
  |-- enter costs, refunds, expenses, ad spend (or Meta fills it) --> finance tables
Finance engine (one function: analyze)
  |--> Sales Performance dashboard, six downloadable reports, milestone progress, euro figures
```

### Customer side
| Area | What it does |
|---|---|
| Products and Hot Deals | Available first, reserved next, sold last. Sizes: 39-42, 43-46, 47+ mm, One Size. |
| Order buttons | WhatsApp (+201205322444) with the product filled in, or Instagram. |
| Reservations | A hold with a deposit window; name and phone are saved; you confirm or cancel. A sold item stops counting as reserved. |
| Product requests | Form with address and budget, saved with a status, Telegram alert. |
| Accounts | Supabase sign-in, profile (name, phone, sport, newsletter choice). |
| Newsletter | Footer/homepage form and the account tick box add the person to a Brevo list. A Monday job sends the weekly update, skipped when nothing is new or sold. |

### Admin side
| Page | Purpose |
|---|---|
| Products, Reservations, Requests, Deals | Day-to-day work. Deals now carry buyer address, Germany and Egypt shipping, and show cost and expected profit in EGP and EUR. |
| Sales | The manual sales ledger. |
| Audience | Account and newsletter counts, plus a searchable Customers table (name, email, phone, address). |
| Analytics > Sales Performance | The dashboard (see section 3). |
| Analytics > Finance | Seven small forms to record costs, refunds, expenses, sources, product costs. |
| Analytics > Ad Spend | Meta sync (daily, optional) or manual or CSV entry. |
| Analytics > Reports | Six reports as CSV, Excel and printable PDF, with EUR columns. |
| Milestones | A target in euros with a progress bar and a celebration. |

## 3. The finance logic (the part that matters most)

1. **What counts as revenue:** a sale is completed, its delivery did not fail, and cash-on-delivery is counted only once delivered. Reservations, cancellations and failed deliveries are never revenue.
2. **One calculation for every screen:** `analyze()` produces every total. The dashboard, reports, exports, and the milestone page all read its result, so they always agree.
3. **The cost chain:** revenue minus product cost (including Germany shipping converted at the deal's rate, plus Egypt shipping) = gross profit. Minus order costs = contribution before ads. Minus ad spend = contribution after ads. Minus monthly expenses = operating profit. Minus tax and interest = net profit.
4. **Net result so far:** the same chain but it always shows a number, built only from what you entered, with a yellow list of what is missing. Official Net Profit stays blank until the data is complete.
5. **Frozen history:** a sale keeps the product cost it had when it was made. Changing a product's cost later never rewrites old sales.
6. **Euros:** live EGP to EUR rate (refreshed hourly), or a rate you fix yourself on a milestone. Applied beside every money figure and in the report exports.
7. **Honest attribution:** a sale is linked to an ad only with evidence (tracked visit or a written note). Everything else stays "unknown" and is never credited to a campaign.

## 4. Security and safety

- Admin pages and all internal APIs require the admin cookie; the public APIs are an explicit short list.
- Money tables have row-level security with no public policies; only the server (service key) reads them.
- Server actions re-check admin and re-validate every amount; the browser's totals are never trusted.
- Phone and email are hashed before going to Meta; the Pixel and Conversions API exist but are optional (step 5).
- Secrets live in Vercel environment variables, never in code.

## 5. Tests

Automated tests cover the money maths, report totals, euro conversion, spend import and sync, tracking, customer join, milestones and sorting (131 at last count). Run with `npm run test`.

---

## 6. Potential improvements (most useful first)

**Done in step 7:** admin actions now check the admin login themselves (a test enforces it); Health page and Telegram alerts for failed scheduled jobs; Stock page (age, tied-up money, items without cost); buyer phone on sales and repeat buyers; schema check against the live database; CI workflow.
**Still open:** automatic sale from a confirmed reservation (needs a rule to avoid double counting with manual entries), one shared function to create sales, deposits and failed-COD tracking, Meta Purchase events, error monitoring service (Sentry), shared rate limiter, cookie consent, and about 150 older lint warnings (`any` types).
**Noticed, not changed:** two folders differ only by capital letter (`admin/Leads` and `api/Leads`); that works on Windows but can break on Linux hosts, so rename them to lowercase.

**Business value**
1. **Record real costs.** Shipping and fulfilment show 0.00 until you enter them, so profit is overstated. Add order costs at the time of delivery, or add Germany/Egypt shipping on every deal.
2. **Put the buyer's phone on every sale.** It unlocks Purchase tracking to Meta and lets you link a sale to the customer, the reservation and the chat.
3. **Close the reservation-to-sale loop.** When a reservation is confirmed and the item sold, create the sale row automatically with the cost snapshot. Today this is manual in places.
4. **Inventory view.** Cost of stock on hand, days in stock, items unsold for 30+ days. Slow stock is cash tied up.
5. **Deposits and cash-on-delivery.** Track deposit paid, balance due and failed COD per order; failed deliveries cost shipping both ways.
6. **Customer value.** Repeat customers, average spend per customer, who to message first.

**Engineering**
7. Three places create a sale (manual form, deals completion, the analytics add form). Merge them into one function so cost, shipping and EUR logic live once.
8. Keep a single copy of the database schema in the repo (a `schema.sql` plus ordered migrations) and generate TypeScript types from it, so a wrong column name is caught before deploy. This is how the `customer_name` mistake would have been caught.
9. Add a CI step on every push: type check, tests, build.
10. Set up error monitoring (for example Sentry) and a daily check that the cron jobs ran. The newsletter silently failed for weeks because the key was wrong and nothing told you.
11. The profile save and some older routes still use loose typing (`any`); tighten them.
12. Rate limiting for public forms is per server instance; move it to a shared store (Upstash) if spam grows.
13. Consider cookie consent if you advertise to the EU.

---

## 7. What to track (and how often)

**Weekly (10 minutes)**
- Net sales revenue (EGP and EUR) and **Net result so far**; the milestone progress bar.
- Orders completed, average order value.
- Cost per completed order (ad spend / orders) and ROAS by campaign.
- Reservations and requests received, and how many became sales (conversion).
- Cash-on-delivery failures and refunds.
- New accounts, newsletter subscribers.

**Monthly**
- Gross margin and margin by product and brand; what to source more of.
- Operating expenses entered, so Net Profit is real.
- Unknown-source share of sales (target below 40%).
- Stock aging.

**Events worth adding to tracking later**
| Event | Why |
|---|---|
| Reservation created, confirmed, cancelled, expired | Funnel and drop-off |
| Reservation to sale time (hours) | Speed of your follow-up |
| Request status changes (new, contacted, deal agreed, completed) | Which requests convert |
| Deal stage durations (deposit paid to delivered) | Where orders get stuck |
| WhatsApp click to message to sale (manual tag "came from site") | True conversion of the site |
| Newsletter sent, opened, clicked (from Brevo) | Does the email earn money |
| Product views vs. reservations per product | Which items attract interest but do not sell (price?) |
| Search terms on the site | What people look for and you lack |

**Decision rules to keep**
- Pause an ad that spent over twice your usual cost per order with no reservation; raise the best one by 20%.
- Do not judge an ad on fewer than about 30 clicks.
- Treat any figure with a yellow "not final" note as an estimate.

---

## 8. Technical appendix (for a developer)

- Stack: Next.js 16 (App Router, server actions, `proxy.ts` as auth gate), React 19, Tailwind 4, Supabase (Postgres, Auth, Storage), Vercel (crons in `vercel.json`), Vitest, exceljs.
- Finance layer, `src/lib/finance/`: `types`, `money` (per-order rounding), `range` (Cairo time), `sale` (recognition and per-order result), `engine` (`analyze`), `campaigns`, `attribution`, `quality` (reconciliation), `reports`, `export`, `spend`, `summary` (net result so far), `fx` (EUR rate), `load` (Supabase to domain objects), `validate`.
- Tracking, `src/lib/tracking/`: first-party cookies (`pg_vid`, `pg_attr`), `/api/track` for client events, server events recorded by the routes that create reservations and requests.
- Meta, `src/lib/meta/`: `insights` (Marketing API client), `sync` (idempotent upsert on a stable hash), `capi` (Conversions API, optional).
- Milestones: `src/lib/milestones.ts`, `src/app/admin/milestones/`, table `milestones`.
- Migrations in `supabase/migrations/`, run in date order; each is idempotent and non-destructive.
- Environment variables: Supabase URL and keys, `ADMIN_SECRET`, `CRON_SECRET`, `BREVO_*`, `TELEGRAM_*`, `META_*` (optional), `NEXT_PUBLIC_SITE_URL`.
