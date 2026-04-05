-- Add Status & Expiry tracking to subscriptions
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS credits_expiry TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_subscriptions ALTER COLUMN status SET DEFAULT 'active';

-- Function to check if a user can spend credits
CREATE OR REPLACE FUNCTION can_spend_credits(user_id_input UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sub_status TEXT;
    sub_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT status, credits_expiry INTO sub_status, sub_expiry 
    FROM user_subscriptions 
    WHERE user_id = user_id_input;

    -- Level 1: Must be active
    IF sub_status = 'active' THEN
        RETURN TRUE;
    END IF;

    -- Level 2: If cancelled, within 28-day grace period
    IF sub_status = 'cancelled' AND sub_expiry > NOW() THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for auto-setting expiry on cancellation
CREATE OR REPLACE FUNCTION handle_subscription_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status = 'active' THEN
        NEW.credits_expiry := NOW() + INTERVAL '28 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_sub_cancel
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION handle_subscription_update();
