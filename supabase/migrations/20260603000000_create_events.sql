-- Raw, append-only behavioral event log. This is the source-of-truth for how the
-- site is used (page views, Viator tour clicks, ...). Everything downstream
-- (trending sites, top-pages cron analysis, Viator click optimization) is just
-- queries and scheduled jobs on top of this table.
--
-- Design notes:
--  * No foreign keys by design. Events are an immutable log of "what happened";
--    they must record faithfully even if the referenced site/tour is later edited
--    or replaced (e.g. the Viator resync deletes & recreates tour rows). Joins to
--    sites / viator_tours are resolved at read time instead.
--  * id is bigint identity (not uuid) to keep the PK index small under high write
--    volume.
--  * country_slug is denormalized so "events by country" needs no join.
--  * metadata is a forward-compat hatch: tour position, experiment variant, etc.
--    can be added later with no schema change.
--
-- NOTE: this project does not use the Supabase CLI migration runner; this file is
-- kept as the source-of-truth definition, applied to the database directly.

create table if not exists public.events (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  event_type   text not null,        -- 'page_view' | 'viator_click' | 'viator_impression' | ...
  site_id      uuid,                  -- nullable: homepage / country pages have no site
  tour_id      text,                  -- nullable: only present on tour events
  country_slug text,                  -- denormalized for fast country rollups w/o a join
  path         text,                  -- e.g. '/sites/greece/knossos' — powers "top pages"
  session_id   text,                  -- anonymous, client-generated; counts uniques / dedupes
  referrer     text,                  -- optional traffic-source signal
  metadata     jsonb not null default '{}'::jsonb
);

comment on table public.events is
  'Append-only raw behavioral event log. No FKs by design; join to sites/viator_tours at read time.';

-- Indexes cover the Phase 2 read patterns (trending sites, tour CTR, top pages)
-- without table scans. Partial indexes keep the site/tour ones small since most
-- rows (page_views) have no tour_id and many have no site_id.
create index if not exists events_type_created_idx on public.events (event_type, created_at desc);
create index if not exists events_created_idx       on public.events (created_at desc);
create index if not exists events_site_created_idx  on public.events (site_id, created_at desc) where site_id is not null;
create index if not exists events_tour_created_idx  on public.events (tour_id, created_at desc) where tour_id is not null;

-- Lock the table down. Writes go exclusively through the /api/track route using the
-- service-role key, which bypasses RLS. With RLS enabled and NO anon/authenticated
-- policy, the public (anon) key can neither read nor write this table directly.
alter table public.events enable row level security;
