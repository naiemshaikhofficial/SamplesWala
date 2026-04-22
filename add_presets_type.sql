-- 1. UPDATE SAMPLES TYPE CONSTRAINT
-- We need to drop the old constraint and add the new one that includes 'preset'

ALTER TABLE samples DROP CONSTRAINT IF EXISTS samples_type_check;

ALTER TABLE samples ADD CONSTRAINT samples_type_check 
CHECK (type IN ('one-shot', 'loop', 'preset'));

-- 2. CREATE A 'PRESETS' CATEGORY (Optional but recommended)
INSERT INTO categories (name, slug) 
VALUES ('Vocal Presets', 'vocal-presets')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug) 
VALUES ('Serum Presets', 'serum-presets')
ON CONFLICT (slug) DO NOTHING;

-- 3. NOTIFY
-- The 'type' column now accepts 'preset'. 
-- You can now upload preset demo audio as audio_url and the actual preset file as download_url.
