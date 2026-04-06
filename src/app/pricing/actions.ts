'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Razorpay from 'razorpay'

// 💳 INITIALIZE RAZORPAY (Build-safe)
const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/**
 * 🛒 Razorpay Order Action (Monthly)
 */
export async function createSubscription(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/pricing')
  if (!razorpay) throw new Error('Razorpay is not configured on the server')

  // 1. Fetch Plan Details
  const { data: plan, error: planError } = await supabase.from('subscription_plans').select('*').eq('id', planId).single()
  if (planError || !plan) throw new Error('Invalid subscription plan')

  // 2. CREATE RAZORPAY ORDER
  try {
    const order = await razorpay.orders.create({
      amount: plan.price_inr * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      notes: { user_id: user.id, plan_id: planId, type: 'subscription' }
    })

    return { 
        success: true, 
        orderId: order.id, 
        amount: order.amount, 
        key: process.env.RAZORPAY_KEY_ID,
        user: { email: user.email, name: user.user_metadata?.full_name || 'Producer' }
    }
  } catch (err: any) {
    console.error("Razorpay Sub Error:", err)
    throw new Error('Failed to start checkout. Check your API keys.')
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
 * ✅ Razorpay Payment Verification
 * This is called from the client after a successful Razorpay modal payment
 */
export async function verifyPayment(paymentRes: any, orderId: string, itemType: 'subscription' | 'pack' | 'sample_pack', itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    if (itemType === 'subscription') {
        const { data: plan } = await supabase.from('subscription_plans').select('*').eq('id', itemId).single()
        if (!plan) throw new Error('Plan not found')

        // 1. Link Plan & Update Account (Atomic)
        const { error: accountError } = await supabase
            .from('user_accounts')
            .upsert({
                user_id: user.id,
                plan_id: plan.id,
                next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }, { onConflict: 'user_id' })
        
        if (accountError) throw accountError

        // 2. Inject Monthly Credits
        const { error: creditError } = await supabase.rpc('add_credits', {
            u_id: user.id,
            amount: plan.credits_per_month
        })
        if (creditError) throw creditError

        // 3. Log to Ledger
        await supabase.from('credit_orders').insert({
            user_id: user.id,
            order_id: orderId,
            payment_id: paymentRes.razorpay_payment_id,
            amount_inr: plan.price_inr,
            credits_awarded: plan.credits_per_month,
            status: 'paid',
            raw_response: paymentRes
        })

    } else if (itemType === 'pack') {
        const { data: pack } = await supabase.from('credit_packs').select('*').eq('id', itemId).single()
        if (!pack) throw new Error('Pack not found')

        // 1. Inject Pack Credits
        const { error: creditError } = await supabase.rpc('add_credits', {
            u_id: user.id,
            amount: pack.credits
        })
        if (creditError) throw creditError

        // 2. Log to Ledger
        await supabase.from('credit_orders').insert({
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
        const { data: pack } = await supabase.from('sample_packs').select('*').eq('id', itemId).single()
        if (!pack) throw new Error('Pack not found')

        // Insert ONE record into user_vault (type 'pack')
        const { error: vaultError } = await supabase.from('user_vault').upsert({
            user_id: user.id,
            item_id: pack.id,
            item_type: 'pack',
            item_name: `Full Pack: ${pack.name}`,
            amount: 0 // Cash purchase doesn't consume credits, it creates the entry directly
        }, { onConflict: 'user_id,item_id' })

        if (vaultError) throw vaultError

        // Log transaction
        await supabase.from('credit_orders').insert({
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

    const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .eq('status', 'active')

    if (error) throw new Error('Failed to cancel subscription')

    revalidatePath('/pricing')
    revalidatePath('/')
    return { success: true }
}
