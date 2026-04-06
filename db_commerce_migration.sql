-- 🧬 STUDIO COMMERCE ENGINE: MASTER MIGRATION V2

-- 0. 🏛️ Schema Hardening: Billing Compliance Columns
ALTER TABLE IF EXISTS user_subscriptions 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- 1. 🎫 Coupons Ledger: Defining Promotional Signatures
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    credit_value INTEGER NOT NULL,
    max_uses_global INTEGER DEFAULT 1000,
    times_used_global INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 🔐 Redemption Tracker: Preventing Double-Usage
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    coupon_id UUID REFERENCES coupons(id) NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, coupon_id) -- Ensures a user only uses a specific code ONCE
);

-- 3. 💳 Orders Terminal: Official Transaction Ledger
CREATE TABLE IF NOT EXISTS credit_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount_inr INTEGER NOT NULL,
    credits_awarded INTEGER NOT NULL,
    payment_id TEXT,
    order_id TEXT UNIQUE NOT NULL, -- Razorpay Order ID
    status TEXT DEFAULT 'pending', -- pending, paid, failed, flagged
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 🎫 RPC: Secure Coupon Redemption Protocol
CREATE OR REPLACE FUNCTION redeem_coupon(u_id UUID, c_code TEXT)
RETURNS INTEGER AS $$
DECLARE
    target_coupon_id UUID;
    bonus_amount INTEGER;
BEGIN
    -- A: Identify and Validate Coupon
    SELECT id, credit_value INTO target_coupon_id, bonus_amount
    FROM coupons
    WHERE code = UPPER(c_code) 
    AND active = true 
    AND times_used_global < max_uses_global 
    AND expires_at > NOW();

    IF target_coupon_id IS NULL THEN
        RAISE EXCEPTION 'INVALID_OR_EXPIRED_CODE';
    END IF;

    -- B: check if user already redeemed this specific coupon
    IF EXISTS (SELECT 1 FROM coupon_redemptions WHERE user_id = u_id AND coupon_id = target_coupon_id) THEN
        RAISE EXCEPTION 'ALREADY_REDEEMED_BY_USER';
    END IF;

    -- C: Record Redemption to prevent double-dipping
    INSERT INTO coupon_redemptions (user_id, coupon_id) VALUES (u_id, target_coupon_id);

    -- D: Inject Credits to Vault
    PERFORM add_credits_pro(u_id, bonus_amount);

    -- E: Update global usage metrics
    UPDATE coupons 
    SET times_used_global = times_used_global + 1 
    WHERE id = target_coupon_id;

    RETURN bonus_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 💳 RPC: Secure Credit Injection Sequence
CREATE OR REPLACE FUNCTION add_credits_pro(user_id_input UUID, amount_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Ensure user has a subscription record
    IF EXISTS (SELECT 1 FROM user_subscriptions WHERE user_id = user_id_input) THEN
        UPDATE user_subscriptions 
        SET current_credits = current_credits + amount_to_add
        WHERE user_id = user_id_input;
    ELSE
        INSERT INTO user_subscriptions (user_id, current_credits, status)
        VALUES (user_id_input, amount_to_add, 'active');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 🧪 Initial Coupons: Studio Signatures
INSERT INTO coupons (code, credit_value, max_uses_global) 
VALUES 
('STUDIO50', 50, 5000), 
('FIRST100', 100, 1000),
('WELCOME10', 10, 10000)
ON CONFLICT (code) DO NOTHING;
