-- Returns a slim GeoJSON FeatureCollection of all archaeological sites for the map.
-- Only the fields needed to render dots + run client-side filtering are included
-- (no description/images/long text), and it bypasses the 1000-row PostgREST limit
-- by aggregating into a single JSON document. Backs lib/mapSites.ts -> fetchMapSites().
--
-- NOTE: this project does not use the Supabase CLI migration runner; this file is
-- kept as the source-of-truth definition for the function, which is applied to the
-- database directly.
create or replace function public.get_map_sites()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'type', 'FeatureCollection',
    'features', coalesce(jsonb_agg(
      jsonb_build_object(
        'type', 'Feature',
        'geometry', st_asgeojson(s.location)::jsonb,
        'properties', jsonb_build_object(
          'id', s.id,
          'name', s.name,
          'slug', s.slug,
          'country', s.country,
          'country_slug', s.country_slug,
          'is_unesco', coalesce(s.is_unesco, false),
          'periods', case
            when s.processed_periods is not null
            then array(select jsonb_object_keys(s.processed_periods))
            else array[]::text[]
          end,
          'features', case
            when s.processed_features is not null
            then array(select jsonb_object_keys(s.processed_features))
            else array[]::text[]
          end
        )
      )
    ), '[]'::jsonb)
  )
  from public.sites s
  where s.archaeological_site_yn = true
    and s.location is not null;
$$;

grant execute on function public.get_map_sites() to anon, authenticated;
