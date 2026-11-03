-- 20261014_01_revenue_intelligence.sql
-- Revenue Intelligence foundation. ADDITIVE ONLY: no existing row, column or policy is changed or dropped.
-- Safe to run more than once (IF NOT EXISTS everywhere). Run AFTER 20260929_02_lock_down_access.sql.
--
-- Rollback (nothing else depends on these, existing pages keep working without them):
--   drop table if exists sales_attribution, marketing_touchpoints, marketing_spend, operating_expenses,
--                        order_costs, refunds, sale_items cascade;
--   alter table sales drop column if exists order_ref, drop column if exists status, ...  (list in section 1)
--   alter table products drop column if exists cost_egp;

begin;

-- 1) sales: order-level fields. `selling_price_egp` keeps its meaning: product amount charged AFTER discount.
alter table public.sales add column if not exists order_ref            text;
alter table public.sales add column if not exists status               text        not null default 'completed';
alter table public.sales add column if not exists delivery_status      text;
alter table public.sales add column if not exists payment_method       text;
alter table public.sales add column if not exists product_id           bigint references public.products(id) on delete set null;
alter table public.sales add column if not exists discount_egp         numeric(12,2) not null default 0;
alter table public.sales add column if not exists shipping_revenue_egp numeric(12,2) not null default 0;
alter table public.sales add column if not exists cash_collected_egp   numeric(12,2);
alter table public.sales add column if not exists cash_collected_at    timestamptz;
alter table public.sales add column if not exists reservation_id       bigint;
alter table public.sales add column if not exists request_id           bigint;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_status_check') then
    alter table public.sales add constraint sales_status_check
      check (status in ('pending','completed','cancelled','failed_delivery'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sales_delivery_status_check') then
    alter table public.sales add constraint sales_delivery_status_check
      check (delivery_status is null or delivery_status in ('pending','shipped','delivered','failed','returned'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sales_payment_method_check') then
    alter table public.sales add constraint sales_payment_method_check
      check (payment_method is null or payment_method in ('cod','prepaid','deposit','other'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sales_nonneg_check') then
    alter table public.sales add constraint sales_nonneg_check
      check (discount_egp >= 0 and shipping_revenue_egp >= 0 and (cash_collected_egp is null or cash_collected_egp >= 0));
  end if;
end $$;

-- 2) products: default unit cost, copied into sale_items at the moment of sale (snapshot).
alter table public.products add column if not exists cost_egp numeric(12,2);

-- 3) sale_items: one row per product line when an order has several products.
create table if not exists public.sale_items (
  id                      uuid primary key default gen_random_uuid(),
  sale_id                 uuid not null references public.sales(id) on delete cascade,
  product_id              bigint references public.products(id) on delete set null,
  product_name            text not null,
  quantity                integer not null default 1 check (quantity > 0),
  unit_price_egp          numeric(12,2) not null check (unit_price_egp >= 0),
  unit_cost_egp_snapshot  numeric(12,2) check (unit_cost_egp_snapshot is null or unit_cost_egp_snapshot >= 0),
  created_at              timestamptz not null default now()
);
create index if not exists sale_items_sale_idx on public.sale_items(sale_id);

-- 4) refunds: partial refunds supported; returned_quantity + restocked drive COGS restoration.
create table if not exists public.refunds (
  id                 uuid primary key default gen_random_uuid(),
  sale_id            uuid not null references public.sales(id) on delete cascade,
  sale_item_id       uuid references public.sale_items(id) on delete set null,
  amount_egp         numeric(12,2) not null check (amount_egp > 0),
  returned_quantity  integer not null default 0 check (returned_quantity >= 0),
  restocked          boolean not null default false,
  reason             text,
  refunded_at        date not null default current_date,
  created_at         timestamptz not null default now()
);
create index if not exists refunds_sale_idx on public.refunds(sale_id);

-- 5) order_costs: variable costs of one order. (Legacy sales.commission_egp stays where it is and is read
--    as a 'commission' cost by the reporting layer, so it is never entered twice.)
create table if not exists public.order_costs (
  id           uuid primary key default gen_random_uuid(),
  sale_id      uuid not null references public.sales(id) on delete cascade,
  category     text not null check (category in
                 ('outbound_shipping','return_shipping','packaging','payment_fee','failed_delivery','other_variable')),
  amount_egp   numeric(12,2) not null check (amount_egp >= 0),
  incurred_at  date not null default current_date,
  note         text,
  created_at   timestamptz not null default now()
);
create index if not exists order_costs_sale_idx on public.order_costs(sale_id);

-- 6) operating_expenses: period costs, never charged to an order.
create table if not exists public.operating_expenses (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (category in
                  ('rent','salaries','software','tools','accounting','transport','other','tax','interest')),
  amount_egp    numeric(12,2) not null check (amount_egp >= 0),
  expense_date  date not null,
  note          text,
  created_at    timestamptz not null default now()
);
create index if not exists operating_expenses_date_idx on public.operating_expenses(expense_date);

-- 7) marketing_spend: unique source_hash makes re-importing the same CSV a no-op.
create table if not exists public.marketing_spend (
  id               uuid primary key default gen_random_uuid(),
  platform         text not null,
  campaign         text not null,
  spend_date       date not null,
  currency         text not null default 'EGP',
  amount           numeric(12,2) not null check (amount >= 0),
  fx_rate_to_egp   numeric(12,6) not null default 1 check (fx_rate_to_egp > 0),
  amount_egp       numeric(12,2) not null check (amount_egp >= 0),
  source           text not null default 'manual' check (source in ('manual','csv','meta_api')),
  source_hash      text not null unique,
  created_at       timestamptz not null default now()
);
create index if not exists marketing_spend_date_idx on public.marketing_spend(spend_date);

