# Schema changes and migration plan (as implemented)

File: `supabase/migrations/20261014_01_revenue_intelligence.sql`. Additive only: no existing row, column or policy is changed or dropped. Safe to run twice. Verified against a real Postgres engine (see `07-TEST-AND-VERIFICATION-REPORT.md`).

## What it adds

| Object | Purpose |
|---|---|
| `sales` + columns `order_ref, status, delivery_status, payment_method, product_id, discount_egp, shipping_revenue_egp, cash_collected_egp, cash_collected_at, reservation_id, request_id` | Order-level facts. Existing rows get `status='completed'`, zeros, nulls. `selling_price_egp` keeps its meaning: product amount charged after discount. |
| `products.cost_egp` | Default unit cost, copied into a sale at the moment of sale |
| `sale_items` | One row per product line (multi-product orders), with `unit_cost_egp_snapshot` |
| `refunds` | Partial refunds, `returned_quantity`, `restocked` |
| `order_costs` | Outbound/return shipping, packaging, payment fee, failed delivery, other variable (commission is deliberately not allowed here) |
| `operating_expenses` | Period costs incl. `tax` and `interest` (below the operating line); filtered by `expense_date` |
| `marketing_spend` | Spend per platform/campaign/day; `source_hash` UNIQUE prevents duplicate imports |
| `marketing_touchpoints` | Website events with UTM and click ids |
| `sales_attribution` | Exactly one row per sale (primary key). `attributed` requires written evidence (CHECK constraint) |

All new tables: RLS on, no policies, privileges revoked from `anon` and `authenticated`. Only the server (service-role key) reads or writes them.

## Decision: calculation layer in code, not SQL views

The brief allows "shared views or an equivalent backend calculation layer". One TypeScript layer (`src/lib/finance`) feeds the dashboard and every export, so a figure cannot differ between screens, and it is covered by unit tests. Duplicating the same rules in SQL views would create a second place to drift. Views can be added later as a read-only mirror.

## Legacy data

No backfill is run. Old `sales` rows are read as one item whose cost is the stored `cost_egp` (0 is treated as "missing", not "free"), `commission_egp` is read as a `commission` order cost, status `completed`. Cash for old rows is assumed fully collected and flagged. Nothing in production data is rewritten.

## Order of operations

1. `20260929_02_lock_down_access.sql` (security) then check the anon key returns nothing from `sales`.
2. `20261014_01_revenue_intelligence.sql`.
3. Deploy the code. Pages work even before step 2 (they show a "migration not applied" alert).
4. Enter product costs, then record costs/refunds/delivery in Admin → Analytics → Financial Records.
