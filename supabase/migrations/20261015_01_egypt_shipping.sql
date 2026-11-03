-- Shipping inside Egypt (EGP) for deals and sales. Run once in the Supabase SQL editor BEFORE deploying the code that writes it.
-- Existing rows get 0, so no past figure changes. The existing shipping_eur column is "shipping from Germany".
alter table public.deals add column if not exists egypt_shipping_egp numeric(12,2) not null default 0 check (egypt_shipping_egp >= 0);
alter table public.sales add column if not exists egypt_shipping_egp numeric(12,2) not null default 0 check (egypt_shipping_egp >= 0);
