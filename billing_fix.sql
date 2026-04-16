-- 🧬 SAMPLES_WALA :: BILLING_REMEDY_V2
-- Fixes the issue where users cannot save their billing address or profile details.
-- Also ensures subscription status can be updated.

-- 1. ADD MISSING COLUMNS TO USER_ACCOUNTS
ALTER TABLE user_accounts 
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS phone_number TEXT,
    ADD COLUMN IF NOT EXISTS address_line1 TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS postal_code TEXT,
    ADD COLUMN IF NOT EXISTS gstin TEXT,
    ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'INACTIVE',
    ADD COLUMN IF NOT EXISTS next_billing TIMESTAMPTZ;

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES: AUTHENTICATED ACCESS
-- Allow users to see their own account data
DROP POLICY IF EXISTS "Users view own account" ON user_accounts;
CREATE POLICY "Users view own account" ON user_accounts 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow users to update their own account data (billing info, etc.)
DROP POLICY IF EXISTS "Users update own account" ON user_accounts;
CREATE POLICY "Users update own account" ON user_accounts 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. BOOTSTRAP: Ensure all existing users have an account record
INSERT INTO user_accounts (user_id, credits)
SELECT id, 10 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 5. INDEXING
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON user_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_sub_id ON user_accounts(razorpay_subscription_id);
