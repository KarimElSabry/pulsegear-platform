# Deployment and rollback

## Deploy

1. Copy `changed_files/src`, `changed_files/supabase`, `changed_files/package.json`, `changed_files/vitest.config.mts` into `pulsegear-platform/`, then run `npm install` (adds `exceljs` and the dev dependency `vitest`).
2. Locally: `npm run test` (expect all green), `npx tsc --noEmit`, `npm run build`.
3. Supabase → SQL editor, in this order:
   a. `supabase/migrations/20260929_02_lock_down_access.sql`. Afterwards a request to `/rest/v1/sales` with the anon key must return nothing.
   b. `supabase/migrations/20261014_01_revenue_intelligence.sql`.
4. Vercel → Environment Variables: confirm `ADMIN_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and add `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `BREVO_API_KEY`, `BREVO_NEWSLETTER_LIST_ID`. Redeploy.
5. `git pull`, then restore the deals page overwritten on GitHub (`src/app/admin/deals/page.tsx` is in `changed_files`).
6. Smoke test (about 10 minutes):
   - Admin → Product costs: set a cost on one product (Financial Records, section 7).
   - Financial Records: open a sale, set delivery/payment, add an order cost, add a partial refund. Open Sales Performance for the month: the numbers move as expected and "Trace" opens the matching report.
   - Ad spend: import a 2-line CSV twice; the second import must say "already existed".
   - Reports: download CSV, Excel and the printable page for each of the six reports; open the Data Quality report: every reconciliation row says `ok`.
   - Storefront: open `/products/<id>?utm_source=instagram&utm_campaign=test`, click "Order on WhatsApp", then check `marketing_touchpoints` has `page_view`, `product_view`, `whatsapp_click` with the utm values.

## Roll back

- Code: `git revert` the commit and redeploy (or Vercel → previous deployment → Promote). The old analytics page and sales forms keep working because no old column was changed.
- Database: nothing existing was altered. To remove the feature entirely: `drop table if exists sales_attribution, marketing_touchpoints, marketing_spend, operating_expenses, order_costs, refunds, sale_items cascade;` then drop the added `sales` and `products` columns listed at the top of the migration. Do this only if you have no data you want to keep in those tables.
- Tracking only: remove `<MarketingTracker />` from `src/app/layout.tsx`.
