# Pulse Gear Revenue Intelligence: Phase 1 Audit

> **Status after implementation (2026-10-14)**
> Fixed in code: C1 (one server-side calculation, margin no longer trusted from the browser), C4, C5, C6, C7 (via sale items), C8, C10, C11, C12, C13 (Cairo time for default periods), C14, T1 to T5, Q1 (admin check in every finance and sales action), Q7 (tests).
> Still open (C9, the non-transactional discount-usage counter, is unchanged) and needing you: **S1 to S3 (run migration 02)**, C2/C3 historic values in the old Analytics page (the new dashboard uses the correct definitions), Q2 (97 existing `any`), Q3 (line endings), Q5.
> Real numbers from the live ledger (read-only, 23 sales): revenue 391,380 EGP, product cost 302,425.03, commission 2,678, profit 86,276.97 (matches the stored profit column exactly). 7 of 23 sales used a discount code but have no recorded discount amount; the reporting tables do not exist in production yet.


Date: 2026-10-14. Scope: the code in `pulsegear-platform/` plus a read-only look at the live Supabase schema
(table/column list and row counts only; no customer data was read or changed).
Not done: nothing was run (no Node on the audit machine), so every finding is from reading code and the live schema.

## 0. Act on this first (security)

| # | Finding | Evidence | Fix |
|---|---|---|---|
| S1 | **The `sales` table (every sale, cost and profit) can be read by anyone** holding the public anon key, which ships in the site's JavaScript. The policy also allows editing and deleting. | A HEAD request with the anon key returned 23 rows for `sales` and 6 for `discount_codes`. Migration `20260929_02_lock_down_access.sql` exists but has **not been applied** in production. | Run migration 02 in the Supabase SQL editor (the admin image upload already uses the signed-URL route it waits for). Then re-check with the anon key: it must return no rows. |
| S2 | `discount_codes` is also open to everyone (anyone can create a 100% code). | Same migration. | Same migration. |
| S3 | Storage bucket `product-images` allows anonymous upload/overwrite/delete. | Same migration. | Same migration. |

Nothing in Phases 2 to 6 should ship while S1 is open, because it would add more financial data to the same exposure.

## 1. Current data sources

| Source | Where | What it holds |
|---|---|---|
| `sales` | Supabase | One row per sale: product_name (free text), original_eur, shipping_eur, exchange_rate, cost_egp, selling_price_egp, profit_egp, profit_margin_pct, commission_egp, sale_channel, sale_date, source_platform, discount_code, deal_id, payment_type. 23 rows. |
| `deals` | Supabase | Sourcing deals (deposit, remaining amount, status, timestamps, sale_channel, commission). Linked to `sales` by `deal_id`. 0 rows visible to anon. |
| `products` | Supabase | Catalogue: `price_egp`, `original_price`, status, `sold_at`. **No cost column.** 49 available, 82 sold. |
| `reservations` | Supabase | name, phone, status (pending/confirmed/cancelled), `discounted_price`, discount_code. 7 rows. |
| `product_requests` | Supabase | Request form submissions, status, address. 23 rows. |
| `discount_codes` | Supabase | code, percent, usage_count. |
| GA4 | `src/lib/analytics.ts` via `/api/analytics` | Sessions, sources, pages, devices. Read-only reporting. |
| `src/components/GoogleAnalytics.tsx` | Browser | Sends only `page_view`. No custom events, no UTM/click-ID capture of our own. |
| Brevo | `src/lib/brevo.ts` | Newsletter contacts. |

Missing entirely: orders table, order items, refunds, order-level costs, operating expenses, advertising spend, marketing touchpoints, attribution, payments/cash collected, delivery status.

## 2. Current calculations

`sales.cost_egp = (original_eur + shipping_eur) * exchange_rate`
`sales.profit_egp = selling_price_egp - cost_egp - commission_egp`
Dashboard totals are plain sums of those stored columns (`src/app/admin/analytics/page.tsx`).

## 3. Findings: calculations and data consistency

