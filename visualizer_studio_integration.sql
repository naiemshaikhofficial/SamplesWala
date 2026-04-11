-- 🧬 SAMPLES_WALA :: VISUALIZER_STUDIO_INTEGRATION (V2 - CONSOLIDATED)
-- Single table architecture for Products & Versioning.

-- 1. 📦 SOFTWARE PRODUCTS (Unified Metadata)
CREATE TABLE IF NOT EXISTS software_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_inr DECIMAL(10, 2) NOT NULL DEFAULT 4999.00,
    price_usd DECIMAL(10, 2) NOT NULL DEFAULT 49.99,
    current_version TEXT NOT NULL DEFAULT '1.0.0',
    download_url_win TEXT,
    download_url_mac TEXT,
    cover_url TEXT,
    is_active BOOLEAN DEFAULT true,
    release_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 🔥 MIGRATION: Ensure Win/Mac columns exist if table was created previously
ALTER TABLE software_products ADD COLUMN IF NOT EXISTS download_url_win TEXT;
ALTER TABLE software_products ADD COLUMN IF NOT EXISTS download_url_mac TEXT;
ALTER TABLE software_products DROP COLUMN IF EXISTS download_url;

-- 2. 🔐 SOFTWARE ORDERS (The Licenses)
CREATE TABLE IF NOT EXISTS software_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    -- 🧬 LINKED: Reference the software products table directly
    software_name TEXT REFERENCES software_products(name) ON UPDATE CASCADE ON DELETE RESTRICT, 
    license_key TEXT UNIQUE,
    status TEXT DEFAULT 'complete' CHECK (status IN ('pending', 'complete', 'expired')),
    amount_paid DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_email, software_name)
);

-- 🔥 MIGRATION: Force Foregin Key if table exists
ALTER TABLE software_orders 
    DROP CONSTRAINT IF EXISTS software_orders_software_name_fkey,
    ADD CONSTRAINT software_orders_software_name_fkey 
    FOREIGN KEY (software_name) REFERENCES software_products(name) 
    ON UPDATE CASCADE;

-- 3. 🎁 SEED DATA: INITIALIZE VISUALIZER STUDIO
INSERT INTO software_products (name, slug, description, price_inr, price_usd, current_version, download_url_win, download_url_mac)
VALUES (
    'Visualizer Studio', 
    'visualizer-studio', 
    'The ultimate cinematic music video production suite for creators.', 
    4999.0, 
    49.99, 
    '1.0.0', 
    'https://drive.google.com/file/d/windows_exe_id', 
    'https://drive.google.com/file/d/mac_dmg_id'
) ON CONFLICT (name) DO UPDATE SET 
    current_version = EXCLUDED.current_version,
    download_url_win = EXCLUDED.download_url_win,
    download_url_mac = EXCLUDED.download_url_mac;

-- 4. 🛡️ RLS POLICIES
ALTER TABLE software_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view software products" ON software_products;
CREATE POLICY "Everyone can view software products" ON software_products FOR SELECT USING (true);

ALTER TABLE software_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own software licenses" ON software_orders;
CREATE POLICY "Users can only see their own software licenses" ON software_orders FOR SELECT USING (auth.uid() = user_id);

-- 5. 📊 MASTER ACCESS VIEW (For easy selects)
-- Isse aap direct select kar paoge: SELECT * FROM software_access_view;
CREATE OR REPLACE VIEW software_access_view AS
SELECT 
    so.id,
    so.user_email,
    so.software_name,
    so.license_key,
    so.status,
    so.amount_paid,
    so.created_at,
    u.id as user_id,
    u.last_sign_in_at
FROM software_orders so
LEFT JOIN auth.users u ON so.user_id = u.id OR so.user_email = u.email;

-- 🛡️ RLS for View
ALTER VIEW software_access_view OWNER TO postgres;

-- 🔄 AUTO-SYNC LOGIC (Optional but Pro)
-- Agar aap auth.users mein se manual email delete/update karte ho, toh ye trigger software_orders ko sync rakhega.
CREATE OR REPLACE FUNCTION sync_software_order_email()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE software_orders 
    SET user_id = NEW.id 
    WHERE user_email = NEW.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_sync ON auth.users;
CREATE TRIGGER on_auth_user_created_sync
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_software_order_email();
