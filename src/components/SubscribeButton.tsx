'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSubscription } from '@/app/pricing/actions'
import { Loader2, Sparkles } from 'lucide-react'

type SubscribeButtonProps = {
  planId: string
  planName: string
  isFeatured?: boolean
}

export function SubscribeButton({ planId, planName, isFeatured }: SubscribeButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    setIsPending(true)
    try {
      const result = await createSubscription(planId)
      if (result.success) {
        alert(result.message)
        router.push('/browse')
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
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
  )
}
