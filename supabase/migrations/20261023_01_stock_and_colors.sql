-- Step 14: stock quantities and color options.
-- Safe to run more than once. RUN THIS BEFORE deploying the step 14 code.
--
--  products.stock_quantity   empty (NULL)  = a one-off item: it is sold once, and "status" says if it is still available
--                            a number      = normal stock: that many units can be bought (0 = out of stock)
--  product_variants          the colors (options) of ONE product, each with its own stock and its own photos
--  product_images.variant_id which color a photo belongs to (empty = shown for every color)

alter table public.products add column if not exists stock_quantity integer;
alter table public.products drop constraint if exists products_stock_quantity_check;
alter table public.products add constraint products_stock_quantity_check check (stock_quantity is null or stock_quantity >= 0);

create table if not exists public.product_variants (
  id            bigint generated always as identity primary key,
  product_id    bigint not null references public.products(id) on delete cascade,
  name          text not null,
  color_hex     text,
  stock_quantity integer,
  display_order integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  constraint product_variants_stock_check check (stock_quantity is null or stock_quantity >= 0),
  constraint product_variants_hex_check check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$')
);
create index if not exists product_variants_product_idx on public.product_variants (product_id, display_order);

-- Public read (the shop shows the colors); writes only through the server (service role bypasses RLS).
alter table public.product_variants enable row level security;
drop policy if exists "public read variants" on public.product_variants;
create policy "public read variants" on public.product_variants for select using (true);

alter table public.product_images add column if not exists variant_id bigint references public.product_variants(id) on delete set null;
