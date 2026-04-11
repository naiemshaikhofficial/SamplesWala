-- SAMPLES WALA :: NUCLEAR SEO ENHANCEMENT
-- Adding video capability for Software Products to trigger VideoObject Rich Snippets.

ALTER TABLE software_products ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE software_products ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Update existing Visualizer Studio with a placeholder or just leave it empty for manual update
-- Since I don't have the actual YouTube link from the user yet, I'll let them update it via SQL or UI later.
-- But I'll set up the schema.
