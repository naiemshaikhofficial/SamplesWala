'use client'

import React, { useEffect } from 'react'
import { Lock, Zap, ShieldCheck, ArrowRight, Sparkles, Music, Crown } from 'lucide-react'
import Link from 'next/link'

export function PremiumPaywall() {
  
  useEffect(() => {
    // 💾 LOCAL_STORAGE_SYNC: Mark the paywall encounter
    localStorage.setItem('sw_paywall_encountered', 'true')
  }, [])

  return (
    <div className="w-full py-20 px-4 md:px-8 flex flex-col items-center justify-center border-4 border-dashed border-studio-neon/20 bg-black/40 rounded-sm shadow-inner relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-studio-neon/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <div className="w-24 h-24 rounded-full bg-studio-neon/10 border-2 border-studio-neon flex items-center justify-center mb-8 animate-pulse shadow-[0_0_40px_rgba(166,226,46,0.2)]">
          <Crown size={40} className="text-studio-neon" />
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-white mb-6 leading-none">
          UNLEASH <span className="text-studio-neon">PREMIUM</span> POWER
        </h2>
        
        <p className="text-xl md:text-2xl font-bold text-white/60 mb-12 italic leading-tight">
          Deep browsing is reserved for our premium producers. Get unlimited access to our entire 24-bit WAV library.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
          <div className="p-4 bg-white/5 border border-white/10 flex items-center gap-4 text-left group hover:border-studio-neon transition-colors">
            <div className="w-10 h-10 rounded bg-studio-neon/10 flex items-center justify-center shrink-0">
              <Music size={18} className="text-studio-neon" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Access</p>
              <p className="text-sm font-bold text-white">Full Library Unlocked</p>
            </div>
          </div>
          
          <div className="p-4 bg-white/5 border border-white/10 flex items-center gap-4 text-left group hover:border-studio-neon transition-colors">
            <div className="w-10 h-10 rounded bg-studio-neon/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} className="text-studio-neon" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Licensing</p>
              <p className="text-sm font-bold text-white">100% Royalty Free</p>
            </div>
          </div>
        </div>

        <Link 
          href="/subscription" 
          className="group w-full md:w-auto flex items-center justify-center gap-6 px-12 py-6 bg-studio-neon text-black font-black uppercase tracking-[0.4em] italic hover:scale-105 transition-all shadow-[0_0_30px_rgba(166,226,46,0.4)]"
        >
          GET SUBSCRIPTION NOW <ArrowRight className="group-hover:translate-x-2 transition-transform" />
        </Link>
        
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">
          Signal Intercepted :: Premium Authentication Required
        </p>
      </div>
    </div>
  )
}
