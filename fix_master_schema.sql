-- 🧬 SAMPLES_WALA :: MASTER SCHEMA FIX (V5.1.3)
-- Hardening the 2-Table Architecture for Commerce & Billing

-- 1. UPGRADE USER_ACCOUNTS: Adding Billing Artifacts
-- These are required for GST-compliant invoices and Razorpay mandate verification.
-- REPLACED pan_number with phone_number as per request.
ALTER TABLE user_accounts 
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS phone_number TEXT,
    ADD COLUMN IF NOT EXISTS address_line1 TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS postal_code TEXT,
    ADD COLUMN IF NOT EXISTS gstin TEXT;

-- 2. UPGRADE SUBSCRIPTION_PLANS: Linking Razorpay Signal Nodes
ALTER TABLE subscription_plans 
    ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT;

-- 3. 🧹 DEPRECATION: Cleanup user_subscriptions
DROP TABLE IF EXISTS user_subscriptions CASCADE;
