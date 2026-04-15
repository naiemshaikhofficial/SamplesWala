'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSubscription, purchaseCreditPack, purchaseSamplePack, purchaseSoftware, verifyPayment } from '@/app/pricing/actions'
import { Loader2, Sparkles } from 'lucide-react'
import Script from 'next/script'
import { useNotify } from '@/components/ui/NotificationProvider'
import { createClient } from '@/lib/supabase/client'
import PayPalCheckout from './payment/PayPalCheckout'

type SubscribeButtonProps = {
  planId: string
  planName: string
  isFeatured?: boolean
  mode?: 'subscription' | 'pack' | 'sample_pack' | 'software'
  disabled?: boolean
  currency?: 'INR' | 'USD'
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function SubscribeButton({ planId, planName, isFeatured, mode = 'subscription', disabled, currency = 'INR' }: SubscribeButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const { showAuthGate, showToast } = useNotify()
  const supabase = createClient()

  const handleSubscribe = async () => {
    // 🧬 AUTH CHECK
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        showAuthGate()
        return
    }

    // Razorpay Flow (INR Only)
    if (currency === 'INR') {
        setIsPending(true)
        try {
          let action;
          if (mode === 'subscription') action = createSubscription;
          else if (mode === 'pack') action = purchaseCreditPack;
          else if (mode === 'sample_pack') action = purchaseSamplePack;
          else action = purchaseSoftware;

          const orderData: any = await action(planId)
          if (!orderData.success) throw new Error('Order creation failed')

          const options: any = {
            key: orderData.key,
            name: 'Samples Wala',
            description: orderData.isTrialLink 
                ? `Free Trial · ₹5 refundable auth by Razorpay · Renews at ₹${orderData.planPrice}/mo` 
                : `Membership Activation: ${planName}`,
            handler: async function (response: any) {
                const verified = await verifyPayment(response, orderData.subscriptionId || orderData.orderId, mode, planId)
                if (verified.success) {
                    showToast(`SUCCESS: ${planName} LINKED TO YOUR NODE.`, 'success')
                    router.push('/browse')
                }
            },
            prefill: {
                name: orderData.user.name,
                email: orderData.user.email,
            },
            theme: { color: '#a6e22e' },
          }

          if (orderData.isSubscription) {
              options.subscription_id = orderData.subscriptionId;
          } else {
              options.order_id = orderData.orderId;
              options.amount = orderData.amount;
              options.currency = 'INR';
          }

          const rzp = new window.Razorpay(options)
          rzp.open()
          
        } catch (err: any) {
          showToast(err.message || 'Checkout failed. Please try again.', 'error')
        } finally {
          setIsPending(false)
        }
    }
  }

  // 🌐 International PayPal Context
  if (currency === 'USD') {
      return (
          <PayPalCheckout 
            itemId={planId} 
            itemType={mode} 
            planName={planName} 
            onSuccess={() => router.push('/browse')}
          />
      )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button 
      onClick={handleSubscribe}
      disabled={isPending || disabled}
      className={`
        relative w-full py-4 lg:py-5 rounded-xl lg:rounded-2xl text-center text-[10px] lg:text-sm font-black uppercase tracking-widest transition-all overflow-hidden group
        ${isFeatured 
          ? 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-[1.02]' 
          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
        }
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
      `}
    >
      <div className="relative z-10 flex flex-row items-center justify-center gap-3 px-4 w-full">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            <span className="leading-snug break-words">PROCESSING...</span>
          </>
        ) : (
          <>
            <Sparkles className={`h-4 w-4 shrink-0 ${isFeatured ? 'text-yellow-600' : 'text-white/20'} group-hover:animate-pulse`} />
            <span className="leading-snug break-words">{planName}</span>
          </>
        )}
      </div>

      {/* Premium Shine Effect */}
      {isFeatured && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
      )}
    </button>
    </>
  )
}
