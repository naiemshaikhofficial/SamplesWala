import { unstable_cache } from 'next/cache'
import { getAdminClient } from './supabase/admin'
import { getTopPopularSounds } from './supabase/admin'

/**
 * 🏠 HOME_PAGE_DATA_CACHE
 * Fetches and caches all home page data to minimize Supabase Egress.
 * Revalidates every 24 hours, but can be cleared via admin actions.
 */
export const getHomePageData = unstable_cache(
  async () => {
    const adminClient = getAdminClient()
    
    const [latestPacksData, freshSoundsData, topSamplesData, softwareData] = await Promise.all([
        adminClient.from('sample_packs').select('id, name, slug, price_inr, cover_url, categories(name), samples(bpm, key)').order('created_at', { ascending: false }).limit(12),
        adminClient.from('samples').select('id, name, audio_url, bpm, key, credit_cost, sample_packs(name, slug, cover_url)').order('created_at', { ascending: false }).limit(20),
        getTopPopularSounds(20),
        adminClient.from('software_products').select('id, name, slug, description, price_inr, cover_url, current_version').eq('is_active', true).order('created_at', { ascending: false }).limit(2)
    ])

    return {
        latestPacks: latestPacksData.data || [],
        freshSounds: freshSoundsData.data || [],
        topSamples: topSamplesData || [],
        software: softwareData.data || []
    }
  },
  ['home-page-data'],
  { revalidate: 86400, tags: ['home', 'browse'] }
)
