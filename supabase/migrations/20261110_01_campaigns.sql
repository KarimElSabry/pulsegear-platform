-- Step 22: promotional campaigns (for example "Early White Friday").
-- A campaign has a name, optional start and end time, and a list of products with a percent off each.
-- While a campaign is live, the shop shows the sale price (regular price crossed out, percent badge, campaign name)
-- and the cart/checkout charge the sale price. Discount codes still work on top, unless you switch that off per campaign.
-- Safe to run twice.

create table if not exists public.promotions (
  id          bigint generated always as identity primary key,
  name        text not null,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true,
  allow_codes boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint promotions_name_check check (char_length(name) between 1 and 60),
  constraint promotions_dates_check check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create table if not exists public.promotion_products (
  promotion_id bigint not null references public.promotions(id) on delete cascade,
  product_id   bigint not null references public.products(id) on delete cascade,
  percent_off  numeric(5,2) not null,
  primary key (promotion_id, product_id),
  constraint promotion_products_percent_check check (percent_off > 0 and percent_off <= 95)
);
create index if not exists promotion_products_product_idx on public.promotion_products (product_id);

-- Everyone may READ campaigns (the shop shows them); only the server (service role) may change them.
alter table public.promotions enable row level security;
alter table public.promotion_products enable row level security;
drop policy if exists "public read promotions" on public.promotions;
create policy "public read promotions" on public.promotions for select using (true);
drop policy if exists "public read promotion products" on public.promotion_products;
create policy "public read promotion products" on public.promotion_products for select using (true);
