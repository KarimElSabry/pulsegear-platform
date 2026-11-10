-- Step 21: sizes and prices per option.
-- One row of product_variants is one thing a customer can buy: a color, a size, or a color + size (for example Black / M-XL).
-- size_name  optional size label typed by you (XS-S, M-XL, M-XXL ...)
-- price_egp  optional price of this option; empty = the product's price
-- Safe to run twice. Products without sizes and prices keep working exactly as before.

alter table public.product_variants add column if not exists size_name text;
alter table public.product_variants add column if not exists price_egp numeric(12,2);

alter table public.product_variants drop constraint if exists product_variants_price_check;
alter table public.product_variants add constraint product_variants_price_check check (price_egp is null or price_egp > 0);
alter table public.product_variants drop constraint if exists product_variants_size_check;
alter table public.product_variants add constraint product_variants_size_check check (size_name is null or char_length(size_name) <= 40);
