'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSubscription, purchaseCreditPack, purchaseSamplePack, purchaseSoftware, verifyPayment } from '@/app/subscription/actions'
import { Loader2, Sparkles } from 'lucide-react'
import Script from 'next/script'
import { useNotify } from '@/components/ui/NotificationProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import PayPalCheckout from './payment/PayPalCheckout'
import { triggerTrustpilotInvitation } from '@/lib/trustpilot'

type SubscribeButtonProps = {
  planId: string
  planName: string
  isFeatured?: boolean
  mode?: 'subscription' | 'pack' | 'sample_pack' | 'software'
  disabled?: boolean
  currency?: 'INR' | 'USD'
  hasActiveSubscription?: boolean
  variant?: 'neon' | 'white' | 'ghost'
  fullWidth?: boolean
  className?: string
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function SubscribeButton({ 
  planId, 
  planName, 
  isFeatured, 
  mode = 'subscription', 
  disabled, 
  currency = 'INR', 
  hasActiveSubscription,
  variant = 'neon',
  fullWidth = true,
  className = ''
}: SubscribeButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const { showAuthGate, showToast } = useNotify()
  const { user } = useAuth()

  const handleSubscribe = async () => {
    // 🧬 AUTH CHECK
    if (!user) {
        showAuthGate()
        return
    }

    // ⛔ ENFORCE: No Credits without Active Subscription
    if (mode === 'pack' && !hasActiveSubscription) {
        showToast('Active Subscription Required for Credit Packs.', 'error')
        // Option: Smooth scroll to subscription section
        const subSection = document.getElementById('subscription-plans')
        if (subSection) subSection.scrollIntoView({ behavior: 'smooth' })
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
        relative ${fullWidth ? 'w-full' : ''} h-12 lg:h-14 rounded-sm text-center text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden group whitespace-nowrap px-4
        ${variant === 'neon' || isFeatured
          ? 'bg-studio-neon text-black hover:shadow-[0_0_30px_rgba(166,226,46,0.4)] hover:scale-[1.02]' 
          : variant === 'white'
          ? 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02]'
          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white'
        }
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
        ${className}
      `}
    >
      <div className="relative z-10 flex flex-row items-center justify-center gap-3 px-4 w-full">
        <Sparkles className={`h-4 w-4 shrink-0 ${variant === 'neon' || variant === 'white' || isFeatured ? 'text-black/40' : 'text-white/20'} group-hover:animate-pulse`} />
        <span className="leading-snug">{planName}</span>
      </div>

      {(variant === 'neon' || isFeatured) && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
      )}
    </button>
  )
}
