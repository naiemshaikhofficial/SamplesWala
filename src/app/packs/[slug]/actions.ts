'use server'

import { createClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'

const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-secret-key'

export async function generatePreviewToken(sampleId: string) {
    const payload = {
        sampleId,
        purpose: 'preview', // Matches route.ts check
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour for better UX
    }
    return jwt.sign(payload, JWT_SECRET)
}

/**
 * 💳 Splice Flow: Unlock a sample using 1 credit
 */
export async function unlockSample(sampleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Authentication required')

    // 1. Fetch user credits in user_subscriptions - Pick the one with the most credits first
    const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('current_credits, id')
        .eq('user_id', user.id)
        .order('current_credits', { ascending: false })

    if (subError || !subscriptions || subscriptions.length === 0) {
        throw new Error('No active subscription found. Please subscribe to get credits.')
    }

    const primarySub = subscriptions[0]
    if (primarySub.current_credits < 1) {
        throw new Error('Insufficient credits. Please top up your plan.')
    }

    // 2. Start Unlock Transaction
    // A: Record the unlock
    const { error: unlockError } = await supabase
        .from('unlocked_samples')
        .insert({
            user_id: user.id,
            sample_id: sampleId
        })

    if (unlockError) {
        // If already unlocked, this might fail on UNIQUE constraint - we catch that
        if (unlockError.code === '23505') return { success: true, message: 'Already unlocked' }
        throw new Error('Failed to unlock sample')
    }

    // B: Deduct 1 Credit
    const { error: deductError } = await supabase
        .from('user_subscriptions')
        .update({ current_credits: primarySub.current_credits - 1 })
        .eq('id', primarySub.id)

    if (deductError) throw new Error('Failed to deduct credits')

    revalidatePath('/packs/[slug]', 'page')
    return { success: true }
}

/**
 * 📥 Splice Flow: Get HQ Download URL for unlocked samples
 */
export async function getDownloadUrl(sampleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Authentication required')

    // 1. Verify ownership
    const { data: unlock, error: verifyError } = await supabase
        .from('unlocked_samples')
        .select('id')
        .eq('user_id', user.id)
        .eq('sample_id', sampleId)
        .single()

    if (verifyError || !unlock) {
        throw new Error('You do not own this sample. Please unlock it first.')
    }

    // 2. Fetch High Quality URL
    const { data: sample, error: sampleError } = await supabase
        .from('samples')
        .select('audio_url, name')
        .eq('id', sampleId)
        .single()

    if (sampleError || !sample) throw new Error('Sample not found')

    // In a real prod environment, you would generate a signed Google Drive link or S3 link here.
    // For now, we return the proxy URL which is already secure via our API route
    return { 
        url: sample.audio_url,
        fileName: `${sample.name}.wav`
    }
}

/**
 * 🎰 Bulk Unlock: Purchase an entire sample pack
 */
export async function unlockFullPack(packId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Authentication required')

    // 1. Fetch Pack & Plan
    const { data: pack } = await supabase.from('sample_packs').select('*').eq('id', packId).single()
    if (!pack) throw new Error('Pack not found')

    const { data: subscriptions } = await supabase.from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('current_credits', { ascending: false })

    const cost = pack.bundle_credit_cost || 50
    if (!subscriptions || subscriptions.length === 0 || subscriptions[0].current_credits < cost) {
        throw new Error(`Insufficient credits. You need ${cost} credits for this pack.`)
    }

    const primarySub = subscriptions[0]

    // 2. Fetch all samples in this pack
    const { data: samples } = await supabase.from('samples').select('id').eq('pack_id', packId)
    if (!samples) return { success: true }

    // 3. Unlock all samples (Upsert to avoid duplicates)
    const unlocks = samples.map(s => ({ user_id: user.id, sample_id: s.id }))
    const { error: unlockError } = await supabase.from('unlocked_samples').upsert(unlocks, { onConflict: 'user_id,sample_id' })

    if (unlockError) throw new Error('Failed to unlock pack items')

    // 4. Deduct Bulk Credits
    await supabase.from('user_subscriptions')
        .update({ current_credits: primarySub.current_credits - cost })
        .eq('id', primarySub.id)

    revalidatePath(`/packs/${pack.slug}`)
    return { success: true }
}
