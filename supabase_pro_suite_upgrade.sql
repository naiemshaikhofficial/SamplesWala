-- 0. Initialize sample_type ENUM if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sample_type') THEN
        CREATE TYPE sample_type AS ENUM ('one-shot', 'loop');
    END IF;
END $$;

-- 0.1 Migrate samples table to use the new ENUM type (dropping the old check constraint)
ALTER TABLE samples DROP CONSTRAINT IF EXISTS samples_type_check;
ALTER TABLE samples ALTER COLUMN type TYPE sample_type USING type::sample_type;

-- Support for Presets/Patches
ALTER TYPE sample_type ADD VALUE IF NOT EXISTS 'preset';
ALTER TYPE sample_type ADD VALUE IF NOT EXISTS 'patch';

-- Bulk Pricing for Packs (in Credits)
ALTER TABLE sample_packs ADD COLUMN IF NOT EXISTS bundle_credit_cost INTEGER DEFAULT 50;

-- Referral Tracking
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES auth.users(id) NOT NULL,
    referred_email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, successful
    reward_credits INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to handle successful referral
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

-- Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id);

