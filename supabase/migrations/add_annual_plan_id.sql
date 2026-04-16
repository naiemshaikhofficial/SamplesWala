-- 🧬 DATABASE_EVOLUTION: ADD ANNUAL RAZORPAY SIGNAL SUPPORT
-- Run this in your Supabase SQL Editor to enable annual billing.

ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS razorpay_plan_id_annual TEXT,
ADD COLUMN IF NOT EXISTS credits_annual INTEGER;

-- Update existing plans with annual IDs if you have them, 
-- or leave them null to use the manual price calculation fallback.
COMMENT ON COLUMN subscription_plans.razorpay_plan_id_annual IS 'The Razorpay Plan ID for the yearly interval.';
COMMENT ON COLUMN subscription_plans.credits_annual IS 'Specific credits awarded for annual plans (overrides 12x monthly logic).';
