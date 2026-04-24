'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { generateInvoicePDF } from '@/lib/pdfGenerator'
import { sendPurchaseEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

// 💳 INITIALIZE PAYPAL (Build-safe)
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();
  return data.access_token;
}

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
export async function createSubscription(planId: string, interval: 'MONTHLY' | 'ANNUAL' = 'MONTHLY', deviceFingerprint?: string) {
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
        // 🧬 TRIAL_LOGIC: Apply 30-day trial for 'Starter' identities only on MONTHLY cycle
        const { data: account } = await supabase.from('user_accounts').select('is_trial_used, subscription_status, phone_number').eq('user_id', user.id).single()
        
        // 🛡️ ANTI-FRAUD: Check if this phone number or hardware device has already used a trial
        const { data: duplicateTrial } = await supabase
            .from('user_accounts')
            .select('id')
            .or(`phone_number.eq.${account?.phone_number},device_fingerprint.eq.${deviceFingerprint}`)
            .eq('is_trial_used', true)
            .limit(1)
            .maybeSingle();

        const isTrialEligible = plan.name === 'Starter' && 
                                interval === 'MONTHLY' && 
                                !account?.is_trial_used && 
                                !duplicateTrial && // 🔥 DEVICE + PHONE LOCK
                                account?.subscription_status !== 'ACTIVE'
        
        const trialDays = 30;
        const startAt = isTrialEligible 
            ? Math.floor(Date.now() / 1000) + (trialDays * 24 * 60 * 60)
            : undefined;

        const subscription = await razorpay.subscriptions.create({
          plan_id: interval === 'ANNUAL' ? (plan.razorpay_plan_id_annual || plan.razorpay_plan_id) : plan.razorpay_plan_id,
          total_count: interval === 'ANNUAL' ? 10 : 60, // 10 years for annual, 5 years for monthly
          quantity: 1,
          start_at: startAt, // 🔥 Charges start after 30 days if eligible
          customer_notify: 1,
            notes: {
              user_id: user.id,
              plan_id: planId,
              type: 'subscription_mandate',
              is_trial: isTrialEligible ? 'true' : 'false',
              interval: interval,
              device_fingerprint: deviceFingerprint || null
            }
        }) as any

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
          amount: (interval === 'ANNUAL' ? (plan.price_inr_annual || plan.price_inr * 12) : plan.price_inr) * 100, 
          currency: 'INR',
          receipt: `sub_${Date.now()}`,
          notes: { 
            user_id: user.id, 
            plan_id: planId, 
            type: 'subscription',
            interval: interval 
          }
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
    
    // 🔍 EXTRACT_RAZORPAY_FAILURE_REASON
    const errorMsg = err.error?.description || err.message || err.description || "Check_Razorpay_Plan_ID";
    
    // Return structured error to UI instead of throwing (Prevents 500 Internal Server Error)
    return { 
        success: false, 
        error: `SIGNAL_FORGE_ERROR: ${errorMsg}` 
    }
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
    const errorMsg = err.error?.description || err.message || "Checkout failed";
    return { success: false, error: `PACK_TRANSFER_FAILED: ${errorMsg}` }
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
      console.error("Razorpay Sample Pack Error:", err)
      const errorMsg = err.error?.description || err.message || "Checkout failed";
      return { success: false, error: `MASTER_VAULT_FAILURE: ${errorMsg}` }
    }
}

/**
 * 🦾 Razorpay Order Action (Software Checkout)
 */
export async function purchaseSoftware(softwareId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) redirect('/auth/login?redirect=/software')
    if (!razorpay) throw new Error('Razorpay is not configured on the server')
  
    // 1. Fetch Software Details
    const { data: soft, error: softError } = await supabase.from('software_products').select('*').eq('id', softwareId).single()
    if (softError || !soft) throw new Error('Invalid software product')
  
    // 2. CREATE RAZORPAY ORDER
    try {
      const order = await razorpay.orders.create({
        amount: soft.price_inr * 100,
        currency: 'INR',
        receipt: `soft_${Date.now()}`,
        notes: { user_id: user.id, software_id: softwareId, type: 'software', software_name: soft.name }
      })
  
      return { 
          success: true, 
          orderId: order.id, 
          amount: order.amount, 
          key: process.env.RAZORPAY_KEY_ID,
          user: { email: user.email, name: user.user_metadata?.full_name || 'Producer' }
      }
    } catch (err: any) {
      console.error("Razorpay Software Error:", err)
      const errorMsg = err.error?.description || err.message || "Checkout failed";
      return { success: false, error: `SOFTWARE_SIGNAL_LOST: ${errorMsg}` }
    }
}

/**
 * ✅ Razorpay Payment Verification (High-Fidelity Handshake)
 */
