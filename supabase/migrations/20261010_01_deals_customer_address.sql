-- Buyer's delivery address on a deal. Run once in the Supabase SQL editor BEFORE deploying the code that writes it.
alter table public.deals add column if not exists customer_address text;
