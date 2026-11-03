-- Step 8b: remember which discount/partner code a deal used, so its commission can be calculated from the code.
-- Safe to run more than once.
alter table public.deals add column if not exists discount_code text;
