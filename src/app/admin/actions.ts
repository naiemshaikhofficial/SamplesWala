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
