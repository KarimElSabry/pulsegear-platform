-- Who bought: optional customer name and phone on each sale. Powers "repeat buyers" and, later, Meta Purchase tracking.
-- Run once before deploying. Existing sales get empty values; nothing else changes.
alter table public.sales add column if not exists customer_name  text;
alter table public.sales add column if not exists customer_phone text;
create index if not exists sales_customer_phone_idx on public.sales (customer_phone) where customer_phone is not null;
