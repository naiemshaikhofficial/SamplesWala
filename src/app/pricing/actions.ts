'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { Resend } from 'resend'
import { generateInvoicePDF } from '@/lib/pdfGenerator'

// 📧 INITIALIZE RESEND
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// 🟢 INTERNAL EMAIL SENDER / INVOICE DISPATCH
async function sendPurchaseEmail(email: string, name: string, itemName: string, itemType: string, amountPaid: number, orderId: string, downloadUrls?: {label: string, url: string}[]) {
    if (!resend) {
        console.log('[EMAIL_SYSTEM] RESEND_API_KEY missing. Skipping email for:', email);
        return;
    }

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1a1a1a;">
            
            <!-- HEADER WITH LOGO -->
            <div style="text-align: center; border-bottom: 1px dashed #333; padding-bottom: 25px; margin-bottom: 30px;">
                <img src="https://imagizer.imageshack.com/img924/3983/vzoEZd.png" alt="SamplesWala Root" style="height: 55px; margin-bottom: 15px;" />
                <h1 style="color: #a6e22e; font-style: italic; font-weight: 900; text-transform: uppercase; margin: 0; font-size: 20px; letter-spacing: 2px;">Auto-Generated Invoice</h1>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">Hey ${name || 'Producer'},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">
                Your payment was successfully processed. Access to <strong>${itemName}</strong> is now securely linked to your profile. Please keep this invoice for your financial records.
            </p>

            <div style="background-color: #111; padding: 25px; border-radius: 8px; border: 1px solid #222; margin: 30px 0;">
                <p style="margin: 0 0 20px 0; font-size: 14px; font-weight: bold; color: #a6e22e; text-transform: uppercase; letter-spacing: 1px;">Order Information</p>
                
                <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 14px;">
                    <tr>
                        <td style="padding: 10px 0; color: #888;">Order ID:</td>
                        <td style="padding: 10px 0; text-align: right; color: #fff; font-weight: bold;">${orderId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #888;">Date of Issue:</td>
                        <td style="padding: 10px 0; text-align: right; color: #fff;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #888;">Product Identity:</td>
                        <td style="padding: 10px 0; text-align: right; color: #fff;">${itemName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #888;">License Format:</td>
                        <td style="padding: 10px 0; text-align: right; color: #fff;">${itemType}</td>
                    </tr>
                    <tr style="border-top: 1px dashed #333;">
                        <td style="padding: 15px 0 0 0; font-weight: 900; color: #a6e22e; font-size: 16px; text-transform: uppercase;">Total Paid</td>
                        <td style="padding: 15px 0 0 0; text-align: right; font-weight: 900; color: #a6e22e; font-size: 16px;">₹${amountPaid}</td>
                    </tr>
                </table>
            </div>

            ${downloadUrls && downloadUrls.length > 0 ? `
            <div style="background-color: #0a0a0a; border: 1px solid #222; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: bold; color: #a6e22e; text-transform: uppercase;">Direct Download Links</p>
                ${downloadUrls.map(link => `
                    <a href="${link.url}" style="display: block; background-color: #111; color: #fff; text-decoration: none; padding: 12px 20px; border: 1px solid #333; margin-bottom: 10px; border-radius: 4px; font-weight: bold; text-align: center;">
                        ⬇️ ${link.label}
                    </a>
                `).join('')}
            </div>
            ` : ''}

            <p style="font-size: 16px; margin-bottom: 30px; line-height: 1.5; text-align: center;">
                You can also access your assets anytime directly from your dashboard.
            </p>

            <div style="margin-bottom: 40px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://sampleswala.com'}/profile" style="display: inline-block; background-color: #a6e22e; color: #000; text-decoration: none; padding: 16px 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border-radius: 4px; font-size: 14px;">Access Library</a>
            </div>

            <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 40px 0 30px 0;">
            
            <!-- EXCLUSIVE FOOTER -->
            <div style="text-align: center;">
                <p style="font-size: 14px; color: #aaa; line-height: 1.5; margin: 0 0 15px 0;">
                    Need help? Contact us: <a href="mailto:Support@Sampleswala.com" style="color: #a6e22e; text-decoration: none; font-weight: bold;">Support@Sampleswala.com</a>
                </p>
                
                <div style="margin: 25px 0;">
                    <a href="https://instagram.com/SamplesWala" style="color: #fff; text-decoration: none; margin: 0 12px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">📷 @SamplesWala</a>
                    <a href="https://twitter.com/SamplesWala" style="color: #fff; text-decoration: none; margin: 0 12px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">🐦 @SamplesWala</a>
                    <a href="https://youtube.com/@SamplesWala" style="color: #fff; text-decoration: none; margin: 0 12px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">📺 @SamplesWala</a>
                </div>
                
                <p style="font-size: 10px; color: #444; line-height: 1.6; margin: 30px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">
                    This is a computer-generated tax invoice and requires no physical signature.<br>
                    Generated securely by the Samples Wala Payment Network.
                </p>
            </div>

        </div>
    `;

    try {
        const pdfBase64 = await generateInvoicePDF(
            orderId, 
            name || 'Producer', 
            itemName, 
            itemType, 
            amountPaid, 
            new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        );

        await resend.emails.send({
            from: 'SamplesWala <info@sampleswala.com>',
            to: email,
            subject: `Invoice: ${itemName} | SamplesWala`,
            html: html,
            attachments: [
                {
                    filename: `Invoice_${orderId}.pdf`,
                    content: pdfBase64,
                }
            ]
        });
        console.log(`[EMAIL_SENT] Invoice sent to: ${email} for ${itemName}`);
    } catch (e) {
        console.error('[EMAIL_FAILED]', e);
    }
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
    // 🔍 ENHANCED_DIAGNOSTICS: Razorpay sometimes uses 'description'
    const errorMsg = err.message || err.description || "Check_Razorpay_Plan_ID";
    throw new Error(`Failed to initiate ${plan.razorpay_plan_id ? 'mandate' : 'order'}: ${errorMsg}`)
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
      throw new Error('Failed to start checkout. Check your API keys.')
    }
}

/**
 * ✅ Razorpay Payment Verification (High-Fidelity Handshake)
 */
export async function verifyPayment(paymentRes: any, targetId: string, itemType: 'subscription' | 'pack' | 'sample_pack' | 'software', itemId: string) {
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

        // 📧 4. Send Confirmation Email
        await sendPurchaseEmail(user.email!, user.user_metadata?.full_name, plan.name, 'Premium Subscription', plan.price_inr, subscriptionId || orderId);

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
        await sendPurchaseEmail(user.email!, user.user_metadata?.full_name, pack.name, 'Credit Top-up Pack', pack.price_inr, orderId);

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
        await sendPurchaseEmail(user.email!, user.user_metadata?.full_name, pack.name, 'Master Sample Pack', pack.price_inr || 0, orderId, links);

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
        await sendPurchaseEmail(user.email!, user.user_metadata?.full_name, soft.name, 'Software Perpetual License', soft.price_inr, orderId, links);
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
