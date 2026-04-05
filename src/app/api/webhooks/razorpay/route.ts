import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * 🛡️ SAMPLES WALA: RAZORPAY WEBHOOK RECEIVER
 * This is the ultimate "Bank-to-Marketplace" link.
 * It grants credits ONLY when Razorpay confirms the money is in your account.
 */
export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. 🛡️ VERIFY THE BANK SIGNATURE
    // This stops hackers from "Faking" a successful payment
    if (webhookSecret && signature) {
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');
        
        if (expectedSignature !== signature) {
            console.error('[WEBHOOK] Invalid Bank Signature Detected!');
            return new NextResponse('Unauthorized (Invalid Signature)', { status: 401 });
        }
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const supabase = await createClient();

    console.log(`[WEBHOOK] Processing Razorpay Event: ${event}`);

    // 🚀 EVENT: SUBSCRIPTION RENEWAL (PAID)
    if (event === 'subscription.charged') {
        const rzpSubId = payload.payload.subscription.entity.id;
        const amount = payload.payload.payment.entity.amount / 100; // Price in INR

        // Find the user with this Razorpay Subscription ID
        const { data: sub, error } = await supabase
            .from('user_subscriptions')
            .select('*, subscription_plans(credits_per_month)')
            .eq('razorpay_sub_id', rzpSubId)
            .single();

        if (sub && sub.subscription_plans) {
            const freshCredits = (sub.subscription_plans as any).credits_per_month;

            // GRANT THE CREDITS ONLY NOW!
            await supabase.from('user_subscriptions').update({
                current_credits: freshCredits,
                status: 'active',
                period_start: new Date().toISOString(),
                period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }).eq('id', sub.id);

            // LOG THE REAL PURCHASE
            await supabase.from('purchases').insert({
                user_id: sub.user_id,
                amount: amount,
                item_type: 'subscription_renewal',
                item_name: 'Monthly Auto-Renewal',
                payment_id: payload.payload.payment.entity.id
            });

            console.log(`[WEBHOOK] Success! Granted ${freshCredits} credits to user ${sub.user_id}`);
        }
    }

    // 🚀 EVENT: PAYMENT FAILED (SUSPEND)
    if (event === 'subscription.pending') {
        // Stop access if payment failed
        const rzpSubId = payload.payload.subscription.entity.id;
        await supabase.from('user_subscriptions').update({ status: 'suspended' }).eq('razorpay_sub_id', rzpSubId);
        console.warn(`[WEBHOOK] Payment Failed. Subscription ${rzpSubId} suspended.`);
    }

    return NextResponse.json({ processed: true });
}
