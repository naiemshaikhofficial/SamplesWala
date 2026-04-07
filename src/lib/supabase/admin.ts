import { createClient } from '@supabase/supabase-js'

export const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * 📡 AUTOMATIC POPULARITY ENGINE
 * Fetches the most purchased/unlocked samples across all users.
 * Bypasses RLS safely on the server side.
 */
export async function getTopPopularSounds(limit = 10) {
  const supabase = getAdminClient()

  // 1. Fetch unlock frequency from the unified vault
  const { data: unlocks, error: unlockError } = await supabase
    .from('user_vault')
    .select('item_id')
    .eq('item_type', 'sample')

  if (unlockError || !unlocks) {
    console.error("Popularity Engine Error:", unlockError)
    return []
  }

  // 2. Aggregate counts in memory (Fast for thousands of records)
  const counts: Record<string, number> = {}
  unlocks.forEach(u => {
    if (u.item_id) {
        counts[u.item_id] = (counts[u.item_id] || 0) + 1
    }
  })

  // 3. Sort and get top IDs
  const topIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  // 4. Fetch the full sample data with Multilevel Failure Protection
  if (topIds.length === 0) {
    // Fallback: If no sounds unlocked yet, return newest
    let { data: newest, error: newestError } = await supabase
      .from('samples')
      .select('*, sample_packs(name, cover_url, slug)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (newestError || !newest || newest.length === 0) {
        if (newestError) console.warn('[SIGNAL_REPAIR] Popular newest fetch failed join, using bypass:', newestError.message);
        const { data: rawNewest } = await supabase.from('samples').select('*').order('created_at', { ascending: false }).limit(limit)
        return rawNewest || []
    }
    return newest || []
  }

  let { data: samples, error: sampleError } = await supabase
    .from('samples')
    .select('*, sample_packs(name, cover_url, slug)')
    .in('id', topIds)

  if (sampleError || !samples || samples.length === 0) {
      if (sampleError) console.warn('[SIGNAL_REPAIR] Popular top IDs fetch failed join, using bypass:', sampleError.message);
      const { data: rawSamples } = await supabase.from('samples').select('*').in('id', topIds)
      return rawSamples || []
  }

  // Final Sort: Re-sort the fetched samples by their original popularity rank
  return samples.sort((a, b) => topIds.indexOf(a.id) - topIds.indexOf(b.id))
}
