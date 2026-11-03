-- Milestones: a target (in EUR) you set by hand, shown as a progress bar on Admin > Milestones.
-- Run once in the Supabase SQL editor BEFORE deploying the milestones page. Nothing existing is changed.
create table if not exists public.milestones (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null check (length(btrim(title)) > 0),
  target_eur         numeric(12,2) not null check (target_eur > 0),
  metric             text not null default 'net_revenue' check (metric in ('net_revenue','net_result')),
  start_date         date,                      -- count sales from this date; empty = since the very first sale
  eur_rate_override  numeric(12,6) check (eur_rate_override is null or eur_rate_override > 0),
  achieved_at        timestamptz,
  archived           boolean not null default false,
  created_at         timestamptz not null default now()
);

-- Same security model as the other finance tables: RLS on, NO policies, only the server (service role) can use it.
alter table public.milestones enable row level security;
