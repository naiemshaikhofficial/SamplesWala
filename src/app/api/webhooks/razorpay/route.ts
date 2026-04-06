import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

/**
 * 🛰️ STUDIO_WEBHOOK_RECEIVER (RAZORPAY)
 * Handles auto-renewals, subscription updates, and payment failures.
 */
export async function POST(req: Request) {
    const payload = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!secret || !signature) {
        return NextResponse.json({ error: 'Webhook Secret/Signature Missing' }, { status: 400 })
    }

    // 🔐 VALIDATE RECEPTION
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

    if (expectedSignature !== signature) {
        console.error('[WEBHOOK_ERROR] CRYPTOGRAPHIC SIGNATURE MISMATCH.')
        return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 })
    }

    const event = JSON.parse(payload)
    const supabase = await createClient()

    try {
        switch (event.event) {
            case 'subscription.charged':
                // 🔋 RENEWAL SUCCESSFUL
                const subscription = event.payload.subscription.entity
                const payment = event.payload.payment.entity
                
                // Fetch User by Subscription ID (Stored in user_accounts or metadata)
                const { data: account, error: accountError } = await supabase
                    .from('user_accounts')
                    .select('user_id, plan_id, subscription_plans(credits_per_month)')
                    .eq('razorpay_subscription_id', subscription.id)
                    .single()

                if (account) {
                    const creditsToInject = (account.subscription_plans as any)?.credits_per_month || 0
                    
                    // 1. INJECT CREDITS
                    await supabase.rpc('add_credits', {
                        u_id: account.user_id,
                        amount: creditsToInject
                    })

                    // 2. LOG TRANSACTION
                    await supabase.from('credit_orders').insert({
                        user_id: account.user_id,
                        order_id: subscription.id, // Linking to Subscription ID
                        payment_id: payment.id,
                        amount_inr: payment.amount / 100,
                        credits_awarded: creditsToInject,
                        status: 'paid',
                        raw_response: event
                    })
                    
                    console.log(`[RENEWAL_SYNC_ACTIVE] ${creditsToInject} credits added for user ${account.user_id}`)
                }
                break;

            case 'subscription.cancelled':
                const cancelledSub = event.payload.subscription.entity
                await supabase
                    .from('user_accounts')
                    .update({ plan_id: null, razorpay_subscription_id: null })
                    .eq('razorpay_subscription_id', cancelledSub.id)
                console.log(`[SUBSCRIPTION_HALTED] Node ${cancelledSub.id} disconnected.`)
                break;

            case 'payment.failed':
                // Optional: Notify user
                console.warn('[TRANSACTION_REJECTED] Payment failed for user.')
                break;
        }

        revalidatePath('/', 'layout')
        return NextResponse.json({ received: true })

    } catch (err: any) {
        console.error('[WEBHOOK_CRITICAL_FAILURE]', err.message)
        return NextResponse.json({ error: 'Internal Signal Error' }, { status: 500 })
    }
}
