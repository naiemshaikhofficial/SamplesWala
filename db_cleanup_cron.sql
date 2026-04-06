-- 🧬 SAMPLES_WALA :: COMMERCE CLEANUP CRON (V1.0)
-- Purging stale 'pending' orders to maintain ledger fidelity.

-- 1. 🛡️ ENABLE CRON EXTENSION
-- This requires high-level privileges (standard on Supabase).
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. ⚡ THE CLEANUP FUNCTION
-- Scans the 'credit_orders' node for failed/abandoned signals.
CREATE OR REPLACE FUNCTION cleanup_pending_orders()
RETURNS VOID AS $$
BEGIN
    -- Only purge if order is 'pending' AND older than 30 minutes.
    DELETE FROM credit_orders 
    WHERE status = 'pending' 
    AND created_at < (NOW() - INTERVAL '30 minutes');
    
    -- Optional: Log the cleanup pulse (uncomment if you want an audit trail)
    -- RAISE NOTICE 'Stale orders purged from ledger.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 🎰 SCHEDULE THE JOB (Cron Pulse)
-- This runs every 10 minutes to ensure your vault remains lean.
SELECT cron.schedule(
    'purge-stale-commerce-signals', 
    '*/10 * * * *', 
    'SELECT cleanup_pending_orders()'
);

-- 4. 🎹 MANUAL TRIGGER (For Testing)
-- SELECT cleanup_pending_orders();