export async function verifyPayment(paymentRes: any, targetId: string, itemType: 'subscription' | 'pack' | 'sample_pack' | 'software', itemId: string, interval: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') {
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

        // calculate expiry based on interval
        const nextBillingDate = new Date()
        if (interval === 'ANNUAL') {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
        } else {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
        }

        // 1. Finalize Local Membership
        const { error: accountError } = await adminSupabase
            .from('user_accounts')
            .upsert({
                user_id: user.id,
                plan_id: plan.id,
                subscription_status: 'ACTIVE', // 🟢 Explicitly activate membership
                razorpay_subscription_id: subscriptionId || null, // Link recurring signal
                next_billing: nextBillingDate.toISOString(),
                is_trial_used: true, // Consume trial eligibility
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
        
        if (accountError) throw accountError

        // 2. Inject Initial Credits (Tokens)
        // If yearly, give yearly credits up front
        const creditsToAward = interval === 'ANNUAL' 
            ? (plan.credits_annual || plan.credits_per_month * 12) 
            : plan.credits_per_month;

        await adminSupabase.rpc('add_credits', { u_id: user.id, amount: creditsToAward })

        // 3. Log Secure Audit Trail
        const finalPrice = interval === 'ANNUAL' ? (plan.price_inr_annual || plan.price_inr * 12) : plan.price_inr;

        await adminSupabase.from('credit_orders').insert({
            user_id: user.id,
            order_id: subscriptionId || orderId,
            payment_id: paymentId,
            amount_inr: finalPrice,
            credits_awarded: creditsToAward,
            status: 'paid',
            raw_response: paymentRes
        })

        // 📧 4. Send Confirmation Email
        await sendPurchaseEmail(user.id, user.email!, user.user_metadata?.full_name, plan.name, 'Premium Subscription', plan.price_inr, subscriptionId || orderId);

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

        // 📧 Send Confirmation Email
        await sendPurchaseEmail(user.id, user.email!, user.user_metadata?.full_name, pack.name, 'Credit Top-up Pack', pack.price_inr, orderId);

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

        // 📧 Send Confirmation Email With Download Link
        const links = [];
        if (pack.download_url) links.push({ label: 'Download Pack (.ZIP)', url: pack.download_url });
        await sendPurchaseEmail(user.id, user.email!, user.user_metadata?.full_name, pack.name, 'Master Sample Pack', pack.price_inr || 0, orderId, links);

    } else if (itemType === 'software') {
        const { data: soft } = await adminSupabase.from('software_products').select('*').eq('id', itemId).single()
        if (!soft) throw new Error('Software product not found')

        // 1. Grant Production License
        const { error: licenseError } = await adminSupabase.from('software_orders').upsert({
            user_id: user.id,
            user_email: user.email,
            software_name: soft.name,
            license_key: `VSX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            status: 'complete',
            amount_paid: soft.price_inr
        }, { onConflict: 'user_email,software_name' })

        if (licenseError) throw licenseError

        // 2. Double-log to Ledger
        await adminSupabase.from('credit_orders').insert({
            user_id: user.id,
            order_id: orderId,
            payment_id: paymentRes.razorpay_payment_id,
            amount_inr: soft.price_inr,
            credits_awarded: 0,
            status: 'paid',
            raw_response: paymentRes
        })

        // 📧 Send Confirmation Email with Download Links
        const links = [];
        if (soft.download_url_win) links.push({ label: 'Download for Windows', url: soft.download_url_win });
        if (soft.download_url_mac) links.push({ label: 'Download for Mac', url: soft.download_url_mac });
        await sendPurchaseEmail(user.id, user.email!, user.user_metadata?.full_name, soft.name, 'Software Perpetual License', soft.price_inr, orderId, links);
    }

    revalidatePath('/')
    revalidatePath('/pricing')
    revalidatePath('/browse')
    revalidatePath('/packs/[slug]', 'page')
    revalidateTag('browse', 'default')

    return { success: true }
}

/**
 * ⛔ Cancel Subscription (Secure High-Fidelity Termination)
 */
export async function cancelSubscription() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('UNAUTHENTICATED')

    // 🛡️ 1. Fetch the active subscription signal
    const { data: account } = await supabase
        .from('user_accounts')
        .select('razorpay_subscription_id')
        .eq('user_id', user.id)
        .single()

    // ⚡ 2. Terminal Intercept: Cancel in Razorpay if active
    if (account?.razorpay_subscription_id && razorpay) {
        try {
            // Cancel at cycle end = true (1)
            // This ensures user keeps access until their current paid period ends.
            // Note: Razorpay Node SDK signature is (subscriptionId, cancelAtCycleEnd)
            await razorpay.subscriptions.cancel(account.razorpay_subscription_id, true)
            console.log(`[RAZORPAY_TERMINATED] Signal ${account.razorpay_subscription_id} scheduled for termination.`)
        } catch (err: any) {
            console.error("[RAZORPAY_CANCEL_ERR] External signal termination failed:", err.message)
            // We continue even if Razorpay fails because local state must reflect the intent
        }
    }

    // 🛡️ 3. Master Registry Sync: Mark as CANCELED but keep plan_id for period access
    // Use Admin Client to ensure fulfillment regardless of RLS state
    const adminSupabase = getAdminClient()
    const { error } = await adminSupabase
        .from('user_accounts')
        .update({ 
            subscription_status: 'CANCELED',
            updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

    if (error) {
        console.error("[STUDIO_VAULT_ERROR] CANCEL_FAILED:", error.message)
        throw new Error('Failed to synchronize membership state.')
    }

    revalidatePath('/')
    revalidatePath('/pricing')
    revalidatePath('/profile')
    revalidateTag('browse', 'default')
    return { success: true }
}

/**
 * 🌐 PayPal Order Action (International Checkout)
 */
export async function createPayPalOrder(itemId: string, itemType: 'subscription' | 'pack' | 'sample_pack' | 'software') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // 1. Fetch Item Details & Price in USD
    let priceUsd = 0;
    let itemName = '';

    if (itemType === 'subscription') {
        const { data } = await supabase.from('subscription_plans').select('*').eq('id', itemId).single();
        priceUsd = data?.price_usd || 0;
        itemName = `Subscription: ${data?.name}`;
    } else if (itemType === 'pack') {
        const { data } = await supabase.from('credit_packs').select('*').eq('id', itemId).single();
        priceUsd = data?.price_usd || 0;
        itemName = `Credit Pack: ${data?.name}`;
    } else if (itemType === 'sample_pack') {
        const { data } = await supabase.from('sample_packs').select('*').eq('id', itemId).single();
        priceUsd = data?.price_usd || 0;
        itemName = `Sample Pack: ${data?.name}`;
    } else {
        const { data } = await supabase.from('software_products').select('*').eq('id', itemId).single();
        priceUsd = data?.price_usd || 0;
        itemName = `Software: ${data?.name}`;
    }

    if (!priceUsd) throw new Error('Invalid product or price matching failed.');

    // 2. Initialize PayPal Session
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: itemId,
                amount: {
                    currency_code: 'USD',
                    value: priceUsd.toString(),
                },
                description: itemName,
            }],
        }),
    });

    try {
        const order = await response.json();
        if (!order.id) {
            console.error("[PAYPAL_API_FAILURE]", order);
            return { success: false, error: order.message || "PayPal Session failed to initialize" };
        }
        return { success: true, orderId: order.id };
    } catch (err: any) {
        console.error("[PAYPAL_PARSE_ERROR]", err);
        return { success: false, error: "Failed to parse PayPal response" };
    }
}

/**
 * 🎯 PayPal Capture Action (Fulfillment)
 */
export async function capturePayPalOrder(orderId: string, itemId: string, itemType: 'subscription' | 'pack' | 'sample_pack' | 'software') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized');

    // 1. Capture the Payment
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const captureData = await response.json();

    if (captureData.status !== 'COMPLETED') {
        throw new Error(`PayPal Capture Failed: ${captureData.status}`);
    }

    // 2. Reuse Fulfillment Logic
    // We mock a paymentRes object to feed into the existing verification ecosystem
    const paymentRes = {
        paypal_order_id: orderId,
        paypal_capture_id: captureData.purchase_units[0].payments.captures[0].id,
        status: 'paid',
        source: 'paypal'
    };

    // Since verifyPayment currently expects Razorpay signatures, we'll call a bypass or shared fulfillment
    // For now, we'll manually fulfill to ensure credits are added immediately
    const adminSupabase = getAdminClient();

    if (itemType === 'subscription') {
        const { data: plan } = await adminSupabase.from('subscription_plans').select('*').eq('id', itemId).single();
        await adminSupabase.from('user_accounts').upsert({
            user_id: user.id,
            plan_id: plan.id,
            subscription_status: 'ACTIVE', // 🟢 Explicit activation for PayPal
            next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_trial_used: true,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        await adminSupabase.rpc('add_credits', { u_id: user.id, amount: plan.credits_per_month });
    } else if (itemType === 'pack') {
        const { data: pack } = await adminSupabase.from('credit_packs').select('*').eq('id', itemId).single();
        await adminSupabase.rpc('add_credits', { u_id: user.id, amount: pack.credits });
    }

    // Log the order
    await adminSupabase.from('credit_orders').insert({
        user_id: user.id,
        order_id: orderId,
        payment_id: paymentRes.paypal_capture_id,
        amount_inr: 0, // Should probably log amount_usd if we add that column
        credits_awarded: 0, 
        status: 'paid',
        raw_response: captureData
    });

    revalidatePath('/');
    revalidateTag('browse', 'default')
    return { success: true };
}
