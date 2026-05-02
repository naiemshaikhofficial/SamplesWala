import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

/**
 * 🛰️ UNIVERSAL_COMMERCE_WEBHOOK (RAZORPAY)
 * Orchestrates signal fulfillment for Subscriptions and Credit Top-ups.
 */
export async function POST(req: Request) {
    const payload = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!secret || !signature) {
        return NextResponse.json({ error: 'Auth Failure' }, { status: 400 })
    }

    // 🔐 CRYPTOGRAPHIC VERIFICATION
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

    if (expectedSignature !== signature) {
        console.error('[RAZORPAY_WEBHOOK] ❌ SIGNATURE_MISMATCH. Secret might be invalid.')
        return NextResponse.json({ error: 'Forgery Detected' }, { status: 400 })
    }

    const event = JSON.parse(payload)
    console.log(`[RAZORPAY_WEBHOOK] 📡 RECEIVED_EVENT: ${event.event}`)
    
    // 🧬 ADMIN_SIGNAL_GATE: Webhooks must use service_role to bypass RLS
    const { getAdminClient } = await import('@/lib/supabase/admin')
    const supabase = getAdminClient()

    try {
        const payment = event.payload.payment?.entity
        console.log(`[RAZORPAY_WEBHOOK] 💳 PAYMENT_ID: ${payment?.id || 'N/A'}`)
        
        const notes = payment?.notes || event.payload.subscription?.entity?.notes || {}
        const userId = notes.user_id
        const type = notes.type // 'subscription', 'pack', 'sample_pack'
        const itemId = notes.plan_id || notes.pack_id

        if (!userId && event.event !== 'subscription.charged' && event.event !== 'subscription.cancelled') {
             console.log('[RAZORPAY_WEBHOOK] ⚠️ SKIP: No user_id in notes.')
             return NextResponse.json({ received: true, skip: "Manual / Untracked payment" })
        }

        // 🛡️ DEDUPLICATION CHECK (Signal Integrity)
        // If payment.id is missing (e.g. in subscription.cancelled events), skip dedup.
        if (payment?.id) {
            const { data: existing } = await supabase
                .from('credit_orders')
                .select('id')
                .eq('payment_id', payment.id)
                .maybeSingle()

            if (existing) {
                return NextResponse.json({ received: true, status: 'Duplicate signal ignored' })
            }
        }

        switch (event.event) {
            case 'order.paid':
            case 'payment.captured':
                // 💿 ONE-TIME ORDER FULFILLMENT (Packs / First-time Sub)
                if (type === 'pack') {
                    if (!itemId) {
                        return NextResponse.json({ received: true, skip: 'No pack_id in notes' })
                    }
                    const { data: pack } = await supabase.from('credit_packs').select('*').eq('id', itemId).single()
                    if (pack) {
                        await supabase.rpc('add_credits', { u_id: userId, amount: pack.credits })
                        await supabase.from('credit_orders').insert({
                            user_id: userId,
                            order_id: payment.order_id,
                            payment_id: payment.id,
                            amount_inr: payment.amount / 100,
                            credits_awarded: pack.credits,
                            status: 'paid',
                            raw_response: event
                        })
                    }
                } else if (type === 'subscription') {
                    if (!itemId) {
                        return NextResponse.json({ received: true, skip: 'No plan_id in notes' })
                    }
                    const { data: plan } = await supabase.from('subscription_plans').select('*').eq('id', itemId).single()
                    if (plan) {
                        const interval = notes.interval || 'MONTHLY'
                        
                        // calculate next billing based on interval
                        const nextBillingDate = new Date()
                        if (interval === 'ANNUAL') {
                            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
                        } else {
                            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
                        }

                        // 🧬 VAULT ANCHOR: Activate Membership & Link Razorpay Node
                        await supabase.from('user_accounts').upsert({
                            user_id: userId,
                            plan_id: plan.id,
                            subscription_status: 'ACTIVE', // 🟢 Explicit activation on first payment
                            razorpay_subscription_id: payment?.subscription_id || notes.subscription_id,
                            next_billing: nextBillingDate.toISOString(),
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id' })

                        const creditsToAward = interval === 'ANNUAL' ? (plan.credits_annual || plan.credits_per_month * 12) : plan.credits_per_month

                        await supabase.rpc('add_credits', { u_id: userId, amount: creditsToAward })
                        await supabase.from('credit_orders').insert({
                            user_id: userId,
                            order_id: payment.order_id || payment.subscription_id,
                            payment_id: payment.id,
                            amount_inr: payment.amount / 100,
                            credits_awarded: creditsToAward,
                            status: 'paid',
                            raw_response: event
                        })
                    }
                }
                break;

            case 'subscription.charged':
                // 🔋 AUTOMATED RENEWAL FULFILLMENT (Recurring)
                const subEntity = event.payload.subscription.entity
                const { data: account } = await supabase
                    .from('user_accounts')
                    .select('user_id, plan_id, subscription_plans(*)')
                    .eq('razorpay_subscription_id', subEntity.id)
                    .maybeSingle()

                if (account?.subscription_plans) {
                    const subNotes = subEntity.notes || {}
                    const interval = subNotes.interval || 'MONTHLY'
                    const plan = account.subscription_plans as any
                    
                    const creditsToAward = interval === 'ANNUAL' ? (plan.credits_annual || plan.credits_per_month * 12) : plan.credits_per_month

                    await supabase.rpc('add_credits', { u_id: account.user_id, amount: creditsToAward })
                    
                    // calculate next billing based on interval
                    const nextBillingDate = new Date()
                    if (interval === 'ANNUAL') {
                        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
                    } else {
                        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
                    }

                    await supabase.from('credit_orders').insert({
                        user_id: account.user_id,
                        order_id: subEntity.id,
                        payment_id: payment.id,
                        amount_inr: payment.amount / 100,
                        credits_awarded: creditsToAward,
                        status: 'paid',
                        raw_response: event
                    })
                    await supabase.from('user_accounts').update({ 
                        subscription_status: 'ACTIVE', // 🔋 Re-activate on recurring charge
                        next_billing: nextBillingDate.toISOString(),
                        updated_at: new Date().toISOString() 
                    }).eq('razorpay_subscription_id', subEntity.id)
                }
                break;

            case 'subscription.authenticated':
            case 'subscription.activated':
                // 📡 MANDATE SYNC: Ensure the subscription link is persistent
                const activeSub = event.payload.subscription.entity
                const subNotes = activeSub.notes || {}
                const isTrial = subNotes.is_trial === 'true'
                
                if (subNotes.user_id) {
                    // 🛡️ EXTRACT_FINGERPRINT_FOR_FRAUD_SHIELD
                    // Note: In some scenarios, we might need a separate GET request to fetch payment details if not in payload
                    const fingerprint = payment?.card_id || payment?.vpa || null;

                    await supabase.from('user_accounts').update({ 
                        razorpay_subscription_id: activeSub.id,
                        plan_id: subNotes.plan_id,
                        subscription_status: 'ACTIVE', // 📡 Explicit Status Sync
                        is_trial_used: isTrial ? true : undefined, // Mark trial consumption
                        is_trial_active: isTrial, // 🔥 Trigger restricted access mode
                        trial_downloads_count: isTrial ? 0 : undefined, // Reset counters for new trial
                        payment_fingerprint: fingerprint, // 🛡️ Permanent Payment Link
                        device_fingerprint: subNotes.device_fingerprint, // 🧬 Physical Device Link
                        updated_at: new Date().toISOString()
                    }).eq('user_id', subNotes.user_id)
                }
                break;

            case 'subscription.cancelled':
                const cancelledSub = event.payload.subscription.entity
                await supabase.from('user_accounts').update({ 
                    subscription_status: 'INACTIVE', // 🛑 Deactivate membership
                    razorpay_subscription_id: null,
                    updated_at: new Date().toISOString()
                }).eq('razorpay_subscription_id', cancelledSub.id)
                console.log(`[SUBSCRIPTION_HALTED] Node ${cancelledSub.id} disconnected.`)
                break;
        }

        revalidatePath('/', 'layout')
        revalidatePath('/profile')
        console.log(`[RAZORPAY_WEBHOOK] ✅ PROCESSED_EVENT: ${event.event}`)
        return NextResponse.json({ received: true })

    } catch (err: any) {
        console.error('[RAZORPAY_WEBHOOK] 🛑 CRITICAL_FAILURE:', err.message)
        return NextResponse.json({ error: 'Internal Signal Error', details: err.message }, { status: 500 })
    }
}
