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
        exp: Math.floor(Date.now() / 1000) + 300
    }
    return jwt.sign(payload, JWT_SECRET)
}

import { grantDrivePermission } from '@/lib/drive/automation'

/** 💳 THE NEW MINIMALIST UNLOCK SYSTEM (2-Table Strategy) **/
export async function unlockSample(sampleId: string) {
    const supabase = await createClient()
    const adminClient = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    // 1. Get Sample Details (Admin Signal for Verification)
    const { data: sample } = await adminClient.from('samples').select('name, credit_cost, pack_id').eq('id', sampleId).single()
    const cost = sample?.credit_cost || 1

    // 2. CHECK & DEDUCT (Single RPC Call to process_unlock)
    const { error: deductError } = await supabase.rpc('process_unlock', {
        u_id: user.id,
        cost: cost
    })

    if (deductError) throw new Error('Insufficient credits or account missing.')

    // 3. SECURE IN VAULT (Admin Signal for Registry)
    const { error: vaultError } = await adminClient
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

    // 4. AUTOMATED_SIGNAL_PERMISSION (DISABLED: Using Direct Proxy V4 instead)
    /*
    if (user.email) {
        await grantDrivePermission(user.email, sampleId, false);
    }
    */

    revalidatePath('/', 'layout')
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
    const adminClient = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    const { data: pack } = await adminClient.from('sample_packs').select('*').eq('id', packId).single()
    if (!pack) throw new Error('Pack not found')

    const cost = pack.bundle_credit_cost || 50

    // 1. Deduct Credits
    const { error: deductError } = await supabase.rpc('process_unlock', {
        u_id: user.id,
        cost: cost
    })

    if (deductError) throw new Error('Transaction Failed: Insufficient credits.')

    // 2. Register Ownership in user_vault (Admin Signal)
    const { error: vaultError } = await adminClient.from('user_vault').insert({
        user_id: user.id,
        item_id: packId,
        item_type: 'pack',
        item_name: `Full Pack: ${pack.name}`,
        amount: cost
    })

    if (vaultError) throw new Error("Ownership Registration Failed: " + vaultError.message)

    // 3. 📧 Dispatch Credit Purchase Email Note
    if (user.email) {
        // Must dynamically import crypto for server logic
        const crypto = await import('crypto') 
        const orderId = `crd_${crypto.randomBytes(4).toString('hex')}`
        
        const links = [];
        if (pack.download_url) links.push({ label: 'Download Pack (.ZIP)', url: pack.download_url });
        
        // Let it run async without blocking the client response
        const { sendPurchaseEmail } = await import('@/lib/email')
        sendPurchaseEmail(
            user.id, 
            user.email, 
            user.user_metadata?.full_name || 'Producer', 
            pack.name, 
            'Master Sample Pack (Credit Purchase)', 
            cost, 
            orderId, 
            links, 
            'CREDITS'
        ).catch(e => console.error("[CREDIT_EMAIL_ERROR]", e));
    }

    revalidatePath(`/packs/${pack.slug}`)
    return { success: true }
}
