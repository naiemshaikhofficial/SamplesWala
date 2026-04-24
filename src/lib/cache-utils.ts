'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * ⚡ CACHE_INVALIDATION_ENGINE :: SAMPLES_WALA
 * Provides a secure way to clear the aggressive Vercel caches.
 */
export async function clearGlobalCache() {
    // Clear all browse related data
    revalidateTag('browse')
    revalidateTag('global-categories-cache')
    revalidateTag('public-browse-data')
    
    // Clear the main pages
    revalidatePath('/')
    revalidatePath('/browse')
    revalidatePath('/packs', 'layout')
    
    console.log('[CACHE_INVALIDATION] Global cache purge successful.')
    return { success: true }
}

export async function clearPackCache(slug: string) {
    revalidatePath(`/packs/${slug}`)
    revalidateTag('browse') // To update pack listing stats if changed
    console.log(`[CACHE_INVALIDATION] Cache cleared for pack: ${slug}`)
    return { success: true }
}
