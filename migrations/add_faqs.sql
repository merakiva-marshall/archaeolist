-- Drop unused tables
DROP TABLE IF EXISTS map_clusters;

-- Add faqs column to sites table
ALTER TABLE sites ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

-- Drop the existing view
DROP VIEW IF EXISTS sites_with_ref_count;

-- Recreate the view with the new faqs column
CREATE VIEW sites_with_ref_count AS
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

-- Grant permissions
GRANT SELECT ON sites_with_ref_count TO anon, authenticated;
