-- Add featured column to sites table
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN sites.featured IS 'Indicates if the site should be featured on the homepage.';
