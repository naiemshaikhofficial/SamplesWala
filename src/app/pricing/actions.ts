'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Razorpay from 'razorpay'
import crypto from 'crypto'

// 💳 INITIALIZE RAZORPAY (Build-safe)
const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/**
 * 🛒 Razorpay Subscription Action (Monthly UPI Mandate Flow)
 */
export async function createSubscription(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/pricing')
  if (!razorpay) throw new Error('Razorpay is not configured on the server')

  // 1. Fetch Plan Details (Including the Razorpay Plan ID for mandate flow)
  const { data: plan, error: planError } = await supabase.from('subscription_plans').select('*').eq('id', planId).single()
  if (planError || !plan) throw new Error('Invalid subscription plan')

  // 2. DETECT COMMERCE SIGNAL: Use Subscription API if Plan ID is mapped
  try {
    if (plan.razorpay_plan_id) {
        // 🧬 TRIAL_LOGIC: Apply 30-day trial for 'Starter' identities only
        const { data: account } = await supabase.from('user_accounts').select('is_trial_used, subscription_status').eq('user_id', user.id).single()
        const isTrialEligible = plan.name === 'Starter' && !account?.is_trial_used && account?.subscription_status !== 'ACTIVE'
        
        const trialDays = 30;
        const startAt = isTrialEligible 
            ? Math.floor(Date.now() / 1000) + (trialDays * 24 * 60 * 60)
            : undefined;

        const subscription = await razorpay.subscriptions.create({
          plan_id: plan.razorpay_plan_id,
          total_count: 60, // Authorize for 1 year of recurring signals
          quantity: 1,
          start_at: startAt, // 🔥 Charges start after 30 days if eligible
          customer_notify: 1,
          notes: {
            user_id: user.id,
            plan_id: planId,
            type: 'subscription_mandate',
            is_trial: isTrialEligible ? 'true' : 'false'
          }
        })

        return { 
            success: true, 
            subscriptionId: subscription.id,
            amount: isTrialEligible ? 500 : (plan.price_inr * 100), // Display ₹5 refundable auth fee for trials
            key: process.env.RAZORPAY_KEY_ID,
            user: { email: user.email, name: user.user_metadata?.full_name || 'Producer' },
            isSubscription: true,
            isTrialLink: isTrialEligible,
            planPrice: plan.price_inr
        }
    } else {
        // Fallback to standard order if no plan_id is mapped yet
        const order = await razorpay.orders.create({
          amount: plan.price_inr * 100, 
          currency: 'INR',
          receipt: `sub_${Date.now()}`,
          notes: { user_id: user.id, plan_id: planId, type: 'subscription' }
        })

        return { 
            success: true, 
            orderId: order.id, 
            amount: order.amount, 
            key: process.env.RAZORPAY_KEY_ID,
            user: { email: user.email, name: user.user_metadata?.full_name || 'Producer' },
            isSubscription: false
        }
    }
  } catch (err: any) {
    console.error("[SUBSCRIPTION_SIGNAL_ERROR]", err)
    throw new Error(`Failed to initiate ${plan.razorpay_plan_id ? 'mandate' : 'order'}: ${err.message}`)
  }
}

/**
 * ⚡ Razorpay Order Action (Top-up Pack)
 */
export async function purchaseCreditPack(packId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/pricing')
  if (!razorpay) throw new Error('Razorpay is not configured on the server')

  // 1. Fetch Pack Details
  const { data: pack, error: packError } = await supabase.from('credit_packs').select('*').eq('id', packId).single()
  if (packError || !pack) throw new Error('Invalid credit pack')

  // 2. CREATE RAZORPAY ORDER
  try {
    const order = await razorpay.orders.create({
      amount: pack.price_inr * 100,
      currency: 'INR',
      receipt: `pack_${Date.now()}`,
      notes: { user_id: user.id, pack_id: packId, type: 'pack' }
    })

    return { 
        success: true, 
        orderId: order.id, 
        amount: order.amount, 
        key: process.env.RAZORPAY_KEY_ID,
        user: { email: user.email, name: user.user_metadata?.full_name || 'Producer' }
    }
  } catch (err: any) {
    console.error("Razorpay Pack Error:", err)
    throw new Error('Failed to start checkout. Check your API keys.')
  }
}

/**
 * 💿 Razorpay Order Action (Full Sample Pack)
 */
export async function purchaseSamplePack(packId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) redirect('/auth/login?redirect=/packs/' + packId)
    if (!razorpay) throw new Error('Razorpay is not configured on the server')
  
    // 1. Fetch Pack Details
    const { data: pack, error: packError } = await supabase.from('sample_packs').select('*').eq('id', packId).single()
    if (packError || !pack) throw new Error('Invalid sample pack')
  
    // 2. CREATE RAZORPAY ORDER
    try {
      const order = await razorpay.orders.create({
        amount: pack.price_inr * 100,
        currency: 'INR',
        receipt: `pack_full_${Date.now()}`,
        notes: { user_id: user.id, pack_id: packId, type: 'sample_pack' }
      })
  
      return { 
          success: true, 
          orderId: order.id, 
          amount: order.amount, 
          key: process.env.RAZORPAY_KEY_ID,
          user: { email: user.email, name: user.user_metadata?.full_name || 'Producer' }
      }
    } catch (err: any) {
      console.error("Razorpay Pack Error:", err)
      throw new Error('Failed to start checkout. Check your API keys.')
    }
}

