-- 🧬 SAMPLES_WALA :: LOGIN & SOFTWARE ENGINE REPAIR
-- Resolves "software_orders" missing error and hardens Google Login.

-- 1. RE-ESTABLISH SOFTWARE INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.software_products (
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
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Visualizer Studio if missing
INSERT INTO public.software_products (name, slug, description, price_inr, price_usd, current_version)
VALUES ('Visualizer Studio', 'visualizer-studio', 'The ultimate cinematic music video production suite.', 4999.0, 49.99, '1.0.0')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.software_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    software_name TEXT REFERENCES public.software_products(name) ON UPDATE CASCADE ON DELETE RESTRICT, 
    license_key TEXT UNIQUE,
    status TEXT DEFAULT 'complete' CHECK (status IN ('pending', 'complete', 'expired')),
    amount_paid DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_email, software_name)
);

-- 2. HARDEN IDENTITY ENGINE (Profiles & Credits)
-- This ensures Google Meta Data (name/picture) is correctly captured.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into Profiles (Resilient to Google/GitHub/Email variations)
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), 
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Initialize User Account with 10 Bonus Credits
  INSERT INTO public.user_accounts (user_id, credits)
  VALUES (NEW.id, 10)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. HARDEN SOFTWARE SYNC (Prevents "Relation Not Exist" crashes)
CREATE OR REPLACE FUNCTION public.sync_software_order_email()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.software_orders 
    SET user_id = NEW.id 
    WHERE user_email = NEW.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RE-ACTIVATE TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_sync ON auth.users;
CREATE TRIGGER on_auth_user_created_sync
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.sync_software_order_email();
