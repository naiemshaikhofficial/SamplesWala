'use client'

import { Zap } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useNotify } from '@/components/ui/NotificationProvider'
import { useAuth } from '@/components/providers/AuthProvider'

export function CreditCounter() {
  const { user } = useAuth()
  const [data, setData] = useState<{ credits: number, plan: string } | null>(null)
  const supabase = createClient()
  const { showTopUpModal } = useNotify()
  
  const syncState = useCallback(async () => {
    try {
      if (!user) return

      // 📀 FETCH INTEGRATED STATE (Credits + Active Subscription from User Node)
      const { data: account, error } = await supabase
          .from('user_accounts')
          .select('credits, subscription_status, subscription_plans(name)')
          .eq('user_id', user.id)
          .maybeSingle()

      if (error) throw error

      const credits = account?.credits ?? 0
      const planName = (account?.subscription_plans as any)?.name || 'FREE'
      const status = account?.subscription_status || 'INACTIVE'
      
      const { isUserAdmin } = await import('@/lib/utils/admin');
      const isAdmin = isUserAdmin(user as any);

      // 🛡️ Determine final display plan based on status and admin privilege
      const finalPlan = (isAdmin || status !== 'INACTIVE') ? planName.toUpperCase() : 'FREE'

      setData({ 
          credits: credits, 
          plan: finalPlan
      });
      
    } catch (err) {
      console.error("[CREDIT_SYNC_CRITICAL]", err)
    }
  }, [supabase, user])

  useEffect(() => {
    let isMounted = true;
    let activeChannel: any = null;

    const setupRealtime = async () => {
        if (!user || !isMounted) return

        syncState()

        // 🧬 DYNAMIC_SIGNAL_ISOLATION (Unique channel per mount to avoid Strict Mode reuse errors)
        const channelId = `acc-sync-${user.id}-${Math.random().toString(36).substring(7)}`
        activeChannel = supabase.channel(channelId)
          .on(
            'postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'user_accounts',
              filter: `user_id=eq.${user.id}`
            }, 
            () => { if (isMounted) syncState(); }
          )
        
        // 📡 Subscribe after setup
        activeChannel.subscribe()
    }

    setupRealtime()

    const onManualRefresh = () => {
        syncState();
        // Retry once after 500ms to be 100% sure we get the latest DB state
        setTimeout(syncState, 500);
    };
    window.addEventListener('refresh-credits', onManualRefresh);

    return () => { 
        isMounted = false;
        if (activeChannel) supabase.removeChannel(activeChannel) 
        window.removeEventListener('refresh-credits', onManualRefresh);
    }
  }, [supabase, syncState, user])

  if (!data || data.plan === 'FREE') return null

  return (
    <button 
      onClick={showTopUpModal} 
      className="flex items-center gap-4 px-4 py-2 bg-[#1a1a1a] border-2 border-white/5 hover:border-studio-neon transition-all group active:scale-95 shadow-2xl rounded-sm"
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-2">
            <div className="h-6 w-6 flex items-center justify-center bg-black border border-white/10 text-studio-neon group-hover:bg-studio-neon group-hover:text-black transition-all">
                <Zap className="h-3 w-3 fill-current" />
            </div>
            <div className="flex flex-col items-start leading-none gap-1">
                <span className="text-[12px] font-black tracking-tighter text-white">{data.credits}</span>
                <span className="text-[6px] font-black uppercase tracking-[0.2em] text-white/20">CREDITS</span>
            </div>
        </div>

        <div className="flex flex-col items-end pl-4 border-l border-white/10 gap-1">
            <span className="text-[10px] font-black uppercase tracking-tighter text-studio-yellow italic">{data.plan}</span>
            <span className="text-[6px] font-black uppercase tracking-[0.2em] text-white/10">NODE_STATUS</span>
        </div>
      </div>
      
      {/* Visual active signal marker */}
      <div className="absolute right-0 top-0 h-full w-[2px] bg-studio-neon scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
    </button>
  )
}
