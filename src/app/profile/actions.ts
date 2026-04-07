'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBillingAction(formData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('UNAUTHENTICATED')

    const { error } = await supabase
        .from('user_accounts')
        .update({
            full_name: formData.full_name,
            phone_number: formData.phone,
            address_line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zip,
            gstin: formData.gstin
        })
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)
    
    revalidatePath('/profile')
    return { success: true }
}
