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

export async function generateDownloadToken(sampleId: string) {
    const payload = {
        sampleId,
        purpose: 'download',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300 // 5 minutes (tight security)
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

    // 1. Fetch Sample Details to get its actual Credit Cost
    const { data: sample, error: sampleError } = await supabase
        .from('samples')
        .select('id, pack_id, credit_cost')
        .eq('id', sampleId)
        .single()

    if (sampleError || !sample) throw new Error('Target sample not found in database.')

    // 2. Fetch user credits in user_subscriptions - Pick the one with the most credits first
    const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('current_credits, id')
        .eq('user_id', user.id)
        .order('current_credits', { ascending: false })

    if (subError || !subscriptions || subscriptions.length === 0) {
        throw new Error('No active subscription found. Please subscribe to get credits.')
    }

    const primarySub = subscriptions[0]
    if (primarySub.current_credits < (sample.credit_cost || 1)) {
        throw new Error(`Insufficient credits. You need ${sample.credit_cost} credits to unlock this sound.`)
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
        console.error("[UNLOCK ERROR]", unlockError)
        throw new Error(`Failed to unlock sample: ${unlockError.message}`)
    }

    // B: Deduct the actual credit cost using our secure server-side function
    const { data: rpcRes, error: deductError } = await supabase.rpc('deduct_credits_pro', {
        user_id_input: user.id,
        amount_to_deduct: sample.credit_cost || 1
    })

    if (deductError) {
        console.error("[CRITICAL] DEDUCTION FAILED:", deductError.message);
        console.error("💡 TIP: Make sure you ran the SQL from fix_credit_system.sql in your Supabase Editor!");
        throw new Error('Failed to deduct credits: ' + deductError.message)
    }

    console.log("✅ Credits Deducted Successfully for User:", user.email);
    revalidatePath('/', 'layout')
    return { success: true }
}

/**
 * 📥 Splice Flow: Get HQ Download URL for unlocked samples
 */
export async function getDownloadUrl(sampleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Authentication required')

    // 1. Fetch Sample Details to verify parent pack
    const { data: sample, error: sampleError } = await supabase
        .from('samples')
        .select('name, pack_id')
        .eq('id', sampleId)
        .single()

    if (sampleError || !sample) throw new Error('Sample not found')

    // 2. Check Ownership (Smart Check)
    // A: Check if they own the PARENT PACK (Efficient)
    const { data: packUnlock } = await supabase.from('unlocked_packs')
        .select('id')
        .eq('user_id', user.id)
        .eq('pack_id', sample.pack_id)
        .maybeSingle()

    // B: Check if they unlocked this specific sample individually
    const { data: individualUnlock } = !packUnlock ? await supabase.from('unlocked_samples')
        .select('id')
        .eq('user_id', user.id)
        .eq('sample_id', sampleId)
        .maybeSingle() : { data: null }

    if (!packUnlock && !individualUnlock) {
        throw new Error('You do not own this sample. Please unlock it first.')
    }

    // 3. Generate a secure, temporary download token
    const token = await generateDownloadToken(sampleId)

    // Return the proxy URL which handles everything internally
    return { 
        url: `/api/audio?id=${sampleId}&token=${token}`,
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

    // 2. Fetch all samples actually listed in this pack for auditioning
    const { data: samples } = await supabase.from('samples').select('id').eq('pack_id', packId)
    const unlocks = (samples && samples.length > 0) ? samples.map(s => ({ user_id: user.id, sample_id: s.id })) : []

    // 3. SECURE TRANSACTION: Deduct Credits FIRST via RPC
    const { error: deductError } = await supabase.rpc('deduct_credits_pro', {
        user_id_input: user.id,
        amount_to_deduct: cost
    })

    if (deductError) {
        throw new Error('Transaction Failed: ' + deductError.message)
    }

    // 4. Record the full pack purchase (THE SMART SOURCE OF TRUTH)
    const { error: unlockPackError } = await supabase.from('unlocked_packs').upsert({
        user_id: user.id,
        pack_id: packId
    }, { onConflict: 'user_id,pack_id' })

    if (unlockPackError) {
        throw new Error("Ownership Registration Failed: " + unlockPackError.message)
    }

    // 5. Record History in Purchases
    await supabase.from('purchases').insert({
        user_id: user.id,
        amount: 0, 
        item_type: 'sample_pack',
        item_name: `Full Pack: ${pack.name}`,
        payment_id: `CREDIT_UNLOCK_${Date.now()}`
    })

    // (Note: No longer need to loop or upsert all individual samples into unlocked_samples - Smart Check handles it)
    
    revalidatePath(`/packs/${pack.slug}`)
    return { success: true }
}
