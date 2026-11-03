-- Job log: one row per scheduled run (newsletter, Meta spend, release of expired reservations, Vinted check).
-- Powers Admin > Health, so a job that silently stops working is visible. Run once; nothing existing is changed.
create table if not exists public.job_runs (
  id           bigint generated always as identity primary key,
  job          text not null,
  ok           boolean not null,
  status       integer,
  message      text,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz not null default now()
);
create index if not exists job_runs_job_started_idx on public.job_runs (job, started_at desc);

-- Server only, like the other internal tables: RLS on, no policies.
alter table public.job_runs enable row level security;
