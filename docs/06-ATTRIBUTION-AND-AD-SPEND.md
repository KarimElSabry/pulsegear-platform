# Attribution model and advertising spend

## What is captured
On every public page load `MarketingTracker` reads UTM parameters (`utm_source/medium/campaign/content`) and ad click ids (`gclid`, `fbclid`, `ttclid`, `msclkid`) from the URL, plus an external referrer. It keeps, in a first-party cookie for 90 days:
- **First touch**: the first visit seen (may be "direct").
- **Last non-direct touch**: the latest visit that had a UTM, click id or external referrer. A direct visit never overwrites it.

Events written to `marketing_touchpoints`: `page_view`, `product_view`, `contact_click` (Instagram button), `whatsapp_click` (browser, via `/api/track`, which accepts only these client events); `product_request_submitted` and `reservation_created` (recorded by the server routes that create them, with the record id); `order_created`, `sale_completed`, `order_delivered`, `payment_confirmed`, `refund_issued` (recorded by admin actions, linked to the sale). `checkout_started` is accepted but unused because the site has no checkout. `lead_qualified` exists for recording a qualified lead manually; nothing writes it automatically.

## Attribution fields per sale
`first_touch_source`, `last_non_direct_source`, `closing_channel`, `utm_source/medium/campaign/content`, `model` (`first_touch`, `last_non_direct`, `manual`, `unknown`), `status` (`attributed` or `unknown`).

## Rules that keep it honest
1. A sale is `unknown` unless an admin attributes it. No sale is ever attributed automatically.
2. `attributed` requires written evidence (enforced by the form **and** by a database CHECK constraint), or a tracked source on the reservation/request the sale came from (the evidence text then names the touchpoint id). If that record has no tracked source the action refuses.
3. A WhatsApp or Instagram click is counted as a "contact click", never as a lead. Leads are distinct visitors who submitted a request or created a reservation.
4. One attribution row per sale, so a sale lands in at most one campaign and campaign revenue plus unattributed revenue always equals total net revenue.
5. Spend with no attributed orders is shown as "unmatched spend", never assigned.

## Model limits (read before trusting a campaign number)
- Attribution is **manual or reservation/request based**. A customer who sees an ad and then orders by WhatsApp from a bookmark is `unknown` unless you ask them and record the evidence.
- Visitors on other devices or with cookies cleared lose their history.
- `last_non_direct` is the default model for tracked records; there is no multi-touch or time-decay model.
- Cost per qualified lead is blank until you record qualified leads.
- ROAS is attributed revenue / spend. It is not profit; use Contribution After Ads for profit.

## Advertising spend
Admin → Analytics → Ad Spend: manual entry or CSV import (`platform, campaign, date, amount`, optional `currency, amount_egp, fx_rate`). Spend in a currency other than EGP needs an EGP amount or an exchange rate, otherwise the row is rejected. Duplicates are prevented by `source_hash` (platform, campaign, date, currency, amount; case and spacing ignored): re-importing a file reports "already existed" and adds nothing. Platform names are matched with a few aliases (`ig` = `instagram`, `fb` = `facebook`, `tt` = `tiktok`, `google ads` = `google`). Automatic platform API import is intentionally not built yet; validate these reports first.

## Automatic Meta (Facebook/Instagram) spend sync

Spend is pulled daily from the Meta Marketing API (read-only, `ads_read`) by `/api/cron/meta-spend` (vercel.json, 04:37 UTC). It can also be run from Admin > Analytics > Ad Spend ("Sync now", 1-90 days for backfill).

- One `marketing_spend` row per campaign per day, `source = 'meta_api'`, platform `meta`. The hash is platform|campaign|date (no amount), so each run **updates** recent rows as Meta finalises numbers; the last 7 days are re-pulled each run.
- Non-EGP accounts are converted with a live rate (open.er-api.com), falling back to `META_FX_RATE_TO_EGP`.
- Token is sent in an Authorization header only, never logged. Errors (expired token, missing permission, rate limit) show plainly on the page.
- Env vars (Vercel + `.env.local`): `META_AD_ACCOUNT_ID`, `META_ACCESS_TOKEN`, optional `META_GRAPH_VERSION` (default v25.0), `META_FX_RATE_TO_EGP`. Also needs `CRON_SECRET` (already used by the other crons).
- Sales are matched to this spend only when the visitor arrived through an ad URL tagged `utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`. Chats that start in WhatsApp/Instagram without visiting the site cannot be linked automatically.
