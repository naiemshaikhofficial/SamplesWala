import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

/**
 * 📡 WEBHOOK_HEALTH_CHECK (GET)
 * Prevents 405 errors and confirms route visibility.
 */
export async function GET() {
    return new Response('RAZORPAY_WEBHOOK_ACTIVE: Send POST signals here.', { status: 200 })
}

/**
 * 🛰️ UNIVERSAL_COMMERCE_WEBHOOK (RAZORPAY)
 * Orchestrates signal fulfillment for Subscriptions and Credit Top-ups.
 */
export async function POST(req: Request) {
    const payload = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!secret || !signature) {
        console.error('[RAZORPAY_WEBHOOK] 🛑 AUTH_FAILURE: Missing secret or signature.')
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
        if (payment?.id) {
            const { data: existing } = await supabase
                .from('credit_orders')
                .select('id')
                .eq('payment_id', payment.id)
                .maybeSingle()

            if (existing) {
                console.log(`[RAZORPAY_WEBHOOK] 🛡️ DUP_SKIPPED: ${payment.id}`)
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
                            order_id: payment?.order_id,
                            payment_id: payment?.id,
                            amount_inr: (payment?.amount || 0) / 100,
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
                            order_id: payment?.order_id || payment?.subscription_id || notes.subscription_id,
                            payment_id: payment?.id,
                            amount_inr: (payment?.amount || 0) / 100,
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
                        payment_id: payment?.id || subEntity.id,
                        amount_inr: (payment?.amount || subEntity.amount) / 100,
                        credits_awarded: creditsToAward,
                        status: 'paid',
                        raw_response: event
                    })
                    await supabase.from('user_accounts').update({ 
                        subscription_status: 'ACTIVE', // 🔋 Re-activate on recurring charge
                        next_billing: nextBillingDate.toISOString(),
                        updated_at: new Date().toISOString() 
                    }).eq('razorpay_subscription_id', subEntity.id)
                } else {
                    console.warn(`[RAZORPAY_WEBHOOK] ⚠️ CHARGE_SIGNAL_LOST: No local account for sub ${subEntity.id}`)
                }
                break;

            case 'subscription.authenticated':
            case 'subscription.activated':
                // 📡 MANDATE SYNC: Ensure the subscription link is persistent
                const activeSub = event.payload.subscription.entity
                const activeSubNotes = activeSub.notes || {}
                const isTrial = activeSubNotes.is_trial === 'true'
                
                if (activeSubNotes.user_id) {
                    const fingerprint = payment?.card_id || payment?.vpa || null;

                    await supabase.from('user_accounts').update({ 
                        razorpay_subscription_id: activeSub.id,
                        plan_id: activeSubNotes.plan_id,
                        subscription_status: 'ACTIVE', // 📡 Explicit Status Sync
                        is_trial_used: isTrial ? true : undefined,
                        is_trial_active: isTrial,
                        trial_downloads_count: isTrial ? 0 : undefined,
                        payment_fingerprint: fingerprint,
                        device_fingerprint: activeSubNotes.device_fingerprint,
                        updated_at: new Date().toISOString()
                    }).eq('user_id', activeSubNotes.user_id)
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

        // 🧬 SELECTIVE_CACHE_INVALIDATION: Only revalidate on state-changing events
        const stateChangingEvents = [
            'order.paid', 'payment.captured', 'subscription.charged', 
            'subscription.activated', 'subscription.authenticated', 'subscription.cancelled'
        ];

        if (stateChangingEvents.includes(event.event)) {
            revalidatePath('/', 'layout')
            revalidatePath('/profile')
            revalidatePath('/browse')
            
            try {
                const { revalidateTag } = await import('next/cache')
                revalidateTag('browse', 'default')
                revalidateTag('user-subscription-status', 'default')
                revalidateTag('user-pack-ownership', 'default')
            } catch (e) {
                console.error('[WEBHOOK_CACHE_ERROR]', e)
            }
        }
        console.log(`[RAZORPAY_WEBHOOK] ✅ PROCESSED_EVENT: ${event.event}`)
        
        // 🛡️ ALWAYS RETURN 200 TO RAZORPAY AT THE END OF SUCCESSFUL FLOW
        return NextResponse.json({ received: true })

    } catch (err: any) {
        // 🛑 LOG CRITICAL ERRORS BUT RETURN 200 IF POSSIBLE TO PREVENT DISABLE
        // (Only return 500 if the error is retry-able and we want Razorpay to try again)
        console.error('[RAZORPAY_WEBHOOK] 🛑 CRITICAL_FAILURE:', err.message)
        
        // We return 200 here to stop Razorpay from disabling the webhook due to retries
        // But we log the error for our own debugging.
        return NextResponse.json({ 
            received: true, 
            status: 'Internal Signal Error', 
            details: err.message 
        }, { status: 200 })
    }
}
