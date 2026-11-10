-- Step 25: products listed on behalf of clients.
-- client_listing = true marks a product that a client offered to you and you list on the website for them.
-- Customers can filter the shop by it. Safe to run twice; every existing product stays a normal product (false).
-- (Only a yes/no is stored here: the products table is readable by visitors, so no client names or commissions belong in it.)

alter table public.products add column if not exists client_listing boolean not null default false;
