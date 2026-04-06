-- 🧬 SAMPLES_WALA :: MASTER SCHEMA HARDENING (V5.1.5)
-- Finalized 2-Table Master Architecture for Global Commerce

-- 1. UPGRADE USER_ACCOUNTS: Secure Commerce Node
-- Consolidates all personal, billing, and membership metadata.
ALTER TABLE user_accounts 
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS phone_number TEXT,
    ADD COLUMN IF NOT EXISTS address_line1 TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS postal_code TEXT,
    ADD COLUMN IF NOT EXISTS gstin TEXT,
    ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- 2. UPGRADE SUBSCRIPTION_PLANS: Artifact & Trial Signalling
-- Enables advanced mandate logic and global Razorpay mapping.
ALTER TABLE subscription_plans 
    ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT,
    ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0;

-- 3. INDEXING FOR HIGH-FIDELITY SEARCH
-- Optimizing Razorpay signal lookups (Webhooks).
CREATE INDEX IF NOT EXISTS idx_accounts_sub_id ON user_accounts(razorpay_subscription_id);

-- 4. 🧹 DEPRECATION: Cleanup Legacy Tables
-- Ensuring no conflicts with the outdated 'user_subscriptions' schema.
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- 5. 🎰 SEEDING PRODUCTION PLAN (EXAMPLE)
-- UPDATE subscription_plans SET razorpay_plan_id = 'plan_PRO_01', trial_days = 0 WHERE name = 'Professional';
