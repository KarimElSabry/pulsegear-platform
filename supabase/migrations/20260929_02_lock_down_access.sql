-- 20260929_02_lock_down_access.sql
-- RUN THIS ONLY AFTER the new code is deployed and you have uploaded one test
-- product image from the admin page (it now uses /api/admin/upload-url).
--
-- Problems fixed (all verified from the schema dump of 2026-09-29):
--  1. sales:         policy "Admin full access"        ALL, role public, USING true
--                    -> anyone holding the public anon key (it ships in your site's
--                       JavaScript) can read, edit and DELETE every sale and profit row.
--  2. discount_codes: policy "service role full access" ALL, role public, USING true, WITH CHECK true
--                    -> anyone can list, create (e.g. a 100% code) or edit discount codes.
--  3. storage.objects (bucket product-images): "allow-all" INSERT/UPDATE/DELETE for anon
--                    -> anyone can upload, overwrite or delete product photos.
-- The server uses the service-role key, which bypasses RLS, so removing these
-- policies does not affect the app. Public READ of product-images stays.

begin;

-- 1) sales: no client access at all (RLS stays ON, so it is service-role only)
drop policy if exists "Admin full access" on public.sales;

-- 2) discount_codes: keep only the existing service-role policy
drop policy if exists "service role full access" on public.discount_codes;

-- 3) storage: remove anonymous writes, keep public read
drop policy if exists "allow-all 16wiy3a_1" on storage.objects;  -- INSERT
drop policy if exists "allow-all 16wiy3a_2" on storage.objects;  -- UPDATE
drop policy if exists "allow-all 16wiy3a_3" on storage.objects;  -- DELETE
-- keep: "allow-all 16wiy3a_0" (SELECT on bucket product-images)

commit;

-- Verify (expect: sales has no policies, discount_codes has only the service-role one,
-- storage has only the SELECT policy for product-images):
--   select tablename, policyname, cmd from pg_policies
--   where schemaname in ('public','storage')
--     and tablename in ('sales','discount_codes','objects') order by 1,2;
