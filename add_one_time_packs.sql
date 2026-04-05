-- 🎰 CREATE ONE-TIME CREDIT PACKS TABLE
CREATE TABLE IF NOT EXISTS credit_packs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    credits integer NOT NULL,
    price_inr integer NOT NULL,
    price_usd numeric NOT NULL,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 🌬️ ENABLE RLS
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;

-- 🛡️ CREATE PUBLIC READ POLICY
CREATE POLICY "Allow public read for credit packs" ON credit_packs
FOR SELECT USING (true);

-- 💎 SEED INITIAL PACKS
INSERT INTO credit_packs (name, credits, price_inr, price_usd, is_featured) VALUES
('Mini Pack', 50, 499, 6.99, false),
('Mega Bundle', 250, 1999, 24.99, true),
('Ultimate Stash', 1000, 5999, 69.99, false)
ON CONFLICT DO NOTHING;
