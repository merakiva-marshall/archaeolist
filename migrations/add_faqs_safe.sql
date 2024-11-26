-- Add faqs column to sites table
ALTER TABLE sites ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

-- Add faqs column to the materialized view
ALTER MATERIALIZED VIEW sites_with_ref_count 
ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

-- Update the materialized view to include the faqs data
REFRESH MATERIALIZED VIEW sites_with_ref_count;
