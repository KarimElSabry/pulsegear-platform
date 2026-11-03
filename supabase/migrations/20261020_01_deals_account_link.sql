-- Step 8: link a deal (order) to a registered account so the customer can follow it under /account/orders.
-- Safe to run more than once. Customers never read this table directly: the page uses the server (service role)
-- and filters on user_id, and it only returns customer-safe fields (no cost, margin or source price).

alter table public.deals add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.deals add column if not exists tracking_number text;
alter table public.deals add column if not exists carrier text;
alter table public.deals add column if not exists customer_message text;  -- short note the customer sees on the order

create index if not exists deals_user_id_idx on public.deals (user_id);

-- Orders that came from a request made while logged in are linked automatically.
update public.deals d
   set user_id = pr.user_id
  from public.product_requests pr
 where d.product_request_id = pr.id
   and d.user_id is null
   and pr.user_id is not null;
