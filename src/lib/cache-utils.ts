'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * ⚡ CACHE_INVALIDATION_ENGINE :: SAMPLES_WALA
 * Provides a secure way to clear the aggressive Vercel caches.
 */
export async function clearGlobalCache() {
    // Clear all browse related data
    revalidateTag('browse', 'default')
    revalidateTag('global-categories-cache', 'default')
    revalidateTag('public-browse-data', 'default')
    revalidateTag('home', 'default')
    revalidateTag('software', 'default')
    
    // Clear the main pages
    revalidatePath('/')
    revalidatePath('/browse')
    revalidatePath('/packs', 'layout')
    
    console.log('[CACHE_INVALIDATION] Global cache purge successful.')
    return { success: true }
}

export async function clearPackCache(slug: string) {
    revalidatePath(`/packs/${slug}`)
    revalidateTag('browse', 'default') // To update pack listing stats if changed
    console.log(`[CACHE_INVALIDATION] Cache cleared for pack: ${slug}`)
    return { success: true }
}
