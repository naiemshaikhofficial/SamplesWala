-- SAMPLES WALA :: PERFORMANCE_OPTIMIZATION
-- Moving popularity aggregation logic from Vercel CPU to Supabase Database Engine.

CREATE OR REPLACE VIEW popular_samples_view AS
SELECT item_id as sample_id, COUNT(*) as unlock_count
FROM user_vault
WHERE item_type = 'sample'
GROUP BY item_id
ORDER BY unlock_count DESC;

-- Now the application can just do:
-- supabase.from('popular_samples_view').select('sample_id').limit(10)
