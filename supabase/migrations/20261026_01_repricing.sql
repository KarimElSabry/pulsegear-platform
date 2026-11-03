-- Automatic EUR-based pricing. Safe to run more than once.
-- Nothing changes for any product until you approve changes on Admin > Pricing.

alter table public.products add column if not exists follows_eur boolean not null default false;
alter table public.products add column if not exists price_anchor_egp numeric;
alter table public.products add column if not exists price_anchor_rate numeric;
alter table public.products add column if not exists cost_eur numeric;

create table if not exists public.pricing_settings (
  id int primary key default 1 check (id = 1),
  auto_apply boolean not null default false,
  threshold_pct numeric not null default 2,
  max_change_pct numeric not null default 10,
  allow_lower boolean not null default true,
  min_margin_pct numeric not null default 15,
  target_margin_pct numeric not null default 20,
  landed_factor numeric not null default 1,
  manual_rate numeric,
  last_rate numeric,
  last_run_at timestamptz,
  last_proposal_sig text,
  updated_at timestamptz not null default now()
);
insert into public.pricing_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.price_changes (
  id bigserial primary key,
  batch_id uuid not null,
  product_id bigint not null,
  title text,
  old_price numeric not null,
  new_price numeric not null,
  old_anchor_egp numeric,
  old_anchor_rate numeric,
  old_follows boolean not null default false,
  rate numeric,
  reason text,
  created_at timestamptz not null default now(),
  undone_at timestamptz
);
create index if not exists price_changes_batch_idx on public.price_changes (batch_id);
create index if not exists price_changes_created_idx on public.price_changes (created_at desc);

-- server only: no policies, so the browser cannot read or write these
alter table public.pricing_settings enable row level security;
alter table public.price_changes enable row level security;
