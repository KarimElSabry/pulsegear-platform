-- Step 18: customers can pay the 50% deposit on the website and upload a receipt.
-- Safe to run more than once. Receipts are private: only the server (service role) can read or write them.

insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do update set public = false;

create table if not exists public.payment_receipts (
  id           uuid primary key default gen_random_uuid(),
  checkout_id  uuid not null references public.checkout_orders(id) on delete cascade,
  path         text not null,                 -- file in the private payment-receipts bucket
  mime         text not null,
  size_bytes   integer not null,
  method       text not null default 'instapay' check (method in ('instapay', 'bank')),
  amount_egp   numeric,                       -- what the customer says they sent
  payer_name   text,
  payer_phone  text,                          -- the number/account they paid from (used to match the bank statement)
  status       text not null default 'submitted' check (status in ('submitted', 'verified', 'rejected')),
  review_note  text,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists payment_receipts_checkout_idx on public.payment_receipts (checkout_id, created_at);
alter table public.payment_receipts enable row level security;