/**
 * ✅ Razorpay Payment Verification (High-Fidelity Handshake)
 */
export async function verifyPayment(paymentRes: any, targetId: string, itemType: 'subscription' | 'pack' | 'sample_pack', itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 🔐 1. SIGNATURE_VERIFICATION_ROUTING
    const signature = paymentRes.razorpay_signature
    const paymentId = paymentRes.razorpay_payment_id
    const orderId = paymentRes.razorpay_order_id
    const subscriptionId = paymentRes.razorpay_subscription_id

    let body = ''
    if (subscriptionId) body = `${paymentId}|${subscriptionId}`  // Razorpay subscription format
    else body = `${orderId}|${paymentId}`                        // Razorpay order format

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest('hex')

    if (expectedSignature !== signature) {
        throw new Error('Signal Forge Detected: Payment verification failed.')
    }

    // ✅ Signature verified — use service-role client to bypass RLS for fulfillment writes
    const adminSupabase = getAdminClient()

    // 📡 2. COMMERCE_FULFILLMENT_ORCHESTRATION
    if (itemType === 'subscription') {
        const { data: plan } = await adminSupabase.from('subscription_plans').select('*').eq('id', itemId).single()
        if (!plan) throw new Error('Artifact Plan not found')

        // 1. Finalize Local Membership
        const { error: accountError } = await adminSupabase
            .from('user_accounts')
            .upsert({
                user_id: user.id,
                plan_id: plan.id,
                razorpay_subscription_id: subscriptionId || null, // Link recurring signal
                next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                is_trial_used: true // Consume trial eligibility
            }, { onConflict: 'user_id' })
        
        if (accountError) throw accountError

        // 2. Inject Initial Credits (Tokens)
        await adminSupabase.rpc('add_credits', { u_id: user.id, amount: plan.credits_per_month })

        // 3. Log Secure Audit Trail
        await adminSupabase.from('credit_orders').insert({
            user_id: user.id,
            order_id: subscriptionId || orderId,
            payment_id: paymentId,
            amount_inr: plan.price_inr,
            credits_awarded: plan.credits_per_month,
            status: 'paid',
            raw_response: paymentRes
        })

    } else if (itemType === 'pack') {
        const { data: pack } = await adminSupabase.from('credit_packs').select('*').eq('id', itemId).single()
        if (!pack) throw new Error('Pack not found')

        // 1. Inject Pack Credits
        const { error: creditError } = await adminSupabase.rpc('add_credits', {
            u_id: user.id,
            amount: pack.credits
        })
        if (creditError) throw creditError

        // 2. Log to Ledger
        await adminSupabase.from('credit_orders').insert({
            user_id: user.id,
            order_id: orderId,
            payment_id: paymentRes.razorpay_payment_id,
            amount_inr: pack.price_inr,
            credits_awarded: pack.credits,
            status: 'paid',
            raw_response: paymentRes
        })

    } else if (itemType === 'sample_pack') {
        // 🔥 MINIMALIST FULL PACK UNLOCK
        const { data: pack } = await adminSupabase.from('sample_packs').select('*').eq('id', itemId).single()
        if (!pack) throw new Error('Pack not found')

        // Insert ONE record into user_vault (type 'pack')
        const { error: vaultError } = await adminSupabase.from('user_vault').upsert({
            user_id: user.id,
            item_id: pack.id,
            item_type: 'pack',
            item_name: `Full Pack: ${pack.name}`,
            amount: 0
        }, { onConflict: 'user_id,item_id' })

        if (vaultError) throw vaultError

        // Log transaction
        await adminSupabase.from('credit_orders').insert({
            user_id: user.id,
            order_id: orderId,
            payment_id: paymentRes.razorpay_payment_id,
            amount_inr: pack.price_inr || 0,
            credits_awarded: 0,
            status: 'paid',
            raw_response: paymentRes
        })
    }

    revalidatePath('/')
    revalidatePath('/pricing')
    revalidatePath('/browse')
    revalidatePath('/packs/[slug]', 'page')

    return { success: true }
}

/**
 * ⛔ Cancel Subscription
 */
export async function cancelSubscription() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 🛡️ Master Registry Sync: Update accounts directly (v5.1 Architecture)
    const { error } = await supabase
        .from('user_accounts')
        .update({ 
            plan_id: null, 
            razorpay_subscription_id: null,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

    if (error) {
        console.error("[STUDIO_VAULT_ERROR] CANCEL_FAILED:", error.message)
        throw new Error('Failed to cancel membership node.')
    }

    revalidatePath('/pricing')
    revalidatePath('/')
    return { success: true }
}
