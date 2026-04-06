'use server'

import { createClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'

const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-secret-key'

export async function generatePreviewToken(sampleId: string) {
    const payload = {
        sampleId,
        purpose: 'preview',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60
    }
    return jwt.sign(payload, JWT_SECRET)
}

export async function generateDownloadToken(sampleId: string) {
    const payload = {
        sampleId,
        purpose: 'download',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300
    }
    return jwt.sign(payload, JWT_SECRET)
}

/** 💳 THE NEW MINIMALIST UNLOCK SYSTEM (2-Table Strategy) **/
export async function unlockSample(sampleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    // 1. Get Sample Details (to know the cost)
    const { data: sample } = await supabase.from('samples').select('name, credit_cost, pack_id').eq('id', sampleId).single()
    const cost = sample?.credit_cost || 1

    // 2. CHECK & DEDUCT (Single RPC Call to process_unlock)
    const { error: deductError } = await supabase.rpc('process_unlock', {
        u_id: user.id,
        cost: cost
    })

    if (deductError) throw new Error('Insufficient credits or account missing.')

    // 3. SECURE IN VAULT (Unified ownership & history log)
    const { error: vaultError } = await supabase
        .from('user_vault')
        .insert({
            user_id: user.id,
            item_id: sampleId,
            item_type: 'sample',
            item_name: sample?.name,
            amount: cost
        })

    if (vaultError) {
        // If already in vault, we catch unique constraint (23505) but still allow the flow
        if (vaultError.code !== '23505') {
            console.error("[VAULT_LOG_FAILED]", vaultError.message)
            throw new Error('Ownership Registration Failed: ' + vaultError.message)
        }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

/** 📥 DOWNLOAD FLOW (Checking the Vault) **/
export async function getDownloadUrl(sampleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    // 1. Get sample info to find its parent pack
    const { data: sample } = await supabase.from('samples').select('name, pack_id').eq('id', sampleId).single()
    if (!sample) throw new Error('Sound artifact not found in master registry.')

    // 2. VAULT CHECK: Does user own the Sample OR the whole Pack in user_vault?
    const { data: vaultItems } = await supabase.from('user_vault')
        .select('item_id, item_type')
        .eq('user_id', user.id)

    const isOwned = vaultItems?.some(v => 
        (v.item_type === 'sample' && v.item_id === sampleId) || 
        (v.item_type === 'pack' && v.item_id === sample.pack_id)
    )

    if (!isOwned) {
        throw new Error('Ownership verification failed in your node vault.')
    }

    // 3. Generate a secure, temporary download token
    const token = jwt.sign({ sampleId, purpose: 'download' }, JWT_SECRET, { expiresIn: '5m' })

    return { 
        url: `/api/audio?id=${sampleId}&token=${token}`,
        fileName: `${sample.name}.wav`
    }
}

/** 🎰 BULK UNLOCK (Purchasing full packs into user_vault) **/
export async function unlockFullPack(packId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    const { data: pack } = await supabase.from('sample_packs').select('*').eq('id', packId).single()
    if (!pack) throw new Error('Pack not found')

    const cost = pack.bundle_credit_cost || 50

    // 1. Deduct Credits
    const { error: deductError } = await supabase.rpc('process_unlock', {
        u_id: user.id,
        cost: cost
    })

    if (deductError) throw new Error('Transaction Failed: Insufficient credits.')

    // 2. Register Ownership in user_vault
    const { error: vaultError } = await supabase.from('user_vault').insert({
        user_id: user.id,
        item_id: packId,
        item_type: 'pack',
        item_name: `Full Pack: ${pack.name}`,
        amount: cost
    })

    if (vaultError) throw new Error("Ownership Registration Failed: " + vaultError.message)

    revalidatePath(`/packs/${pack.slug}`)
    return { success: true }
}
