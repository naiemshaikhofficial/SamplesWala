'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateBillingAction(formData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('UNAUTHENTICATED')

    // 🛡️ Use Admin Client to bypass RLS and ensure high-fidelity persistence
    const adminSupabase = getAdminClient()
    
    const { error } = await adminSupabase
        .from('user_accounts')
        .update({
            full_name: formData.full_name,
            phone_number: formData.phone,
            address_line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zip,
            gstin: formData.gstin,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

    if (error) {
        console.error("[BILLING_CENTER_ERROR] Update failed:", error.message)
        throw new Error(error.message)
    }
    
    revalidatePath('/profile')
    return { success: true }
}
