-- Step 23: remember when a campaign was emailed to the newsletter list, so it cannot be sent twice by a double click.
-- Safe to run twice.
alter table public.promotions add column if not exists emailed_at timestamptz;
