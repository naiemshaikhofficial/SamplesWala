'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSubscription, purchaseCreditPack, purchaseSamplePack, verifyPayment } from '@/app/pricing/actions'
import { Loader2, Sparkles, CreditCard } from 'lucide-react'
import Script from 'next/script'

type SubscribeButtonProps = {
  planId: string
  planName: string
  isFeatured?: boolean
  mode?: 'subscription' | 'pack' | 'sample_pack'
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function SubscribeButton({ planId, planName, isFeatured, mode = 'subscription' }: SubscribeButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    setIsPending(true)
    try {
      // 1. Create Server-Side Order
      let action;
      if (mode === 'subscription') action = createSubscription;
      else if (mode === 'pack') action = purchaseCreditPack;
      else action = purchaseSamplePack;

      const orderData = await action(planId)
      
      if (!orderData.success) throw new Error('Order creation failed')

      // 2. Open Razorpay Modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Samples Wala',
        description: `Purchase for ${planName}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
            // 3. Verify Payment on Success
            const verified = await verifyPayment(response, orderData.orderId, mode, planId)
            if (verified.success) {
                alert(`Welcome to the family! ${planName} activated.`)
                router.push('/browse')
            }
        },
        prefill: {
            name: orderData.user.name,
            email: orderData.user.email,
        },
        theme: { color: '#ffffff' },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      
    } catch (err: any) {
      alert(err.message || 'Checkout failed. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button 
      onClick={handleSubscribe}
      disabled={isPending}
      className={`
        relative w-full py-5 rounded-2xl text-center text-sm font-black uppercase tracking-widest transition-all overflow-hidden group
        ${isFeatured 
          ? 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-[1.02]' 
          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
        }
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-wait
      `}
    >
      <div className="relative z-10 flex items-center justify-center gap-3">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Sparkles className={`h-4 w-4 ${isFeatured ? 'text-yellow-600' : 'text-white/20'} group-hover:animate-pulse`} />
            <span>Get {planName}</span>
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
