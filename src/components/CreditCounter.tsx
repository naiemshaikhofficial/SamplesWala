'use client'

import { Zap } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useNotify } from '@/components/ui/NotificationProvider'

export function CreditCounter() {
  const [data, setData] = useState<{ credits: number, plan: string } | null>(null)
  const supabase = createClient()
  const { showTopUpModal } = useNotify()

  const syncState = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 📀 FETCH INTEGRATED STATE (Credits + Active Subscription from User Node)
      const { data: account, error } = await supabase
          .from('user_accounts')
          .select('credits, subscription_plans(name)')
          .eq('user_id', user.id)
          .maybeSingle()

      if (error) throw error

      const credits = account?.credits ?? 0
      const planName = (account?.subscription_plans as any)?.name || 'FREE'

      setData({ 
          credits: credits, 
          plan: planName.toUpperCase() 
      });
      
    } catch (err) {
      console.error("[CREDIT_SYNC_CRITICAL]", err)
    }
  }, [supabase])

  useEffect(() => {
    let activeChannel: any = null;

    const setupRealtime = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        syncState()

        // 🧬 DYNAMIC_SIGNAL_ISOLATION (Force fresh channel via timestamp)
        activeChannel = supabase.channel(`acc-sync-${user.id}-${Date.now()}`)
          .on(
            'postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'user_accounts',
              filter: `user_id=eq.${user.id}`
            }, 
            () => syncState()
          )
        
        // 📡 Subscribe after setup
        activeChannel.subscribe()
    }

    setupRealtime()

    const onManualRefresh = () => syncState();
    window.addEventListener('refresh-credits', onManualRefresh);

    return () => { 
        if (activeChannel) supabase.removeChannel(activeChannel) 
        window.removeEventListener('refresh-credits', onManualRefresh);
    }
  }, [supabase, syncState])

  if (!data) return null

  const formatCredits = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  return (
    <button 
      onClick={showTopUpModal} 
      className="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-1.5 md:py-2 bg-[#1a1a1a] border-2 border-white/5 hover:border-studio-neon transition-all group active:scale-95 shadow-2xl rounded-sm"
    >
      <div className="flex items-center gap-2 md:gap-4 relative z-10">
        <div className="flex items-center gap-2">
            <div className="h-5 w-5 md:h-6 md:w-6 flex items-center justify-center bg-black border border-white/10 text-studio-neon group-hover:bg-studio-neon group-hover:text-black transition-all">
                <Zap className="h-3 w-3 fill-current" />
            </div>
            <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="text-[10px] md:text-[14px] font-black tracking-tighter text-white truncate max-w-[50px] md:max-w-none">
                    {formatCredits(data.credits)}
                </span>
                <span className="text-[5px] md:text-[6px] font-black uppercase tracking-[0.2em] text-white/20">CREDITS</span>
            </div>
        </div>

        <div className="flex flex-col items-end pl-2 md:pl-4 border-l border-white/10 gap-0.5">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter text-studio-yellow italic truncate max-w-[40px] md:max-w-none">{data.plan}</span>
            <span className="text-[5px] md:text-[6px] font-black uppercase tracking-[0.2em] text-white/10 hidden xs:block">MODE</span>
        </div>
      </div>

      
      {/* Visual active signal marker */}
      <div className="absolute right-0 top-0 h-full w-[2px] bg-studio-neon scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
    </button>
  )
}
