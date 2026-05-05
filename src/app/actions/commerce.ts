'use server'

import Razorpay from 'razorpay'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { getServerAuth } from '@/lib/supabase/auth'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
})

/**
 * 🎫 Redeem Promotional Coupon Protocol
 */
export async function redeemCoupon(code: string) {
    const { user } = await getServerAuth()
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    if (!user) throw new Error('Authentication required')

    // 🔬 Secure RPC Redemption
    const { data: bonus, error } = await supabase.rpc('redeem_coupon', {
        u_id: user.id,
        c_code: code.toUpperCase()
    })

    if (error) {
        if (error.message.includes('INVALID_OR_EXPIRED_CODE')) {
            throw new Error('This Studio Signature (Coupon) is invalid or has expired.')
        }
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    return { success: true, bonusCredits: bonus }
}

/**
 * 💳 Create Razorpay Order Protocol
 */
export async function createTopUpOrder(amountCredits: number) {
    const { user } = await getServerAuth()
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    if (!user) throw new Error('Authentication required')

    // 1 Credit = 1 INR
    const amountInPaise = amountCredits * 100 

    const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_topup_${Date.now()}`,
        notes: {
            userId: user.id,
            credits: amountCredits
        }
    }

    try {
        const order = await razorpay.orders.create(options)
        
        // Log Pending Order to DB for Traceability
        await supabase.from('credit_orders').insert({
            user_id: user.id,
            amount_inr: amountCredits,
            credits_awarded: amountCredits,
            order_id: order.id,
            status: 'pending'
        })

        return { 
            orderId: order.id, 
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        }
    } catch (err: any) {
        throw new Error(`Failed to initiate payment: ${err.message}`)
    }
}

/**
 * 🔐 Verify Razorpay Signature & Award Credits
 */
export async function verifyPayment(payload: {
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
}) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload
    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex')

    if (expectedSignature !== razorpay_signature) {
        console.error("[STUDIO_VAULT_ERROR] SIGNATURE MISMATCH IN PROJECT NODE.");
        throw new Error('CRYPTOGRAPHIC SIGNATURE MISMATCH: Payment verification failed.')
    }

    console.log("[STUDIO_VAULT_PAYMENT] Signature verified. Syncing with ledger...");
    const supabase = await createClient()
    
    // 1. Fetch Order to identify credits
    const { data: order } = await supabase
        .from('credit_orders')
        .select('*')
        .eq('order_id', razorpay_order_id)
        .single()

    if (!order) {
        console.error("[STUDIO_VAULT_ERROR] ORDER_ID NOT FOUND:", razorpay_order_id);
        throw new Error('Transaction record not found in vault.')
    }
    
    if (order.status === 'paid') {
        console.log("[STUDIO_VAULT_PAYMENT] Order already processed. Skipping.");
        return { success: true, alreadyProcessed: true }
    }

    // 2. Start Secure Injection Transaction
    // A: Mark order as Paid + Store Raw Audit Data
    const { error: updateError } = await supabase
        .from('credit_orders')
        .update({ 
            status: 'paid', 
            payment_id: razorpay_payment_id,
            raw_response: payload // High-fidelity audit backup
        })
        .eq('order_id', razorpay_order_id)

    if (updateError) {
        console.error("[STUDIO_VAULT_ERROR] LEDGER UPDATE FAILED:", updateError.message);
        throw updateError
    }

    // B: Inject Credits via Secure Admin Signal
    // 🛡️ SECURITY_AUDIT: Re-verify that credits being awarded match the payment value
    if (order.credits_awarded > order.amount_inr) {
        console.error("[SECURITY_BREACH] Credit mismatch detected. User attempted to award more credits than paid for.");
        throw new Error("SECURITY_ERROR: Credit amount mismatch. Transaction blocked.");
    }

    const adminClient = (await import('@/lib/supabase/admin')).getAdminClient()
    const { error: creditError } = await adminClient.rpc('add_credits', {
        u_id: order.user_id,
        amount: order.credits_awarded
    })

    if (creditError) {
        console.error("[STUDIO_VAULT_ERROR] INJECTION FAILED:", creditError.message);
        throw new Error(`Vault Injection Failed: ${creditError.message}`)
    }

    console.log(`[STUDIO_VAULT_SUCCESS] ${order.credits_awarded} credits added to node ${order.user_id}`);
    revalidatePath('/', 'layout')
    return { success: true }
}
