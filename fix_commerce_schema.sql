-- 🧬 SAMPLES_WALA :: COMMERCE_SCHEMA_RESTORATION
-- Standardizing the commerce ledger to ensure high-fidelity payment fulfillment.

-- 1. HARDENING USER_ACCOUNTS (The Subscription Node)
ALTER TABLE IF EXISTS public.user_accounts
ADD COLUMN IF NOT EXISTS is_trial_used BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'INACTIVE',
ADD COLUMN IF NOT EXISTS next_billing TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.subscription_plans(id);

-- 2. HARDENING CREDIT_ORDERS (The Transaction Ledger)
ALTER TABLE IF EXISTS public.credit_orders
ADD COLUMN IF NOT EXISTS raw_response JSONB,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- 3. BOOTSTRAP: Ensure RLS is configured but bypassable by Service Role
-- (No changes needed if you use getAdminClient() in actions.ts)

-- 4. RE-ESTABLISH PROFILES (Identity Node)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- End of Restoration Protocol
