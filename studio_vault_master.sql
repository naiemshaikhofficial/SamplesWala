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
CREATE OR REPLACE FUNCTION process_unlock(cost INTEGER)
RETURNS VOID AS $$
DECLARE
    u_id UUID := auth.uid();
    current_bal INTEGER;
BEGIN
    IF u_id IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'; END IF;

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

-- ⚡ ATOMIC_UNLOCK_PROTO V3: Securely Hardened (caller cannot spoof u_id)
CREATE OR REPLACE FUNCTION atomic_unlock_asset(
    a_id UUID
)
RETURNS VOID AS $$
DECLARE
    u_id UUID := auth.uid();
    current_bal INTEGER;
    a_cost INTEGER;
    a_name TEXT;
    a_type TEXT;
BEGIN
    IF u_id IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'; END IF;

    -- 1. Get info internally (Eliminates client-side cost manipulation)
    SELECT name, credit_cost, 'sample' INTO a_name, a_cost, a_type FROM samples WHERE id = a_id;
    
    -- If not sample, check if it's a pack
    IF a_name IS NULL THEN
        SELECT name, bundle_credit_cost, 'pack' INTO a_name, a_cost, a_type FROM sample_packs WHERE id = a_id;
        IF a_name IS NOT NULL THEN
            a_name := 'Full Pack: ' || a_name;
        END IF;
    END IF;

    IF a_name IS NULL THEN
        RAISE EXCEPTION 'ASSET_NOT_FOUND';
    END IF;

    -- 2. Lock account for update
    SELECT credits INTO current_bal FROM user_accounts WHERE user_id = u_id FOR UPDATE;
    
    IF current_bal IS NULL THEN
        -- Initialize account if missing
        INSERT INTO user_accounts (user_id, credits) VALUES (u_id, 0);
        current_bal := 0;
    END IF;

    IF current_bal < COALESCE(a_cost, 1) THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;

    -- 3. Deduct Credits
    UPDATE user_accounts 
    SET credits = user_accounts.credits - COALESCE(a_cost, 1) 
    WHERE user_id = u_id;

    -- 4. Insert into Vault (Atomic Check)
    IF NOT EXISTS (SELECT 1 FROM user_vault WHERE user_id = u_id AND item_id = a_id) THEN
        INSERT INTO user_vault (user_id, item_id, item_type, item_name, amount)
        VALUES (u_id, a_id, a_type, a_name, COALESCE(a_cost, 1));
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 🛡️ REVOKE PUBLIC ACCESS
-- These functions should NOT be called directly via Anon key from a browser.
-- (Optional: only if you want to block browser direct RPC. Server actions still work.)
REVOKE EXECUTE ON FUNCTION add_credits(UUID, INTEGER) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION add_credits(UUID, INTEGER) TO service_role;

-- 4. 🎚️ POLICIES (RLS)
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own account" ON user_accounts;
CREATE POLICY "Users view own account" ON user_accounts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own vault" ON user_vault;
CREATE POLICY "Users view own vault" ON user_vault FOR SELECT USING (auth.uid() = user_id);

-- End of V5.1 Master Protocol
