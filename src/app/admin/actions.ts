'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { AIStudioAnalyser } from '@/lib/ai/analyser'

// 🛡️ SECURITY PROTOCOL :: GLOBAL AUTHORIZATION
async function ensureAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('UNAUTHENTICATED')

    const { data: adminRecord } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single()
        
    const isAuthorized = !!adminRecord || 
                        user.email?.includes('naiem') || 
                        user.email?.includes('sampleswala') || 
                        user.email?.includes('beatswala');

    if (!isAuthorized) throw new Error('UNAUTHORIZED_ACCESS')
    
    // 🔑 ESCALATE PRIVILEGES :: Switch to Admin Client (Service Role) to bypass RLS
    const adminClient = getAdminClient()
    return { supabase: adminClient, user }
}

// 📦 PACK_CATALOG_ACTIONS
export async function createPackAction(formData: { name: string, description: string, price_inr: number, price_usd: number, cover_url: string, slug: string }) {
    const { supabase } = await ensureAdmin()
    const { data, error } = await supabase
        .from('sample_packs')
        .insert([formData])
        .select()
    if (error) throw new Error(error.message)
    revalidatePath('/admin')
    return { success: true, data }
}

export async function editPackAction(packId: string, formData: any) {
    const { supabase } = await ensureAdmin()
    const { data, error } = await supabase
        .from('sample_packs')
        .update(formData)
        .eq('id', packId)
        .select()
    if (error) throw new Error(error.message)
    revalidatePath('/admin')
    return { success: true, data }
}

export async function deletePackAction(packId: string) {
    const { supabase } = await ensureAdmin()
    const { error } = await supabase
        .from('sample_packs')
        .delete()
        .eq('id', packId)
    if (error) throw new Error(error.message)
    revalidatePath('/admin')
    return { success: true }
}

// 🎵 SOUND_ARTIFACT_ACTIONS
export async function addSoundAction(formData: any) {
    const { supabase } = await ensureAdmin()
    const { data, error } = await supabase
        .from('samples')
        .insert([formData])
        .select()
    if (error) throw new Error(error.message)
    revalidatePath('/admin')
    return { success: true, data }
}

export async function editSoundAction(soundId: string, formData: any) {
    const { supabase } = await ensureAdmin()
    const { data, error } = await supabase
        .from('samples')
        .update(formData)
        .eq('id', soundId)
        .select()
    if (error) throw new Error(error.message)
    revalidatePath('/admin')
    return { success: true, data }
}

export async function deleteSoundAction(soundId: string) {
    const { supabase } = await ensureAdmin()
    const { error } = await supabase
        .from('samples')
        .delete()
        .eq('id', soundId)
    if (error) throw new Error(error.message)
    revalidatePath('/admin')
    return { success: true }
}

// 👥 USER_MODERATION_ACTIONS
export async function updateCreditsAction(userId: string, amount: number) {
    const { supabase } = await ensureAdmin()
    
    // Server-side logic for credit adjustment
    const { data: userAccount, error: fetchError } = await supabase
        .from('user_accounts')
        .select('credits')
        .eq('id', userId)
        .single()

    if (fetchError) throw new Error(fetchError.message)

    const newCredits = (userAccount.credits || 0) + amount
    
    const { error: updateError } = await supabase
        .from('user_accounts')
        .update({ credits: newCredits })
        .eq('id', userId)

    if (updateError) throw new Error(updateError.message)
    
    revalidatePath('/admin')
    return { success: true }
}

export async function assignSubscriptionAction(userId: string, planId: string) {
    const { supabase } = await ensureAdmin()
    
    const { error } = await supabase
        .from('user_accounts')
        .update({ 
            subscription_status: 'active',
            subscription_tier: planId 
        })
        .eq('id', userId)

    if (error) throw new Error(error.message)
    
    revalidatePath('/admin')
    return { success: true }
}

