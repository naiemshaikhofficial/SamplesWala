ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS price_inr_annual NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS price_usd_annual NUMERIC(10, 2);

-- Set Annual Prices (Setting to 10x monthly, effectively giving 2 months free / ~16.6% discount)
UPDATE subscription_plans SET 
    price_inr_annual = price_inr * 10, 
    price_usd_annual = price_usd * 10;
