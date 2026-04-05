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

  // 1. Fetch unlock frequency (this happens automatically from the raw data)
  const { data: unlocks, error: unlockError } = await supabase
    .from('unlocked_samples')
    .select('sample_id')

  if (unlockError || !unlocks) {
    console.error("Popularity Engine Error:", unlockError)
    return []
  }

  // 2. Aggregate counts in memory (Fast for thousands of records)
  const counts: Record<string, number> = {}
  unlocks.forEach(u => {
    counts[u.sample_id] = (counts[u.sample_id] || 0) + 1
  })

  // 3. Sort and get top IDs
  const topIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  // 4. Fetch the full sample data with their packs
  if (topIds.length === 0) {
    // Fallback: If no sounds unlocked yet, return newest
    const { data: newest } = await supabase
      .from('samples')
      .select('*, sample_packs(name, cover_url, slug)')
      .order('created_at', { ascending: false })
      .limit(limit)
    return newest || []
  }

  const { data: samples, error: sampleError } = await supabase
    .from('samples')
    .select('*, sample_packs(name, cover_url, slug)')
    .in('id', topIds)

  if (sampleError) return []

  // Final Sort: Re-sort the fetched samples by their original popularity rank
  return samples.sort((a, b) => topIds.indexOf(a.id) - topIds.indexOf(b.id))
}
