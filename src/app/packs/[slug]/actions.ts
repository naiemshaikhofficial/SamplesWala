'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
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
        exp: Math.floor(Date.now() / 1000) + 900 // 🛡️ 15 Minute Signal
    }
    return jwt.sign(payload, JWT_SECRET)
}

import { grantDrivePermission } from '@/lib/drive/automation'

/** 💳 THE NEW HYPER-SPEED UNLOCK SYSTEM (V13 Atomic Protocol) **/
export async function unlockSample(sampleId: string) {
    const supabase = await createClient()
    const adminClient = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    // 1. Get Sample Details (Still needed for the name/cost for the vault entry)
    const { data: sample } = await adminClient.from('samples').select('name, credit_cost').eq('id', sampleId).single()
    if (!sample) throw new Error('Sound not found')

    // 2. ATOMIC_TRANSACTION (Hardened V3 Protocol - Context enforced by DB)
    const { error } = await supabase.rpc('atomic_unlock_asset', {
        a_id: sampleId
    })

    if (error) {
        console.error("[VAULT_ERROR]", error)
        if (error.message.includes('INSUFFICIENT_FUNDS')) return { success: false, error: 'INSUFFICIENT_FUNDS' }
        if (error.message.includes('USER_ACCOUNT_NOT_FOUND')) return { success: false, error: 'USER_ACCOUNT_NOT_FOUND' }
        return { success: false, error: error.message }
    }

    return { success: true }
}

/** 📥 DOWNLOAD FLOW (Checking the Vault) **/
export async function getDownloadUrl(sampleId: string) {
    const supabase = await createClient()
    const adminClient = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    // 1. Get sample info with Admin Signal
    const { data: sample } = await adminClient.from('samples').select('name, pack_id').eq('id', sampleId).single()
    if (!sample) throw new Error('Sound artifact not found in master registry.')

    // 2. VAULT CHECK (Admin Signal for Registry)
    const { data: vaultItems } = await adminClient.from('user_vault')
        .select('item_id, item_type')
        .eq('user_id', user.id)

    const isOwned = vaultItems?.some((v: any) => 
        (v.item_type === 'sample' && v.item_id === sampleId) || 
        (v.item_type === 'pack' && v.item_id === sample.pack_id)
    )

    if (!isOwned) {
        throw new Error('Ownership verification failed in your node vault.')
    }

    // 3. Generate a secure, temporary download token
    const token = jwt.sign({ sampleId, purpose: 'download' }, JWT_SECRET, { expiresIn: '15m' })

    return { 
        url: `/api/audio?id=${sampleId}&token=${token}`,
        fileName: `${sample.name}.wav`
    }
}

/** 🎰 BULK UNLOCK (V13 Hyper-Speed Protocol) **/
export async function unlockFullPack(packId: string) {
    const supabase = await createClient()
    const adminClient = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    const { data: pack } = await adminClient.from('sample_packs').select('name, bundle_credit_cost, slug').eq('id', packId).single()
    if (!pack) throw new Error('Pack not found')

    const cost = pack.bundle_credit_cost || 50

    // 1. ATOMIC_TRANSACTION
    const { error } = await supabase.rpc('atomic_unlock_asset', {
        a_id: packId
    })

    if (error) {
        console.error("[VAULT_ERROR]", error)
        if (error.message.includes('INSUFFICIENT_FUNDS')) return { success: false, error: 'INSUFFICIENT_FUNDS' }
        return { success: false, error: error.message }
    }

    // 2. 📧 Background Email (Non-blocking)
    if (user.email) {
        import('@/lib/email').then(({ sendPurchaseEmail }) => {
            const orderId = `crd_${Math.random().toString(36).slice(-6)}`
            sendPurchaseEmail(
                user.id, 
                user.email!, 
                user.user_metadata?.full_name || 'Producer', 
                pack.name, 
                'Master Sample Pack', 
                cost, 
                orderId, 
                [], 
                'CREDITS'
            ).catch(e => console.error("[CREDIT_EMAIL_ERROR]", e));
        })
    }

    return { success: true }
}
