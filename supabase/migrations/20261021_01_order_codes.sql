-- Step 9: every deal (order) gets a short public order ID like PG-3FA9C21B, plus an optional expected delivery date.
-- The ID is what a customer types on /track-order (with the last 4 digits of the phone on the order).
-- Safe to run more than once.

alter table public.deals add column if not exists expected_delivery_date date;
alter table public.deals add column if not exists order_code text;

-- existing orders
update public.deals
   set order_code = 'PG-' || upper(substr(md5(gen_random_uuid()::text || id::text), 1, 8))
 where order_code is null;

-- every future order
alter table public.deals alter column order_code
  set default ('PG-' || upper(substr(md5(gen_random_uuid()::text), 1, 8)));

create unique index if not exists deals_order_code_key on public.deals (order_code);
