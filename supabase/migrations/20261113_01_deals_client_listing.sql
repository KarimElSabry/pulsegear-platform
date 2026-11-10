-- Step 26: orders for watches listed on behalf of clients stay out of the finance system and the profit.
-- deals.client_listing = true marks such an order. It is copied from the product when a website order is approved,
-- and you can tick it by hand on any order. A completed order with this mark creates NO row in "sales", so revenue, profit,
-- milestones and the reports never count it.
-- Safe to run twice. Existing orders stay as they are (false).

alter table public.deals add column if not exists client_listing boolean not null default false;
