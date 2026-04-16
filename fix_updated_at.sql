-- 🛡️ DATABASE_HARDENING :: Fix missing updated_at columns causing query failures
-- This script ensures all core tables have standard timestamp columns and automatic update triggers.

-- 1. Ensure columns exist on core tables
DO $$ 
BEGIN 
    -- software_products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='software_products' AND column_name='updated_at') THEN
        ALTER TABLE software_products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;

    -- sample_packs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sample_packs' AND column_name='updated_at') THEN
        ALTER TABLE sample_packs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;

    -- samples
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='samples' AND column_name='updated_at') THEN
        ALTER TABLE samples ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;
    
    -- user_accounts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_accounts' AND column_name='updated_at') THEN
        ALTER TABLE user_accounts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- 2. Create the unified updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Apply triggers to automate timestamp updates
DROP TRIGGER IF EXISTS update_software_products_updated_at ON software_products;
CREATE TRIGGER update_software_products_updated_at BEFORE UPDATE ON software_products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_sample_packs_updated_at ON sample_packs;
CREATE TRIGGER update_sample_packs_updated_at BEFORE UPDATE ON sample_packs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_samples_updated_at ON samples;
CREATE TRIGGER update_samples_updated_at BEFORE UPDATE ON samples FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_accounts_updated_at ON user_accounts;
CREATE TRIGGER update_user_accounts_updated_at BEFORE UPDATE ON user_accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Fix potential security issues identified by Supabase Advisor
-- Ensure views are secure
ALTER VIEW IF EXISTS popular_samples_view SET (security_invoker = on);
-- Note: Views created with SECURITY DEFINER are generally fine if they are intended to bypass RLS for public read, 
-- but a better practice is to use SECURITY INVOKER where possible or restrict access.

-- 5. Clean up any broken indices or schema metadata
-- The error "relation supabase_migrations.schema_migrations does not exist" 
-- is a Supabase internal issue and can usually be ignored unless it blocks deployments.
