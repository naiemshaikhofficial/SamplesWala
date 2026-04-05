-- Subscription Plans (Splice-style)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    credits_per_month INTEGER NOT NULL,
    price_inr NUMERIC NOT NULL,
    price_usd NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Active User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
    current_credits INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, past_due
    period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
    UNIQUE(user_id)
);

-- Unlocked Samples (Splice Library)
CREATE TABLE IF NOT EXISTS unlocked_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sample_id UUID REFERENCES samples(id) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, sample_id)
);

-- Update Samples to have credit cost
ALTER TABLE samples ADD COLUMN IF NOT EXISTS credit_cost INTEGER DEFAULT 1;

-- Security (RLS)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscription plans are viewable by everyone" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Users can only see their own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own unlocked samples" ON unlocked_samples FOR SELECT USING (auth.uid() = user_id);

-- Insert Demo Plans
INSERT INTO subscription_plans (name, credits_per_month, price_inr, price_usd) VALUES
('Starter', 100, 599, 7.99),
('Professional', 300, 1499, 14.99),
('Producer', 1000, 3999, 29.99)
ON CONFLICT DO NOTHING;
