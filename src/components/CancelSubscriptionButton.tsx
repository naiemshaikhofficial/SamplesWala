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
    <button 
        onClick={handleCancel}
        disabled={isPending}
        className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-red-500 transition-all flex items-center gap-2 mt-4 group"
    >
        {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
            <ShieldAlert className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        Relinquish Membership — सदस्यता रद्द करें
    </button>
  )
}