-- 8) marketing_touchpoints: website events with UTM / click-id context.
create table if not exists public.marketing_touchpoints (
  id                      uuid primary key default gen_random_uuid(),
  visitor_id              text,
  event                   text not null check (event in
    ('page_view','product_view','product_request_submitted','reservation_created','contact_click','whatsapp_click',
     'checkout_started','order_created','payment_confirmed','order_delivered','sale_completed','refund_issued',
     'lead_qualified')),
  occurred_at             timestamptz not null default now(),
  path                    text,
  detail                  text,
  product_id              bigint,
  ref_type                text,
  ref_id                  text,
  sale_id                 uuid references public.sales(id) on delete set null,
  utm_source              text,
  utm_medium              text,
  utm_campaign            text,
  utm_content             text,
  click_id_type           text,
  click_id                text,
  referrer                text,
  first_touch_source      text,
  last_non_direct_source  text
);
create index if not exists touchpoints_event_time_idx on public.marketing_touchpoints(event, occurred_at);
create index if not exists touchpoints_visitor_idx    on public.marketing_touchpoints(visitor_id);
create index if not exists touchpoints_ref_idx        on public.marketing_touchpoints(ref_type, ref_id);

-- 9) sales_attribution: exactly one row per sale (primary key), so campaign revenue cannot be counted twice.
--    'attributed' REQUIRES written evidence; anything else stays 'unknown'.
create table if not exists public.sales_attribution (
  sale_id                 uuid primary key references public.sales(id) on delete cascade,
  first_touch_source      text,
  last_non_direct_source  text,
  closing_channel         text,
  utm_source              text,
  utm_medium              text,
  utm_campaign            text,
  utm_content             text,
  model                   text not null default 'manual' check (model in ('first_touch','last_non_direct','manual','unknown')),
  status                  text not null default 'unknown' check (status in ('attributed','unknown')),
  evidence                text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint attribution_needs_evidence
    check (status = 'unknown' or (evidence is not null and length(btrim(evidence)) > 0))
);

-- 10) Security: RLS on, NO policies, no grants. Only the server (service-role key) can touch these tables.
alter table public.sale_items            enable row level security;
alter table public.refunds               enable row level security;
alter table public.order_costs           enable row level security;
alter table public.operating_expenses    enable row level security;
alter table public.marketing_spend       enable row level security;
alter table public.marketing_touchpoints enable row level security;
alter table public.sales_attribution     enable row level security;

revoke all on public.sale_items, public.refunds, public.order_costs, public.operating_expenses,
              public.marketing_spend, public.marketing_touchpoints, public.sales_attribution
  from anon, authenticated;

commit;

-- Verify:
--   select tablename, rowsecurity from pg_tables where schemaname='public'
--     and tablename in ('sale_items','refunds','order_costs','operating_expenses','marketing_spend','marketing_touchpoints','sales_attribution');
--   (all true) and the anon key must get 401/empty from /rest/v1/<each table>.
