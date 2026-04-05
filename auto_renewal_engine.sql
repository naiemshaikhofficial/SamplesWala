-- 🎰 CREATE AUTOMATED RENEWAL ENGINE
-- This function checks for subscriptions that have passed their 'period_end'
-- and automatically grants fresh credits for the new month.

CREATE OR REPLACE FUNCTION process_automated_renewals()
RETURNS void AS $$
DECLARE
    sub RECORD;
    plan_credits INTEGER;
BEGIN
    -- 1. Find all active subscriptions that are past their period_end
    FOR sub IN 
        SELECT us.*, sp.credits_per_month 
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.status = 'active' 
        AND us.period_end <= NOW()
    LOOP
        -- 2. Grant fresh monthly credits
        -- Note: We overwrite current_credits to match fresh monthly allocation
        UPDATE user_subscriptions
        SET 
            current_credits = sub.credits_per_month,
            period_start = NOW(),
            period_end = NOW() + INTERVAL '30 days',
            updated_at = NOW()
        WHERE id = sub.id;

        -- 3. Log the renewal for analytics
        INSERT INTO purchases (user_id, amount, item_type, item_name, payment_id)
        VALUES (
            sub.user_id, 
            0, -- 0 amount as it's an auto-renewal (payment handled by Razorpay Sub)
            'subscription_renewal', 
            'Monthly Credit Drop',
            'AUTO_RENEW_' || sub.id || '_' || TO_CHAR(NOW(), 'YYYYMMDD')
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🛡️ COMMENT ON FUNCTION
COMMENT ON FUNCTION process_automated_renewals IS 'Automatically grants fresh monthly credits to active subscribers once their period ends.';
