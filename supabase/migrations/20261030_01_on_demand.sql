-- Step 16: products that are bought on demand stay on sale when an order is placed or confirmed. Safe to run more than once.

alter table public.products add column if not exists on_demand boolean not null default false;

-- A cart line for such a product holds nothing, so its hold kind needs one more allowed value.
alter table public.checkout_items drop constraint if exists checkout_items_hold_kind_check;
alter table public.checkout_items add constraint checkout_items_hold_kind_check
  check (hold_kind is null or hold_kind in ('oneoff', 'variant', 'product', 'ondemand'));

-- Starting point: the official-store products (bought for the customer after they order) become "always available".
-- Hot deals and anything with a stock number are left alone. Change any product later in Admin > Products > Stock & Colors.
update public.products
   set on_demand = true
 where on_demand = false
   and stock_quantity is null
   and is_deal is not true
   and title ilike '%Official Store%';
