'use client'
import React, { useEffect } from 'react'
import { Lock } from 'lucide-react'
import Link from 'next/link'

export function PremiumPaywall({ totalSamples }: { totalSamples?: number }) {
  
  useEffect(() => {
    // 💾 LOCAL_STORAGE_SYNC: Mark the paywall encounter
    localStorage.setItem('sw_paywall_encountered', 'true')
  }, [])

  return (
    <div className="w-full py-12 px-6 flex flex-col items-center justify-center relative">
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        
        {totalSamples && totalSamples > 0 && (
          <p className="text-[11px] md:text-sm font-bold text-white/40 mb-6 uppercase tracking-[0.2em]">
            + {totalSamples.toLocaleString()} MORE SAMPLES
          </p>
        )}

        <Link 
          href="/subscription" 
          className="group flex items-center justify-center gap-3 px-8 py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-studio-neon transition-all rounded-md shadow-2xl"
        >
          <Lock size={14} className="mb-0.5" />
          Subscribe for full access
        </Link>
        
    
      </div>
    </div>
  )
}
