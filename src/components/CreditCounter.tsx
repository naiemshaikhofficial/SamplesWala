'use client'

import { Zap, Diamond } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useNotify } from '@/components/ui/NotificationProvider'

export function CreditCounter() {
  const [credits, setCredits] = useState<number | null>(null)
  const [planName, setPlanName] = useState<string | null>(null)
  const supabase = createClient()
  const { showTopUpModal } = useNotify()

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
          
          const name = (data[0].subscription_plans as any)?.name
          setPlanName(name || 'Member')
        } else {
          setCredits(0)
          setPlanName('Member')
        }
      } else {
        setCredits(null)
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
    <button 
      onClick={showTopUpModal}
      className="flex items-center gap-4 px-4 py-2 bg-[#1a1a1a] border-2 border-white/5 hover:border-studio-neon transition-all group relative overflow-hidden active:scale-95 shadow-2xl"
    >
      {/* 🎰 Real-time Counter UI */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-2">
            <div className="h-6 w-6 flex items-center justify-center bg-black border border-white/10 text-studio-neon group-hover:bg-studio-neon group-hover:text-black transition-all">
                <Zap className="h-3 w-3 fill-current" />
            </div>
            <div className="flex flex-col items-start leading-none gap-1">
                <span className="text-[12px] font-black uppercase tracking-tighter text-white">
                    {credits}
                </span>
                <span className="text-[6px] font-black uppercase tracking-[0.2em] text-white/20">CREDITS</span>
            </div>
        </div>

        {planName && (
            <div className="flex flex-col items-end gap-1 pl-4 border-l border-white/10">
                <span className="text-[10px] font-black uppercase tracking-tighter text-studio-yellow italic">
                    {planName}
                </span>
                <span className="text-[6px] font-black uppercase tracking-[0.2em] text-white/10">PRODUCER_RANK</span>
            </div>
        )}
      </div>
      
      {/* Mechanical Signal (Hover) */}
      <div className="absolute right-0 top-0 h-full w-[2px] bg-studio-neon scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
    </button>
  )
}
