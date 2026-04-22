-- SAMPLES WALA DATABASE SCHEMA

-- 1. CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SAMPLE PACKS
CREATE TABLE sample_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_inr DECIMAL(10, 2) NOT NULL,
    price_usd DECIMAL(10, 2) NOT NULL,
    cover_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SAMPLES
CREATE TABLE samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID REFERENCES sample_packs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    audio_url TEXT NOT NULL, -- Preview MP3
    download_url TEXT NOT NULL, -- High-quality external link
    bpm INTEGER,
    key TEXT,
    type TEXT CHECK (type IN ('one-shot', 'loop', 'preset')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PURCHASES
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pack_id UUID REFERENCES sample_packs(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT CHECK (currency IN ('INR', 'USD')),
    payment_id TEXT UNIQUE, -- Razorpay/PayPal transaction ID
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. DOWNLOADS (Tracking)
CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sample_id UUID REFERENCES samples(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 1,
    last_downloaded_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, sample_id)
);

-- ROW LEVEL SECURITY (RLS) policies

-- Categories & Sample Packs: Publicly viewable
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

ALTER TABLE sample_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sample packs are viewable by everyone" ON sample_packs FOR SELECT USING (true);

-- Samples: Preview (audio_url) is public, but download_url visibility should be restricted
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Samples are viewable by everyone" ON samples FOR SELECT USING (true);

-- Purchases: Only user can see their own purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);

-- Downloads: Only user can see their own download history
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own downloads" ON downloads FOR SELECT USING (auth.uid() = user_id);
