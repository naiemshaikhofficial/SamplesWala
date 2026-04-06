-- 🧬 STUDIO MASTER RESTORE SCRIPT (SAMPLES WALA)
-- Consolidated & Hardened: Commerce, Credits, Subscriptions, and Metadata.
-- WARNING: This script drops existing objects to ensure a clean technical state.

-- 1. 🧹 CLEANUP: Terminate Legacy Signatures (PRESERVING SAMPLES & PACKS DATA)
DROP TABLE IF EXISTS coupon_redemptions CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS credit_orders CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS unlocked_samples CASCADE;
DROP TABLE IF EXISTS unlocked_packs CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS downloads CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
-- NOTE: samples, sample_packs, and categories ARE NOT DROPPED TO PRESERVE EXISTING DATA.

DROP TYPE IF EXISTS sample_type CASCADE;

-- 2. 🧬 EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DO $$ BEGIN
    CREATE TYPE sample_type AS ENUM ('one-shot', 'loop', 'preset', 'patch');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. 📂 METADATA ARCHITECTURE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Preserve Existing Sample Packs & Sync Columns
CREATE TABLE IF NOT EXISTS sample_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_inr DECIMAL(10, 2) NOT NULL,
    price_usd DECIMAL(10, 2) NOT NULL,
    cover_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sample_packs ADD COLUMN IF NOT EXISTS bundle_credit_cost INTEGER DEFAULT 50;
ALTER TABLE sample_packs ADD COLUMN IF NOT EXISTS is_bundle_only BOOLEAN DEFAULT false;
ALTER TABLE sample_packs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE sample_packs ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Preserve Existing Samples & Sync Columns
CREATE TABLE IF NOT EXISTS samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID REFERENCES sample_packs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    download_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE samples ADD COLUMN IF NOT EXISTS bpm INTEGER;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS "key" TEXT;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS "type" sample_type DEFAULT 'one-shot';
ALTER TABLE samples ADD COLUMN IF NOT EXISTS credit_cost INTEGER DEFAULT 1;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS is_preview_only BOOLEAN DEFAULT false;

-- 4. 💳 COMMERCE & SUBSCRIPTION LEDGER
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    credits_per_month INTEGER NOT NULL,
    price_inr NUMERIC NOT NULL,
    price_usd NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consolidated Table: Subscription + Billing + Credits
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id), -- Nullable for top-up only users
    current_credits INTEGER DEFAULT 0 NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
    
    -- 🏛️ Billing Compliance (GST/KYC Norms)
    full_name TEXT,
    address_line1 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    pan_number TEXT,
    gstin TEXT,
    
    UNIQUE(user_id)
);

CREATE TABLE credit_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_inr INTEGER NOT NULL,
    credits_awarded INTEGER NOT NULL,
    payment_id TEXT,
    order_id TEXT UNIQUE NOT NULL, -- Razorpay Signature
    status TEXT DEFAULT 'pending', -- pending, paid, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 🧧 PROMOTIONS & ACQUISITION
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    credit_value INTEGER NOT NULL,
    max_uses_global INTEGER DEFAULT 1000,
    times_used_global INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, coupon_id)
);

CREATE TABLE unlocked_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sample_id UUID REFERENCES samples(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sample_id)
);

CREATE TABLE unlocked_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pack_id UUID REFERENCES sample_packs(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pack_id)
);

-- 6. 🧪 SECURE PROTOCOLS (RPC)

-- A: Atomic Credit Injection
CREATE OR REPLACE FUNCTION add_credits_pro(user_id_input UUID, amount_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_subscriptions (user_id, current_credits, status)
    VALUES (user_id_input, amount_to_add, 'active')
    ON CONFLICT (user_id) DO UPDATE 
    SET current_credits = user_subscriptions.current_credits + amount_to_add;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B: Secure Coupon Redemption
CREATE OR REPLACE FUNCTION redeem_coupon(u_id UUID, c_code TEXT)
RETURNS INTEGER AS $$
DECLARE
    target_coupon_id UUID;
    bonus_amount INTEGER;
BEGIN
    SELECT id, credit_value INTO target_coupon_id, bonus_amount
    FROM coupons
    WHERE code = UPPER(c_code) AND active = true 
    AND times_used_global < max_uses_global AND expires_at > NOW();

    IF target_coupon_id IS NULL THEN RAISE EXCEPTION 'INVALID_CODE'; END IF;
    
    IF EXISTS (SELECT 1 FROM coupon_redemptions WHERE user_id = u_id AND coupon_id = target_coupon_id) THEN
        RAISE EXCEPTION 'ALREADY_REDEEMED';
    END IF;

    INSERT INTO coupon_redemptions (user_id, coupon_id) VALUES (u_id, target_coupon_id);
    PERFORM add_credits_pro(u_id, bonus_amount);
    UPDATE coupons SET times_used_global = times_used_global + 1 WHERE id = target_coupon_id;

    RETURN bonus_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 🛡️ SECURITY (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE unlocked_samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own library" ON unlocked_samples FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE credit_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON credit_orders FOR SELECT USING (auth.uid() = user_id);

-- 8. 🌱 SEED DATA
INSERT INTO subscription_plans (name, credits_per_month, price_inr, price_usd) VALUES
('Starter', 100, 599, 7.99),
('Professional', 300, 1499, 14.99),
('Producer', 1000, 3999, 29.99);

INSERT INTO coupons (code, credit_value, max_uses_global) VALUES 
('STUDIO50', 50, 5000), 
('FIRST100', 100, 1000);
