import { unstable_cache } from 'next/cache'
import { getAdminClient } from './supabase/admin'
import { cache } from 'react'

/**
 * 🛠️ SOFTWARE_DATA_CACHE
 * Fetches and caches software product details to minimize Supabase Egress.
 * Deduplicates calls across generateMetadata and the Page.
 */
export const getCachedSoftware = cache(async (slug: string) => {
    return unstable_cache(
        async () => {
            const adminClient = getAdminClient()
            const { data, error } = await adminClient
                .from('software_products')
                .select('*')
                .eq('slug', slug)
                .single()
            return { data, error }
        },
        [`software-detail-${slug}`],
        { revalidate: 86400, tags: ['software'] }
    )()
})
