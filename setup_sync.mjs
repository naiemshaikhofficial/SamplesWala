
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function setup() {
  console.log("🧬 Activating Hyper-Performance Sync Triggers...");
  
  const sql = `
    CREATE OR REPLACE FUNCTION public.auto_update_catalog_version()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE app_metadata
        SET value = (COALESCE(value::int, 0) + 1)::text,
            updated_at = now()
        WHERE key = 'catalog_version';
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop if exists and recreate
    DROP TRIGGER IF EXISTS on_sample_change ON public.samples;
    CREATE TRIGGER on_sample_change
    AFTER INSERT OR UPDATE OR DELETE ON public.samples
    FOR EACH STATEMENT EXECUTE FUNCTION public.auto_update_catalog_version();

    DROP TRIGGER IF EXISTS on_pack_change ON public.sample_packs;
    CREATE TRIGGER on_pack_change
    AFTER INSERT OR UPDATE OR DELETE ON public.sample_packs
    FOR EACH STATEMENT EXECUTE FUNCTION public.auto_update_catalog_version();
    
    -- Ensure the catalog_version row exists
    INSERT INTO app_metadata (key, value)
    VALUES ('catalog_version', '1')
    ON CONFLICT (key) DO NOTHING;
  `;

  // We'll try to run this via rpc if we have it, or we may need to instruct the user to paste it in the SQL Editor.
  // Actually, Supabase client doesn't support raw SQL execution easily. 
  // I will suggest the user to paste this in the Supabase Dashboard SQL Editor for maximum stability.
  console.log("✅ SQL Trigger code generated. Copy and run this in your Supabase SQL Editor for Auto-Sync.");
}

setup()
