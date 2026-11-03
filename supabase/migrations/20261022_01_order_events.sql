-- Step 10: the order update log (like Vinted/DPD): every status change and every comment is kept with its exact time,
-- and the customer sees the list. Also allows the new status "egypt_handling" (Shipping handling in Egypt).
-- Safe to run more than once.

-- 1) allow the new status. If your deals table has a CHECK on status, replace it with one that includes egypt_handling.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
     where conrelid = 'public.deals'::regclass and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%deposit_pending%'
  loop
    execute format('alter table public.deals drop constraint %I', c.conname);
  end loop;
  if not exists (select 1 from pg_constraint where conname = 'deals_status_check' and conrelid = 'public.deals'::regclass) then
    alter table public.deals add constraint deals_status_check check (status in (
      'deposit_pending','deposit_paid','sourcing','purchased','shipping','arrived_egypt','egypt_handling',
      'out_for_delivery','delivered','remaining_pending','completed','cancelled'));
  end if;
end $$;

-- 2) the log. Everything here is shown to the customer, so internal notes stay in deals.notes.
create table if not exists public.order_events (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deals(id) on delete cascade,
  status      text,                       -- the status set by this update; empty for a comment-only update
  title       text not null,              -- e.g. "On its way from Europe"
  comment     text,
  created_at  timestamptz not null default now()
);
create index if not exists order_events_deal_idx on public.order_events (deal_id, created_at desc);

-- same protection as the finance tables: on, no policies. Only the server (service role) reads and writes it.
alter table public.order_events enable row level security;

-- 3) history for orders that already exist, from the dates saved on the order
insert into public.order_events (deal_id, status, title, created_at)
select d.id, v.status, v.title, v.at
  from public.deals d
 cross join lateral (values
   ('deposit_pending', 'Order received',        d.created_at),
   ('shipping',        'On its way from Europe', d.shipped_at),
   ('arrived_egypt',   'Arrived in Egypt',       d.arrived_egypt_at),
   ('delivered',       'Delivered',              d.delivered_at)
 ) as v(status, title, at)
 where v.at is not null
   and not exists (select 1 from public.order_events e where e.deal_id = d.id);
