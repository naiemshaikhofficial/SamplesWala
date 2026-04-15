'use server'

import { createClient } from '@/lib/supabase/server'

export async function validateDiscountCoupon(code: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // We allow validation even if not logged in (to show discount), 
    // but the final checkout will re-verify.

    const { data: coupon, error } = await supabase
        .from('discount_coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .gt('expires_at', new Date().toISOString())
        .single()

    if (error || !coupon) {
        throw new Error('Invalid or expired coupon code.')
    }

    return {
        code: coupon.code,
        discountPercent: coupon.discount_percent,
        discountAmountInr: coupon.discount_amount_inr,
        discountAmountUsd: coupon.discount_amount_usd,
        minOrderAmountInr: coupon.min_order_amount_inr
    }
}
