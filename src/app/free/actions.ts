import { unstable_cache } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'
import { generateAudioSignal, getDriveFileId } from '@/lib/audio/signal'

/**
 * 🧬 FREE_SAMPLES_CACHE_ENGINE
 * Caches the free samples list for 24 hours.
 * Includes pre-generated audio signals for ultra-fast serving.
 */
export const getCachedFreeSamples = unstable_cache(
    async (from: number, to: number) => {
        const adminClient = getAdminClient()
        
        const { data: rawSamples, count, error } = await adminClient
            .from('samples')
            .select('*, sample_packs(name, cover_url)', { count: 'exact' })
            .eq('credit_cost', 0)
            .order('created_at', { ascending: false })
            .range(from, to)

        if (error || !rawSamples) {
            console.error('[FREE_SAMPLES_CACHE_ERROR]', error)
            return { samples: [], count: 0 }
        }

        // 🧬 Pre-calculate signals on the server to avoid per-request processing
        const samplesWithSignals = rawSamples.map((s: any) => ({
            ...s,
            signal: generateAudioSignal(getDriveFileId(s.audio_url), s.name)
        }))

        return { 
            samples: samplesWithSignals, 
            count: count || 0 
        }
    },
    ['free-samples-list-v1'],
    { 
        revalidate: 86400, // 24 Hours
        tags: ['samples', 'free-samples'] 
    }
)
