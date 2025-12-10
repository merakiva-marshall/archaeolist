-- Enable RLS on tables flagged by Supabase
ALTER TABLE public.viator_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viator_tours ENABLE ROW LEVEL SECURITY;

-- Enable RLS on spatial_ref_sys skipped: System table, requires owner privileges.
-- You can ignore the "RLS Disabled" warning for spatial_ref_sys as it contains public reference data.

-- Fix "Security Definer" warning on sites_with_ref_count
-- We drop and recreate it with security_invoker = true (Postgres 15+)
DROP VIEW IF EXISTS public.sites_with_ref_count;

CREATE VIEW public.sites_with_ref_count WITH (security_invoker = true) AS
SELECT 
  s.id,
  s.name,
  s.description,
  s.location,
  s.country,
  s.country_slug,
  s.slug,
  s.address,
  s.images,
  s.wikipedia_url,
  s.is_unesco,
  s.short_description,
  s.processed_features,
  s.processed_periods,
  s.timeline,
  s.archaeological_site_yn,
  s.faqs,
  s.created_at,
  s.updated_at,
  s.features,
  s.period,
  s.metadata,
  COUNT(r.id) as reference_count
FROM sites s
LEFT JOIN "references" r ON r.site_id = s.id
GROUP BY 
  s.id, s.name, s.description, s.location, s.country, s.country_slug, s.slug,
  s.address, s.images, s.wikipedia_url, s.is_unesco, s.short_description,
  s.processed_features, s.processed_periods, s.timeline, s.archaeological_site_yn,
  s.faqs, s.created_at, s.updated_at, s.features, s.period, s.metadata;

GRANT SELECT ON public.sites_with_ref_count TO anon, authenticated;
