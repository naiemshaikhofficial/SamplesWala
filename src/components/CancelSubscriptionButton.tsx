'use client'

import React, { useState } from 'react'
import { cancelSubscription } from '@/app/pricing/actions'
import { Loader2, ShieldAlert } from 'lucide-react'

export function CancelSubscriptionButton() {
  const [isPending, setIsPending] = useState(false)

  const handleCancel = async () => {
    if (!confirm('ARE YOU SURE YOU WANT TO RELINQUISH YOUR MEMBERSHIP? YOU WILL LOSE ACCESS TO MONTHLY REFILLS.')) {
        return
    }

    setIsPending(true)
    try {
        const res = await cancelSubscription()
        if (res.success) {
            alert('Membership relinquished. Access will remain until the end of your billing cycle.')
        }
    } catch (err: any) {
        alert(err.message || 'Operation failed')
    } finally {
        setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
        <button 
            onClick={handleCancel}
            disabled={isPending}
            className="w-full py-4 bg-red-950/20 border border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 group relative overflow-hidden group/cancel shadow-2xl rounded-sm"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/cancel:translate-x-full transition-transform duration-1000" />
            
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
                <ShieldAlert className="h-4 w-4 group-hover/cancel:scale-125 transition-transform" />
            )}
            
            <span className="relative z-10">
                {isPending ? 'TERMINATING_SIGNAL...' : 'CANCEL_SUBSCRIPTION — सदस्यता रद्द करें'}
            </span>
        </button>
        
        <p className="text-[8px] font-black uppercase tracking-widest text-white/10 text-center px-4 leading-relaxed">
            * ACCESS REMAINS ACTIVE UNTIL THE CURRENT BILLING CYCLE TERMINATES.
        </p>
    </div>
  )
}
