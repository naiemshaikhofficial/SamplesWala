-- 🎰 ADD RAZORPAY TRACKING TO SUBSCRIPTIONS
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS razorpay_sub_id text;
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS razorpay_customer_id text;

-- 🛡️ CREATE INDEX FOR FAST LOOKUPS DURING WEBHOOKS
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_razorpay_sub_id ON user_subscriptions(razorpay_sub_id);
