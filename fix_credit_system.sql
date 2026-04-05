-- 1. Create the Security-First Deduction Function 🕵️‍♂️🛡️
-- This allows deducting credits safely on the server side
CREATE OR REPLACE FUNCTION deduct_credits_pro(user_id_input UUID, amount_to_deduct INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Deduct from the most relevant subscription
    UPDATE user_subscriptions 
    SET current_credits = current_credits - amount_to_deduct
    WHERE user_id = user_id_input 
    AND status = 'active'
    AND current_credits >= amount_to_deduct;

    -- If no active sub found with enough balance, try any sub
    IF NOT FOUND THEN
        UPDATE user_subscriptions 
        SET current_credits = current_credits - amount_to_deduct
        WHERE user_id = user_id_input 
        AND current_credits >= amount_to_deduct;
    END IF;

    -- Ensure we actually deducted something
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient credits or subscription inactive.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER bypasses RLS safely

-- 2. Grant permission for authenticated users to call this function
GRANT EXECUTE ON FUNCTION deduct_credits_pro(UUID, INTEGER) TO authenticated;
