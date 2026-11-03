-- Tax tracker: bank transactions imported from Revolut (more banks later), merchant rules and tax settings.
-- Server only: RLS on, no policies (only the service-role key can read or write).

create table if not exists public.bank_transactions (
  id            uuid primary key default gen_random_uuid(),
  tx_hash       text not null unique,            -- same line imported twice is ignored
  source        text not null,                   -- 'revolut'
  tx_date       date not null,
  amount        numeric(14,2) not null,          -- signed, in `currency`
  fee           numeric(14,2) not null default 0,
  currency      text not null default 'EUR',
  description   text not null,
  merchant_key  text not null,                   -- normalised name used by rules
  tx_type       text,
  treatment     text not null default 'unreviewed'
                check (treatment in ('unreviewed','business','personal','internal')),
  has_receipt   boolean not null default false,
  note          text,
  created_at    timestamptz not null default now()
);
create index if not exists bank_transactions_date_idx on public.bank_transactions (tx_date);
create index if not exists bank_transactions_key_idx  on public.bank_transactions (merchant_key);
alter table public.bank_transactions enable row level security;

create table if not exists public.merchant_rules (
  merchant_key text primary key,
  treatment    text not null check (treatment in ('business','personal','internal')),
  updated_at   timestamptz not null default now()
);
alter table public.merchant_rules enable row level security;

create table if not exists public.tax_settings (
  id                    int primary key default 1 check (id = 1),
  owner_name            text not null default '',
  salary_taxable_eur    numeric(14,2) not null default 0,   -- yearly taxable income from the job
  hebesatz_pct          numeric(6,1)  not null default 450, -- trade-tax multiplier of your city
  prior_year_turnover   numeric(14,2) not null default 0,   -- turnover of the year before (Kleinunternehmer test)
  updated_at            timestamptz not null default now()
);
insert into public.tax_settings (id) values (1) on conflict do nothing;
alter table public.tax_settings enable row level security;