| # | Severity | Finding | Where |
|---|---|---|---|
| C1 | High | **Two `addSale` implementations disagree.** `admin/actions.ts` ignores commission and rounds to 2 decimals and computes margin on the server; `admin/sales/actions.ts` subtracts commission, does not round, and **trusts `profit_margin_pct` sent by the browser**. The same sale gets different profit depending on which form saved it. The first appears unused (imported in `admin/page.tsx`, never called). | `src/app/admin/actions.ts:138`, `src/app/admin/sales/actions.ts:14` |
| C2 | High | "Margin" is `profit / cost` (a markup), not `profit / revenue`, yet it is labelled margin. A 25% markup shows as 25% but is a 20% margin. | `admin/actions.ts` (`profitMarginPct`) |
| C3 | High | "Avg Margin" is the **unweighted mean of per-sale percentages**. One cheap strap with a huge percentage skews it. Correct is total profit / total revenue. | `analytics/page.tsx` (`avgProfitMargin`) |
| C4 | Fixed (2026-10-10) | Reservations were presented as revenue ("Total Revenue, from confirmed reservations"). A confirmed reservation is not money received. They now appear under "On Hold". | `analytics/page.tsx`, `AnalyticsClient.tsx` |
| C5 | High | **No refunds, returns, cancellations-after-sale, failed deliveries, packaging, payment fees or outbound shipping.** `profit_egp` therefore overstates profit by every cost not typed into `commission_egp`/`shipping_eur`. | schema |
| C6 | High | **No product cost snapshot.** Cost lives only inside each sale row, typed per sale. Products carry no cost, so a product sold without a ledger entry has unknown cost, and "product profitability" cannot be computed. | schema |
| C7 | Medium | Sold products are not linked to sales. `sales.product_name` is free text, so the same item can be sold twice in the ledger, or be marked sold with no ledger entry (82 products sold vs 23 sales). Earnings are understated by whatever was never entered. | schema, `sales` |
| C8 | Medium | `updateSale` does not update `source_platform` / `source_url`, so edits silently drop them. | `sales/actions.ts:60` |
| C9 | Medium | `updateSale` / `deleteSale` / usage-count adjustments are separate round trips with no transaction. A failure mid-way leaves `discount_codes.usage_count` wrong. | `sales/actions.ts` |
| C10 | Medium | `exchange_rate` is typed per sale and defaults to 0 when blank (`|| 0`), which makes `cost_egp = 0` and profit equal to the full price, with no error. | `sales/actions.ts:15-19` |
| C11 | Medium | Discounts: `sales` stores the discount **code** but not the **amount**; gross sales and discount cannot be separated. `reservations.discounted_price` is the only place a discounted price is stored. | schema |
| C12 | Medium | `deals` deposit/remaining/`*_paid_at` hold collected cash, but analytics ignores them, so **cash collected vs revenue recognised is not distinguished** and a deal with only a deposit paid shows as nothing or as a full sale depending on whether someone made a `sales` row. | `deals`, `analytics/page.tsx` |
| C13 | Low | Dates are `toLocaleDateString` in the server time zone; `sale_date` is a plain date. A sale near midnight can land on a different day depending on where it renders. | `analytics/page.tsx` |
| C14 | Low | `payment_type` exists on `sales` but nothing reads it (COD vs prepaid is not reportable). | schema |

## 4. Findings: tracking and attribution

| # | Finding |
|---|---|
| T1 | GA4 receives page views only. No UTM / `fbclid` / `gclid` / `ttclid` is stored in our own database, so closing a sale can never be tied to a campaign. GA4 cannot be joined to individual sales. |
| T2 | `sale_channel` (whatsapp / instagram / website / personal / other) records where the *sale closed* and is entered by hand, not first-touch or campaign. |
| T3 | WhatsApp and Instagram order buttons were added on 2026-10-10 and send customers off-site. There is no event recorded when they are clicked. |
| T4 | Reservations and product requests do not store a source/UTM, so they cannot be attributed. |
| T5 | There is no advertising spend data anywhere. ROAS and cost per lead are currently not calculable. |

## 5. Findings: code quality and safety

| # | Finding |
|---|---|
| Q1 | Server actions in `sales/actions.ts`, `admin/actions.ts`, `deals/actions.ts` each build their own service-role Supabase client and do not call an admin check themselves. They rely on the `/admin` proxy. Safer: one shared `requireAdmin()` guard called at the top of every action and route. |
| Q2 | About 97 uses of `any` across `src`; most financial code reads untyped rows. A typed row mapper per table would catch the kind of mismatch in C1. |
| Q3 | Line endings are mixed (CRLF and LF). `git status` shows nearly every file modified for that reason, which hides real changes. Add a `.gitattributes` (`* text=auto eol=lf`) and normalise once. |
| Q4 | `src/app/admin/deals/page.tsx` on GitHub was overwritten with the public deals page (commit `b4edb44`). Local copy is correct (see changed_files). |
| Q5 | `contact/route.ts` posts to a hard-coded Google Apps Script URL and ignores failures; contact messages are not stored in the database. |
| Q6 | `.env.local` is correctly git-ignored, but the project tarballs contain it. Do not share the tar publicly; rotate keys if it was shared. |
| Q7 | Tests: none exist for any financial calculation. |

## 6. Customer-reported problems (2026-10-14)

1. **"Could not reserve items."** Live data: 49 products are available but only **16 are reservable and 33 are not**. On those 33 the old product page showed a button that did nothing, which is the most likely thing the customer hit. Reservations themselves work (the last ones were created on 2026-10-05, and the product-status constraint was already fixed). Fixed in code by the WhatsApp / Instagram order buttons (needs deploy). Also now: each new reservation sends you a Telegram message.
2. **No product-request notifications.** Telegram was configured in `.env.local` but no code used it. The bot token is valid (`@notifier_pulsegear_bot`). `/api/submit` now sends the request to Telegram. **You must add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in Vercel → Settings → Environment Variables and redeploy**, otherwise it silently does nothing in production (it logs `[telegram] ... not set`). Of the 23 requests in the database, the latest is 2026-10-10 with status "contacted".
3. **How many people subscribed / created accounts.** New admin page **Admin → 👥 Audience** shows total accounts, sign-ups in the last 7/30 days, unconfirmed emails, latest sign-ups, and newsletter subscribers from Brevo. Currently 8 profiles exist.

## 7. Required database changes (summary; detail in `02-SCHEMA-AND-MIGRATION-PLAN.md`)

Apply migration 02 (security). Then add: `orders`/`order_items` (or extend `sales`), `order_costs`, `operating_expenses`, `refunds`, `marketing_spend`, `marketing_touchpoints`, `sales_attribution`, product cost snapshot columns, views for reporting.

## 8. Validation of existing numbers

Re-derived from the stored columns: `profit = selling - cost - commission` is internally consistent for rows saved through `sales/actions.ts`; rows saved through the older `admin/actions.ts` omit commission. A reconciliation query to find rows where `profit_egp != selling_price_egp - cost_egp - coalesce(commission_egp,0)` is in the schema plan. Revenue, cost and profit figures should be treated as **gross of unrecorded costs** until Phase 2 is live.
