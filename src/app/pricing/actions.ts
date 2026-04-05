'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * 🛒 Simulated Premium Checkout Action
 * In production, this would integrate with Razorpay/Stripe/Stax
 */
export async function createSubscription(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/pricing')
  }

  // 1. Fetch Plan Details (to know how many credits to give)
  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single()

  if (planError || !plan) throw new Error('Invalid subscription plan')

  // 2. SIMULATE PAYMENT SUCCESS
  // Normally: call Stripe.checkout.sessions.create()
  
  // 3. Update User Subscription & Grant Credits
  // We use upsert so we only have 1 active subscription per user
  const { error: subError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: user.id,
      plan_id: plan.id,
      current_credits: plan.credits_per_month, // Drop the monthly credits instantly
      status: 'active',
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    })

  if (subError) {
      console.error("Subscription update failed:", subError)
      throw new Error('Failed to process subscription. Please try again.')
  }

  // 4. Record the Purchase for Analytics
  await supabase.from('purchases').insert({
      user_id: user.id,
      amount: plan.price_inr, // Storing in INR for our records
      item_type: 'subscription',
      item_name: `${plan.name} Plan`
  })

  revalidatePath('/pricing')
  revalidatePath('/')
  
  return { success: true, message: `Welcome to the ${plan.name} club! ${plan.credits_per_month} credits added.` }
}

/**
 * ⚡ One-Time Credit Top-up Action
 */
export async function purchaseCreditPack(packId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/pricing')
  }

  // 1. Fetch Pack Details
  const { data: pack, error: packError } = await supabase
    .from('credit_packs')
    .select('*')
    .eq('id', packId)
    .single()

  if (packError || !pack) throw new Error('Invalid credit pack')

  // 2. SIMULATE PAYMENT SUCCESS

  // 3. Increment User Credits
  // We check for current sub first
  let { data: sub } = await supabase.from('user_subscriptions').select('id, current_credits').eq('user_id', user.id).single()

  if (sub) {
    // Add to existing balance
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({ current_credits: (sub.current_credits || 0) + pack.credits })
      .eq('id', sub.id)
    if (updateError) throw new Error('Failed to update credits')
  } else {
    // Start a new "One-time" balance track
    const { error: insertError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        current_credits: pack.credits,
        status: 'active',
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // One-time packs last 1 year
      })
    if (insertError) throw new Error('Failed to initialize credits')
  }

  // 4. Record Purchase
  await supabase.from('purchases').insert({
      user_id: user.id,
      amount: pack.price_inr,
      item_type: 'credit_pack',
      item_name: `${pack.name} (${pack.credits} Credits)`
  })

  revalidatePath('/pricing')
  revalidatePath('/')
  
  return { success: true, message: `Boom! ${pack.credits} extra credits added to your account.` }
}
