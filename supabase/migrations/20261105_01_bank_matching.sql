-- Step 20: CIB and QNB statements next to Revolut, proof that every statement was read completely, and matches between lines.
-- Safe to run more than once. Server only (RLS on, no policies). Needs 20261101_01_tax_tracker.sql first.

alter table public.bank_transactions add column if not exists bank                text;
alter table public.bank_transactions add column if not exists account             text;
alter table public.bank_transactions add column if not exists reference           text;
alter table public.bank_transactions add column if not exists counterparty_name   text;
alter table public.bank_transactions add column if not exists counterparty_phone  text;
alter table public.bank_transactions add column if not exists balance             numeric(14,2);
alter table public.bank_transactions add column if not exists line_kind           text;
create index if not exists bank_transactions_phone_idx on public.bank_transactions (counterparty_phone);

-- One row per statement read, with the bank's own totals next to ours: this is your proof that nothing is missing.
create table if not exists public.statement_imports (
  id              uuid primary key default gen_random_uuid(),
  bank            text not null,
  account         text not null,
  currency        text not null,
  period_from     date,
  period_to       date,
  opening         numeric(14,2),
  closing         numeric(14,2),
  bank_debit_count   integer,
  bank_debit_total   numeric(14,2),
  bank_credit_count  integer,
  bank_credit_total  numeric(14,2),
  read_debit_count   integer not null default 0,
  read_debit_total   numeric(14,2) not null default 0,
  read_credit_count  integer not null default 0,
  read_credit_total  numeric(14,2) not null default 0,
  verified        boolean not null default false,
  note            text,
  file_name       text,
  created_at      timestamptz not null default now(),
  unique (bank, account, period_from, period_to)
);
alter table public.statement_imports enable row level security;

-- Matches: an exchange (EGP out <-> EUR in) or a customer payment (EGP in <-> order).
create table if not exists public.tx_matches (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('exchange', 'payment')),
  egp_tx_id    uuid not null references public.bank_transactions(id) on delete cascade,
  eur_tx_id    uuid references public.bank_transactions(id) on delete cascade,
  checkout_id  uuid,
  deal_id      uuid,
  expected     text,                         -- payments: 'deposit', 'full' or 'other'
  rate         numeric(12,4),                -- exchanges: EGP per EUR actually obtained
  score        numeric(4,2) not null default 0,
  status       text not null default 'suggested' check (status in ('suggested', 'confirmed', 'rejected')),
  auto         boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (kind, egp_tx_id)
);
create index if not exists tx_matches_checkout_idx on public.tx_matches (checkout_id);
alter table public.tx_matches enable row level security;
