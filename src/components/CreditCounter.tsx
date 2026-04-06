'use client'

import { Zap, Diamond } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function CreditCounter() {
  const [credits, setCredits] = useState<number | null>(null)
  const [planName, setPlanName] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCredits = useCallback(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
            .from('user_subscriptions')
            .select(`
                current_credits, 
                subscription_plans(name)
            `)
            .eq('user_id', user.id)
            
        if (data && data.length > 0) {
          const total = data.reduce((acc: number, row: any) => acc + (row.current_credits || 0), 0)
          setCredits(total)
          
          // Get the most significant plan name (if multiple)
          const name = (data[0].subscription_plans as any)?.name
          setPlanName(name || 'Member')
        }
      }
  }, [supabase])

  useEffect(() => {
    fetchCredits()

    // 🚀 MASTER REAL-TIME SYNC
    const channel = supabase
      .channel('credit-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_subscriptions' },
        () => fetchCredits()
      )
      .subscribe()

    const onManualRefresh = () => fetchCredits();
    window.addEventListener('refresh-credits', onManualRefresh);

    return () => { 
        supabase.removeChannel(channel) 
        window.removeEventListener('refresh-credits', onManualRefresh);
    }
  }, [supabase, fetchCredits])

  if (credits === null) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group overflow-hidden relative">
      {/* Premium Glow Aura */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700 ${planName === 'Producer' ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`} />
      
      {/* 🎰 Real-time Counter UI */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-2">
            <Diamond className={`h-3.5 w-3.5 fill-blue-500 text-blue-500 animate-pulse`} />
            <span className="text-[10px] font-black uppercase tracking-tighter text-white flex items-center gap-1.5">
                {credits}
                <span className="text-[8px] text-white/30 tracking-widest font-normal italic lowercase">Credits</span>
            </span>
        </div>

        {planName && (
            <div className="flex items-center gap-1 pl-3 border-l border-white/10">
                <div className={`h-1 w-1 rounded-full animate-ping ${planName === 'Producer' ? 'bg-emerald-500' : 'bg-white/40'}`} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{planName}</span>
            </div>
        )}
      </div>
      
      {/* Success Sparkle Effect */}
      <div key={credits} className="absolute inset-0 bg-white/10 animate-ping opacity-0 pointer-events-none" />
    </div>
  )
}
