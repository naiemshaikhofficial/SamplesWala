-- 🛰️ SECURE_DOWNLOAD_TERMINAL (V5_HARDENED)
-- Implementing Single-Use Token Architecture for Anti-Piracy

CREATE TABLE IF NOT EXISTS secure_download_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('sample', 'pack')),
    client_ip TEXT,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups during high-traffic signal bursts
CREATE INDEX IF NOT EXISTS idx_secure_tokens_user ON secure_download_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_secure_tokens_id ON secure_download_tokens(id) WHERE used_at IS NULL;

-- Enable RLS (Only server/admin can access this table)
ALTER TABLE secure_download_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only access to secure tokens" 
ON secure_download_tokens FOR ALL 
TO service_role 
USING (true);

-- 🧹 AUTO_CLEANUP_CRON (V5_SIGNAL_PURGE)
-- Ensuring the secure token registry remains lightweight.
-- This deletes tokens that are older than 24 hours OR already expired.

-- 1. Function to perform the purge
CREATE OR REPLACE FUNCTION purge_expired_secure_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM secure_download_tokens
    WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Schedule the cron job (Optional: requires pg_cron enabled in Supabase)
-- SELECT cron.schedule('token-purge-signal', '0 * * * *', 'SELECT purge_expired_secure_tokens()');
