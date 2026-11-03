-- Step 15: shopping cart with "Confirm order". No payment on the website: you contact the customer on WhatsApp.
-- Safe to run more than once. RUN THIS (and 20261023_01) BEFORE deploying the step 15 code.
--
-- If you ran the EARLIER draft of this step (20261024_01_checkout.sql, with receipts and deposits), its tables are removed
-- first (only test orders could be in them) and created again in the simpler form below.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'checkout_orders' and column_name = 'receipt_token') then
    drop table if exists public.checkout_items cascade;
    drop table if exists public.checkout_orders cascade;
  end if;
end $$;
drop table if exists public.site_settings;
--
--  checkout_orders   one row per cart the customer confirms (status pending until you approve or reject it)
--  checkout_items    the items of that cart (title, color, price and quantity as they were at confirmation time)
--  deals.checkout_*  link an approved order's deals back to the cart, and keep the item name on the deal

create table if not exists public.checkout_orders (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique default ('PG-' || upper(substr(md5(gen_random_uuid()::text), 1, 8))),
  view_token      text not null default md5(gen_random_uuid()::text || gen_random_uuid()::text),
  user_id         uuid,
  customer_name   text not null,
  phone           text not null,
  email           text,
  address         text not null,
  customer_note   text,
  discount_code   text,
  subtotal_egp    numeric not null default 0,
  discount_egp    numeric not null default 0,
  total_egp       numeric not null default 0,
  status          text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
  hold_expires_at timestamptz,
  review_note     text,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists checkout_orders_status_idx on public.checkout_orders (status, created_at desc);
create index if not exists checkout_orders_user_idx on public.checkout_orders (user_id);

create table if not exists public.checkout_items (
  id              bigint generated always as identity primary key,
  checkout_id     uuid not null references public.checkout_orders(id) on delete cascade,
  product_id      bigint not null,
  variant_id      bigint,
  title           text not null,
  color_name      text,
  unit_price_egp  numeric not null,
  quantity        integer not null check (quantity > 0),
  discount_egp    numeric not null default 0,
  note            text,
  hold_kind       text check (hold_kind in ('oneoff', 'variant', 'product')),
  held            boolean not null default false,
  hold_until      timestamptz
);
create index if not exists checkout_items_checkout_idx on public.checkout_items (checkout_id);

-- No client access at all: the server (service role) is the only reader and writer.
alter table public.checkout_orders enable row level security;
alter table public.checkout_items enable row level security;

alter table public.deals add column if not exists checkout_id uuid;
alter table public.deals add column if not exists checkout_code text;
alter table public.deals add column if not exists item_title text;
create index if not exists deals_checkout_code_idx on public.deals (checkout_code);
