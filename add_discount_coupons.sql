-- 🎫 DISCOUNT COUPONS: Payment Reduction Signatures

CREATE TABLE IF NOT EXISTS discount_coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER, -- e.g. 20 for 20% off
    discount_amount_inr INTEGER, -- e.g. 100 for ₹100 off
    discount_amount_usd DECIMAL(10,2), -- e.g. 1.50 for $1.50 off
    min_order_amount_inr INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Discount Coupons
INSERT INTO discount_coupons (code, discount_percent) VALUES ('SAMPLES20', 20) ON CONFLICT (code) DO NOTHING;
INSERT INTO discount_coupons (code, discount_amount_inr, discount_amount_usd) VALUES ('WELCOME50', 50, 0.75) ON CONFLICT (code) DO NOTHING;
