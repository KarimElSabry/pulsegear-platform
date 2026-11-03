# Rollout steps, what to expect, and the board pack

## A. One-time setup (in this order)
1. Supabase SQL editor: run `20260929_02_lock_down_access.sql`, then `20261014_01_revenue_intelligence.sql`. Check: Admin > Analytics > Sales performance loads without a "run the migration" banner.
2. Vercel env vars (Production), then redeploy:
   - Already planned: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, Brevo keys, `CRON_SECRET`.
   - Spend sync: `META_AD_ACCOUNT_ID`, `META_ACCESS_TOKEN` (system user, `ads_read`).
   - Pixel: `NEXT_PUBLIC_META_PIXEL_ID` (Events Manager > Data sources > your Pixel/dataset ID).
   - Conversions API: `META_CAPI_TOKEN` (Events Manager > your dataset > Settings > Conversions API > Generate access token).
   - Testing only: `META_TEST_EVENT_CODE` (Events Manager > Test events). Remove after testing, or events never count as real.
3. Ad links: every Meta ad URL parameters = `utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`.
4. Admin > Products: enter the cost of each product (profit is incomplete without it). Admin > Analytics > Finance: add monthly operating expenses.

## B. Verify it works (30 minutes)
- Events Manager > Test events: open the site, view a product, tap WhatsApp. PageView, ViewContent, Contact appear twice-labelled "Browser" and "Server" and merge as one (deduplicated).
- Make a test reservation and a test product request: a **Lead** arrives from Server with match keys (phone/email, fbp).
- Ad Spend page: press "Sync now" (30 days). Meta rows appear with source `meta_api`. Totals should equal Ads Manager for the same dates (differences < 1% are timezone/rounding).
- Delete `META_TEST_EVENT_CODE`, redeploy.

## C. What to expect
- Days 1-3: Leads and spend show; Events Manager "Event match quality" usually 5-7/10 (phone is hashed; email only on product requests).
- Week 1-2: cost per Lead per campaign becomes visible. Few conversions means noisy numbers: do not judge a campaign under ~30 clicks or ~3 leads.
- Sales: a sale is linked to a campaign only if the buyer's visit carried UTM/fbclid. WhatsApp/Instagram-first buyers stay "unknown". Expect a large unknown share at the start; that is the honest number. Reduce it by asking "where did you see us?" and recording it in the sale's attribution form (evidence required).
- Not sent to Meta: Purchase. Sales do not store buyer phone or click id, so Meta could not match them. To enable it later: add buyer phone to the order form, then send Purchase when a sale becomes recognised (completed; COD only once delivered).

## D. How to handle it weekly (15 minutes)
1. Sales performance: revenue, profit, ROAS by campaign (recognised revenue only; reservations are never revenue).
2. Pause campaigns with spend over 2x their typical cost per lead and no reservations. Raise budget 20% (not more) on campaigns with the lowest cost per reservation.
3. Review "unknown" share and the data-quality warnings (missing costs, missing attribution). Fix those before trusting profit.
4. Reconcile: reservations vs completed sales vs cash collected; chase COD delivery failures (they cost shipping both ways).
5. Privacy: the Pixel and cookies track visitors. Add a short note to the privacy policy; if you advertise to EU visitors, add a consent banner first.

## E. Board meeting pack (monthly)
1. **Headline scorecard** (one page): recognised revenue, gross profit and margin, operating expenses, net profit, cash collected, MoM change. Source: Reports export (PDF/HTML or XLSX).
2. **Funnel**: visits > product views > contact/WhatsApp clicks > reservations/requests > completed sales, with conversion at each step.
3. **Marketing efficiency**: spend, cost per lead, cost per sale, ROAS by campaign, and the share of sales with unknown source. Show attributed and unattributed separately; never blend them.
4. **Unit economics**: profit per order, return/refund rate, failed-delivery cost, margin by product category, products with missing cost.
5. **Cash and risk**: COD awaiting delivery, open reservations, refunds, inventory tied up, supplier concentration.
6. **Data quality statement**: what is measured, what is estimated, what is unknown. Boards trust numbers that admit their limits.
7. **Decisions requested** (each with the number behind it): budget by channel; stop/scale list of campaigns; stock purchases for top-margin products; hiring or tools; whether to add a payment/prepaid option to cut COD failure; whether to invest in order-form phone capture for Purchase tracking.
8. **Next-month targets**: recognised revenue, blended ROAS, cost per reservation, unknown-source share below 40%, COD failure rate.
