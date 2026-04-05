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

        await supabase.from('user_subscriptions').upsert({
            user_id: user.id,
            plan_id: plan.id,
            current_credits: plan.credits_per_month,
            status: 'active',
            period_start: new Date().toISOString(),
            period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })

        await supabase.from('purchases').insert({
            user_id: user.id,
            amount: plan.price_inr,
            item_type: 'subscription',
            item_name: `${plan.name} Plan`,
            payment_id: paymentRes.razorpay_payment_id
        })
    } else if (itemType === 'pack') {
        const { data: pack } = await supabase.from('credit_packs').select('*').eq('id', itemId).single()
        if (!pack) throw new Error('Pack not found')

        let { data: sub } = await supabase.from('user_subscriptions').select('id, current_credits').eq('user_id', user.id).single()

        if (sub) {
            await supabase.from('user_subscriptions').update({ current_credits: (sub.current_credits || 0) + pack.credits }).eq('id', sub.id)
        } else {
            await supabase.from('user_subscriptions').insert({
                user_id: user.id,
                current_credits: pack.credits,
                status: 'active',
                period_start: new Date().toISOString(),
                period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            })
        }

        await supabase.from('purchases').insert({
            user_id: user.id,
            amount: pack.price_inr,
            item_type: 'credit_pack',
            item_name: `${pack.name} Pack`,
            payment_id: paymentRes.razorpay_payment_id
        })
    } else if (itemType === 'sample_pack') {
        // 🔥 FULL PACK UNLOCK LOGIC
        const { data: pack } = await supabase.from('sample_packs').select('*, samples(*)').eq('id', itemId).single()
        if (!pack) throw new Error('Pack not found')

        const samples = pack.samples || []
        if (samples.length > 0) {
            const unlockEntries = samples.map((s: any) => ({
                user_id: user.id,
                sample_id: s.id
            }))
            
            // Insert into unlocked_samples (upsert to avoid duplicates)
            await supabase.from('unlocked_samples').upsert(unlockEntries, { onConflict: 'user_id,sample_id' })
        }

        await supabase.from('purchases').insert({
            user_id: user.id,
            amount: pack.price_inr || 0,
            item_type: 'sample_pack',
            item_name: `Full Pack: ${pack.name}`,
            payment_id: paymentRes.razorpay_payment_id
        })
    }

    revalidatePath('/pricing')
    revalidatePath('/')
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
