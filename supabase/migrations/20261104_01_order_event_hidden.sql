-- Step 19 (update): you can hide an update from the customer without deleting it. Safe to run more than once.
alter table public.order_events add column if not exists hidden boolean not null default false;
