# Test and verification report (2026-10-14)

Environment: Node 22.11 installed locally (no root), Next 16.2.9, vitest 4.1.11.

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `vitest run` | **103 passed**, 1 skipped (the live read-only test needs `LIVE_SUPABASE=1`) |
| ESLint | clean on every new file and on the existing files I touched for tracking, reserve, submit, sales actions and product service. Older admin pages I edited (analytics, deals, add-product, manage-products) still carry their previous `any` errors; project-wide 117 errors (97 `no-explicit-any`) existed before |
| `next build` | succeeds; all new routes compile |
| Production server smoke test (real data, admin cookie) | dashboard, reports, finance, ad-spend and audience pages render (200); unauthenticated pages redirect to login; unauthenticated export returns 401; CSV, XLSX and HTML exports download for all six reports; bad report/format return 400 |
| `/api/track` | page_view accepted (204), server-only event rejected (400), bots ignored, GET refused |
| Migration | run twice on a real Postgres engine (PGlite): idempotent; legacy rows untouched; all new tables RLS-on and unreadable by `anon`; constraints reject bad status, negative discount, attribution without evidence, second attribution for a sale, commission as order cost, duplicate spend hash, zero refund, unknown event |
| Live ledger (read-only, 23 sales) | New layer reproduces stored revenue **391,380.00** and stored profit **86,276.97** exactly; all reconciliation checks pass |

## What the automated tests cover (all required scenarios)
Completed orders · discounts · frozen cost snapshots · COD (not revenue until delivered; cash vs revenue; outstanding) · deposit orders · legacy rows · cancellation (costs still count) · failed delivery · full return restocked / not restocked · partial and repeated refunds · refund above order value · multi-product orders with awkward rounding (product rows add up exactly) · multiple costs per order and no leakage between orders · legacy commission read once · previous-period comparison · filters · profit levels (contribution before/after ads, operating, net, and why net is blank) · unmatched ad spend · unknown attribution stays unknown · repeated attribution rows don't duplicate revenue · WhatsApp clicks are not leads · alias/case-insensitive campaign matching · report totals equal dashboard totals · costs report equals order costs + expenses + ad spend · no customer columns in any report · CSV formula injection, quoting, HTML escaping, valid XLSX · spend CSV parsing, in-file and cross-import duplicates, currency conversion, bad rows with line numbers · server-side validation (amounts, dates, enums, ids) · admin session required · attribution evidence rules · UTM/click-id/referrer parsing, first-touch vs last-non-direct, cookie round trip.

## Bugs the tests found and fixed during this work
1. Gross margin was never filled in on the totals.
2. Date validation accepted impossible dates such as 2026-02-30.
3. A test double exposed that "previous values" could be read after an update; the code was correct, the double was fixed to return copies.

## Not verified (be aware)
- Writing actions were tested against an in-memory fake of the Supabase client, not the real database, because the migration is not applied in production and test data must not be written there.
- The pages were rendered and fetched, not clicked in a browser; forms are exercised through their server actions in tests.
- Excel files were validated by re-reading them with the same library, not opened in Excel.

## Meta sync addendum
112 tests pass (9 new: config, mapping, stable hash, currency, pagination, off-domain paging refused, token never leaked, idempotent upsert). tsc clean, eslint clean on new files, `next build` OK.