export async function getAllUsersAction() {
    const { supabase } = await ensureAdmin()
    
    // 🔑 SOURCE_OF_TRUTH :: Fetch every identity registered in the Auth Matrix
    const { data: { users }, error: authError } = await (supabase as any).auth.admin.listUsers()
    if (authError) throw new Error(authError.message)

    // 📡 FETCH_SATELLITE_DATA :: Independent fetch for account-level metadata
    const [ { data: accounts }, { data: profiles }, { data: plans } ] = await Promise.all([
        supabase.from('user_accounts').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('subscription_plans').select('*')
    ])

    // 🧬 SIGNAL_MERGE :: Combine identity data with platform status using variant ID mapping
    return users.map((u: any) => {
        const acc = accounts?.find(a => a.id === u.id || a.user_id === u.id)
        const profile = profiles?.find(p => p.id === u.id || p.user_id === u.id)
        const plan = plans?.find(pl => pl.id === acc?.plan_id)
        
        return {
            id: u.id,
            email: u.email || 'SIGNAL_LOST',
            created_at: u.created_at,
            last_sign_in: u.last_sign_in_at,
            credits: acc?.credits || 0,
            subscription_status: acc?.subscription_status || (acc?.plan_id ? 'ACTIVE' : 'INACTIVE'),
            subscription_tier: plan?.name || 'NONE',
            subscription_credits: plan?.credits_per_month || 0,
            next_billing: acc?.next_billing,
            razorpay_subscription_id: acc?.razorpay_subscription_id,
            is_banned: acc?.is_banned || false,
            full_name: profile?.full_name || u.user_metadata?.full_name || 'ANONYMOUS_PRODUCER'
        }
    })
}

export async function getUserVaultAction(userId: string) {
    const { supabase } = await ensureAdmin()
    
    const { data: vaultItems, error: vaultError } = await supabase
        .from('user_vault')
        .select('*')
        .eq('user_id', userId)

    if (vaultError) throw new Error(vaultError.message)

    // 🎹 RESOLVE_ARTIFACT_NAMES
    const sampleIds = vaultItems.filter(v => v.item_type === 'sample').map(v => v.item_id)
    const packIds = vaultItems.filter(v => v.item_type === 'pack').map(v => v.item_id)

    const { data: samples } = await supabase.from('samples').select('id, name').in('id', sampleIds)
    const { data: packs } = await supabase.from('sample_packs').select('id, name').in('id', packIds)

    return vaultItems.map(v => ({
        ...v,
        item_id: v.item_id,
        item_type: v.item_type,
        added_at: v.added_at,
        name: v.item_type === 'sample' 
            ? samples?.find(s => s.id === v.item_id)?.name || 'Unknown Sample'
            : packs?.find(p => p.id === v.item_id)?.name || 'Unknown Pack'
    }))
}

/**
 * 💰 FINANCIAL_AUDIT_ENGINE
 * Fetches every credit acquisition event, INR deposit, and payment status.
 */
export async function getUserTransactionsAction(userId: string) {
    const { supabase } = await ensureAdmin()
    
    const { data: transactions, error } = await supabase
        .from('credit_orders')
        .select('id, order_id, amount_inr, credits_awarded, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return transactions
}

export async function terminateSubscriptionAction(userId: string) {
    const { supabase } = await ensureAdmin()
    const { error } = await supabase
        .from('user_accounts')
        .update({ 
            subscription_status: 'cancelled',
            subscription_tier: 'none' 
        })
        .eq('id', userId)
    if (error) throw new Error(error.message)
    revalidatePath('/admin')
    return { success: true }
}

export async function toggleBanUserAction(userId: string, isBanned: boolean) {
    const { supabase } = await ensureAdmin()
    
    const { error } = await supabase
        .from('user_accounts')
        .update({ is_banned: isBanned })
        .eq('id', userId)
    
    if (error) throw new Error(error.message)
    
    revalidatePath('/admin')
    return { success: true }
}

export async function deleteUserAction(userId: string) {
    const { supabase } = await ensureAdmin()
    
    // ☢️ NUCLEAR_PROTOCOL :: Wipe user from account table and Auth registry
    await supabase.from('user_accounts').delete().eq('id', userId)
    const { error: authError } = await (supabase as any).auth.admin.deleteUser(userId)
    
    if (authError) throw new Error(authError.message)
    
    revalidatePath('/admin')
    return { success: true }
}

// 📡 AI_RESONANCE_ACTIONS
export async function getSamplesToProcessAction(isForce: boolean = false) {
    const { supabase } = await ensureAdmin()
    let query = supabase.from('samples').select('id')
    if (!isForce) query = query.eq('ai_is_processed', false)
    
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data || []
}

export async function processAiSignalAction(sampleId: string) {
    const { supabase } = await ensureAdmin()
    const result = await AIStudioAnalyser.process(sampleId)
    if (!result.success) throw new Error(result.error)
    revalidatePath('/admin')
    return result.results
}
export async function getPackSamplesAction(packId: string) {
    const { supabase } = await ensureAdmin()
    const { data, error } = await supabase
        .from('samples')
        .select('*')
        .eq('pack_id', packId)
        .order('created_at', { ascending: false })
    
    if (error) throw new Error(error.message)
    return data || []
}
