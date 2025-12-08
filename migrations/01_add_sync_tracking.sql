-- Add Sync Tracking columns to sites table
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS last_viator_sync timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS viator_sync_status text DEFAULT 'pending';

-- Add index for performance on syncing
CREATE INDEX IF NOT EXISTS idx_sites_last_viator_sync ON sites(last_viator_sync);
