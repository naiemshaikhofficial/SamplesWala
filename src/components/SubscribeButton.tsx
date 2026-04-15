'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSubscription, purchaseCreditPack, purchaseSamplePack, purchaseSoftware, verifyPayment } from '@/app/pricing/actions'
import { Loader2, Sparkles } from 'lucide-react'
import Script from 'next/script'
import { useNotify } from '@/components/ui/NotificationProvider'
import { createClient } from '@/lib/supabase/client'
import PayPalCheckout from './payment/PayPalCheckout'
import { triggerTrustpilotInvitation } from '@/lib/trustpilot'

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

    const params = new URLSearchParams()
    if (mode === 'subscription') params.set('planId', planId)
    else params.set('packId', planId)
    params.set('mode', mode)
    
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <button 
      onClick={handleSubscribe}
      disabled={disabled}
      className={`
        relative w-full py-4 lg:py-5 rounded-xl lg:rounded-2xl text-center text-[10px] lg:text-sm font-black uppercase tracking-widest transition-all overflow-hidden group
        ${isFeatured 
          ? 'bg-studio-neon text-black hover:shadow-[0_0_30px_rgba(166,226,46,0.4)] hover:scale-[1.02]' 
          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white'
        }
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
      `}
    >
      <div className="relative z-10 flex flex-row items-center justify-center gap-3 px-4 w-full">
        <Sparkles className={`h-4 w-4 shrink-0 ${isFeatured ? 'text-black/40' : 'text-white/20'} group-hover:animate-pulse`} />
        <span className="leading-snug">{planName}</span>
      </div>

      {isFeatured && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
      )}
    </button>
  )
}
