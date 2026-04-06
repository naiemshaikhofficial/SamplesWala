-- 🧬 SAMPLES_WALA :: DATABASE_REPAIR_KIT (FINAL_STABLE_BUILD)
-- This script ensures all tables exist, uses modern gen_random_uuid(), and seeds default data.

-- 1. Ensure extensions
-- Modern Supabase already has gen_random_uuid() built-in via pgcrypto.

-- 2. CATEGORIES (Foundational)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Categories if missing
INSERT INTO categories (name, slug) VALUES
('Melodies', 'melodies'),
('Drums', 'drums'),
('Vocals', 'vocals'),
('Presets', 'presets'),
('FX', 'fx'),
('Loops', 'loops')
ON CONFLICT (slug) DO NOTHING;

-- 3. SUBSCRIPTION_PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    credits_per_month INTEGER NOT NULL,
    price_inr NUMERIC NOT NULL,
    price_usd NUMERIC NOT NULL,
    description TEXT,
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Plans if missing
INSERT INTO subscription_plans (name, credits_per_month, price_inr, price_usd, description, features) VALUES
('Starter', 100, 599, 7.99, 'Start your production journey.', ARRAY['100 Monthly Credits', 'Standard License']),
('Professional', 300, 1499, 14.99, 'For serious producers.', ARRAY['300 Monthly Credits', 'Advanced License']),
('Producer', 1000, 3999, 29.99, 'Master the marketplace.', ARRAY['1000 Monthly Credits', 'Universal License'])
ON CONFLICT DO NOTHING;

-- 4. CREDIT_PACKS
CREATE TABLE IF NOT EXISTS credit_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price_inr NUMERIC NOT NULL,
    price_usd NUMERIC NOT NULL,
    description TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Packs if missing
INSERT INTO credit_packs (name, credits, price_inr, price_usd, is_featured) VALUES
('Mini Pack', 50, 499, 5.99, false),
('Mega Bundle', 250, 1999, 24.99, true),
('Ultimate Stash', 1000, 4999, 59.99, false)
ON CONFLICT DO NOTHING;

-- 5. USER_SUBSCRIPTIONS (The Engine)
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id),
    current_credits INTEGER DEFAULT 0 NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
    UNIQUE(user_id)
);

-- 6. UNLOCKED_SAMPLES & PACKS
CREATE TABLE IF NOT EXISTS unlocked_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sample_id UUID REFERENCES samples(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sample_id)
);

CREATE TABLE IF NOT EXISTS unlocked_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pack_id UUID REFERENCES sample_packs(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pack_id)
);

-- 7. Security Policies (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_samples ENABLE ROW LEVEL SECURITY;

-- DROP PUBLIC SELECT POLICIES if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Categories public" ON categories;
DROP POLICY IF EXISTS "Plans public" ON subscription_plans;
DROP POLICY IF EXISTS "Packs public" ON credit_packs;

CREATE POLICY "Categories public" ON categories FOR SELECT USING (true);
CREATE POLICY "Plans public" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Packs public" ON credit_packs FOR SELECT USING (true);
CREATE POLICY "Users view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own library" ON unlocked_samples FOR SELECT USING (auth.uid() = user_id);

-- End of Kit
