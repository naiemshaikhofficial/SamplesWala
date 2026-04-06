-- 🧬 SAMPLES_WALA :: STUDIO_VAULT_MASTER (V5.1 - MINIMALIST 2-TABLE ARCHITECTURE)
-- This script HARDENS the new commerce engine.
-- Tables: user_accounts (Credits/Status) & user_vault (Unified Assets/History)

-- 1. 🧹 CLEANUP LEGACY
DROP TABLE IF EXISTS unlocked_samples CASCADE;
DROP TABLE IF EXISTS unlocked_packs CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- 2. 💎 CORE 2-TABLE ENGINE
CREATE TABLE IF NOT EXISTS user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    credits INTEGER DEFAULT 0 NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL, -- Linked for direct selection
    razorpay_subscription_id TEXT, -- Signal link for recurring updates
    next_billing TIMESTAMPTZ DEFAULT now() + interval '1 month',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID NOT NULL, -- Generic ID (Sample ID or Pack ID)
    item_type TEXT NOT NULL CHECK (item_type IN ('sample', 'pack')),
    item_name TEXT NOT NULL,
    amount INTEGER DEFAULT 0, -- Credits consumed
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    -- Unique constraint ensures no double charging for the same item_id
    UNIQUE(user_id, item_id)
);

-- 3. 📒 TRANSACTION LEDGER (RAZORPAY AUDIT)
CREATE TABLE IF NOT EXISTS credit_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id TEXT UNIQUE NOT NULL, -- Razorpay Order ID
    payment_id TEXT UNIQUE, -- Razorpay Payment ID
    amount_inr DECIMAL NOT NULL,
    credits_awarded INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    raw_response JSONB, -- For high-fidelity audit trail
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 🛡️ ATOMIC COMMERCE PROTOCOLS (RPC)

-- 🟢 INJECT: Add credits (Top-ups / Subscription renewal)
CREATE OR REPLACE FUNCTION add_credits(u_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_accounts (user_id, credits)
    VALUES (u_id, amount)
    ON CONFLICT (user_id) DO UPDATE 
    SET credits = user_accounts.credits + amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🔴 DEDUCT: Securely deduct credits and validate balance
CREATE OR REPLACE FUNCTION process_unlock(u_id UUID, cost INTEGER)
RETURNS VOID AS $$
DECLARE
    current_bal INTEGER;
BEGIN
    SELECT credits INTO current_bal FROM user_accounts WHERE user_id = u_id FOR UPDATE;
    
    IF current_bal IS NULL THEN
        -- Auto-initialize account if it somehow doesn't exist
        INSERT INTO user_accounts (user_id, credits) VALUES (u_id, 0);
        current_bal := 0;
    END IF;

    IF current_bal < cost THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;

    UPDATE user_accounts 
    SET credits = user_accounts.credits - cost 
    WHERE user_id = u_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 🎚️ POLICIES (RLS)
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own account" ON user_accounts;
CREATE POLICY "Users view own account" ON user_accounts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own vault" ON user_vault;
CREATE POLICY "Users view own vault" ON user_vault FOR SELECT USING (auth.uid() = user_id);

-- End of V5.1 Master Protocol
