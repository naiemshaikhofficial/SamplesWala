-- 1. CREATE PRESETS TABLE
CREATE TABLE IF NOT EXISTS presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID REFERENCES sample_packs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    audio_url TEXT NOT NULL, -- Preview MP3/WAV
    download_url TEXT NOT NULL, -- The actual preset file (.fst, .fxp, etc)
    plugin TEXT, -- e.g., 'Serum', 'Sylenth1', 'FL Studio Stock'
    category TEXT, -- e.g., 'Vocal', 'Lead', 'Bass'
    credit_cost INTEGER DEFAULT 1,
    video_url TEXT, -- YouTube demo link
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. UPDATE EXISTING TABLES
ALTER TABLE presets ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE sample_packs ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3. ENABLE RLS
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Presets are viewable by everyone" ON presets;
CREATE POLICY "Presets are viewable by everyone" ON presets FOR SELECT USING (true);

-- 4. CREATE UNIFIED VIEW (Flattened for Supabase Join Compatibility)
DROP VIEW IF EXISTS artifact_registry;
CREATE VIEW artifact_registry AS
SELECT 
    s.id, 
    s.pack_id, 
    s.name, 
    s.audio_url, 
    s.download_url, 
    s.bpm, 
    s.key, 
    s.type, 
    s.credit_cost, 
    s.created_at,
    NULL as video_url,
    'sample' as artifact_type,
    p.name as pack_name,
    p.category_id as pack_category_id,
    p.cover_url as pack_cover_url
FROM samples s
LEFT JOIN sample_packs p ON s.pack_id = p.id
UNION ALL
SELECT 
    pr.id, 
    pr.pack_id, 
    pr.name, 
    pr.audio_url, 
    pr.download_url, 
    NULL as bpm, 
    NULL as key, 
    'preset' as type, 
    pr.credit_cost, 
    pr.created_at,
    pr.video_url,
    'preset' as artifact_type,
    p.name as pack_name,
    p.category_id as pack_category_id,
    p.cover_url as pack_cover_url
FROM presets pr
LEFT JOIN sample_packs p ON pr.pack_id = p.id;

-- 4. INSERT SOME TEST CATEGORIES FOR PRESETS
INSERT INTO categories (name, slug) 
VALUES ('Vocal Presets', 'vocal-presets'), ('Plugin Patches', 'plugin-patches')
ON CONFLICT (slug) DO NOTHING;
