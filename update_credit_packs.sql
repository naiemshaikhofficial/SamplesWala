-- Update credit packs to follow 1 Credit = ₹1 and 1 Credit = $0.03
-- With barriers: Min 50 (Domestic), Min 100 (International)

-- Clear existing packs
TRUNCATE TABLE public.credit_packs;

-- Insert new standard packs
INSERT INTO public.credit_packs (name, credits, price_inr, price_usd, is_featured) VALUES
('Starter Pack', 50, 50, 1.50, false),    -- Domestic Min Barrier (₹50)
('Value Pack', 100, 100, 3.00, true),     -- International Min Barrier ($3.00)
('Pro Pack', 250, 250, 7.50, false),
('Studio Pack', 500, 500, 15.00, false),
('Enterprise Pack', 1000, 1000, 30.00, false);
