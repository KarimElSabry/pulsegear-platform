# changed_files

Full copies of every file added or changed (cumulative, including the earlier fixes), with the same paths as the project.
Copy everything into `pulsegear-platform/` (keeping folders), run `npm install`, then follow `docs/04-DEPLOYMENT-AND-ROLLBACK.md`.

Start with `docs/01-AUDIT-REPORT.md`. Docs 02 to 07 cover schema, definitions, deployment, business recommendations, attribution and the test report.

Two SQL files to run in Supabase (in this order, after `20260929_02_lock_down_access.sql` from the project): `supabase/migrations/20261014_01_revenue_intelligence.sql`. (`20261010_01_deals_customer_address.sql` is already applied.)
