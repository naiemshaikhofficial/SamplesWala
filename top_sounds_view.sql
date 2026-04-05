-- VIEW FOR TOP SOUNDS SEARCH
-- Aggregates unlock counts to determine popularity

CREATE OR REPLACE VIEW top_sounds AS
SELECT 
    s.*,
    sp.name as pack_name,
    sp.cover_url as pack_cover_url,
    sp.slug as pack_slug,
    count(us.id) as unlock_count
FROM samples s
JOIN sample_packs sp ON s.pack_id = sp.id
LEFT JOIN unlocked_samples us ON s.id = us.sample_id
GROUP BY s.id, sp.id
ORDER BY unlock_count DESC;

-- SECURITY
-- Ensure the view is readable by the public (since samples are public)
ALTER VIEW top_sounds OWNER TO postgres;
GRANT SELECT ON top_sounds TO anon, authenticated;
