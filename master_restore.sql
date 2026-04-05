-- MASTER RESTORE SCRIPT FOR SAMPLES WALA
-- WARNING: This will drop all existing data and recreate the schema from scratch.

-- 1. DROP EXISTING OBJECTS (CASCADE ensures dependent objects like triggers/policies are also removed)
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS unlocked_samples CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS downloads CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS samples CASCADE;
DROP TABLE IF EXISTS sample_packs CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

DROP TYPE IF EXISTS sample_type CASCADE;

DROP FUNCTION IF EXISTS reward_referral CASCADE;
DROP FUNCTION IF EXISTS can_spend_credits CASCADE;
DROP FUNCTION IF EXISTS handle_subscription_update CASCADE;

-- 2. CREATE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. CREATE CUSTOM TYPES
CREATE TYPE sample_type AS ENUM ('one-shot', 'loop', 'preset', 'patch');

-- 4. CREATE TABLES

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Sample Packs
CREATE TABLE sample_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_inr DECIMAL(10, 2) NOT NULL,
    price_usd DECIMAL(10, 2) NOT NULL,
    bundle_credit_cost INTEGER DEFAULT 50, -- Added from Pro Suite
    cover_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Samples
CREATE TABLE samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID REFERENCES sample_packs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    audio_url TEXT NOT NULL, -- Preview MP3
    download_url TEXT NOT NULL, -- High-quality external link
    bpm INTEGER,
    key TEXT,
    type sample_type NOT NULL, -- Now using ENUM
    credit_cost INTEGER DEFAULT 1, -- Added from Subscription system
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchases (Legacy/Direct)
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pack_id UUID REFERENCES sample_packs(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT CHECK (currency IN ('INR', 'USD')),
    payment_id TEXT UNIQUE,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Downloads (Tracking)
CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sample_id UUID REFERENCES samples(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 1,
    last_downloaded_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, sample_id)
);

-- Subscription Plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    credits_per_month INTEGER NOT NULL,
    price_inr NUMERIC NOT NULL,
    price_usd NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
    current_credits INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, past_due
    period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
    credits_expiry TIMESTAMP WITH TIME ZONE, -- Added from Splice True
    paused_at TIMESTAMP WITH TIME ZONE, -- Added from Splice True
    UNIQUE(user_id)
);

-- Unlocked Samples (Splice-style library)
CREATE TABLE unlocked_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sample_id UUID REFERENCES samples(id) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, sample_id)
);

-- Referral Tracking
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES auth.users(id) NOT NULL,
    referred_email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, successful
    reward_credits INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FUNCTIONS & TRIGGERS

-- Function to check if a user can spend credits
CREATE OR REPLACE FUNCTION can_spend_credits(user_id_input UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sub_status TEXT;
    sub_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT status, credits_expiry INTO sub_status, sub_expiry 
    FROM user_subscriptions 
    WHERE user_id = user_id_input;

    IF sub_status = 'active' THEN
        RETURN TRUE;
    END IF;

    IF sub_status = 'cancelled' AND sub_expiry > NOW() THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle subscription expiration logic
CREATE OR REPLACE FUNCTION handle_subscription_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status = 'active' THEN
        NEW.credits_expiry := NOW() + INTERVAL '28 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_sub_cancel
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION handle_subscription_update();

-- Function to handle referral rewards
CREATE OR REPLACE FUNCTION reward_referral(referred_user_id UUID, ref_email TEXT)
RETURNS VOID AS $$
DECLARE
    referrer_uuid UUID;
    reward_amt INTEGER;
BEGIN
    SELECT referrer_id, reward_credits INTO referrer_uuid, reward_amt 
    FROM referrals WHERE referred_email = ref_email AND status = 'pending';

    IF referrer_uuid IS NOT NULL THEN
        UPDATE user_subscriptions 
        SET current_credits = current_credits + reward_amt 
        WHERE user_id = referrer_uuid;
        
        UPDATE referrals SET status = 'successful' WHERE referred_email = ref_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. SECURITY (Row Level Security)

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

ALTER TABLE sample_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sample packs are viewable by everyone" ON sample_packs FOR SELECT USING (true);

ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Samples are viewable by everyone" ON samples FOR SELECT USING (true);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own downloads" ON downloads FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscription plans are viewable by everyone" ON subscription_plans FOR SELECT USING (true);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE unlocked_samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own unlocked samples" ON unlocked_samples FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id);

-- 7. INITIAL SEED DATA
INSERT INTO subscription_plans (name, credits_per_month, price_inr, price_usd) VALUES
('Starter', 100, 599, 7.99),
('Professional', 300, 1499, 14.99),
('Producer', 1000, 3999, 29.99)
ON CONFLICT DO NOTHING;
