'use client'

import React, { createContext, useContext, useEffect, useState, memo } from 'react'
import { createClient } from '@/lib/supabase/client'
import useSWR, { useSWRConfig } from 'swr'
import { useAuth } from '@/components/providers/AuthProvider'

type VaultContextType = {
  unlockedIds: Set<string>
  isLoading: boolean
  isSubscribed: boolean
  subscriptionPlan: string | null
  mutate: (key?: any, data?: any, options?: any) => Promise<any>
  unlockItem: (id: string) => void
  removeItem: (id: string) => void
  clearCache: () => void
}

const VaultContext = createContext<VaultContextType>({
  unlockedIds: new Set(),
  isLoading: true,
  isSubscribed: false,
  subscriptionPlan: null,
  mutate: async () => {},
  unlockItem: () => {},
  removeItem: () => {},
  clearCache: () => {}
})

export function VaultProvider({ children }: { children: React.ReactNode }) {
  // 🧬 STABLE_CLIENT_NODE: Memoize the singleton for dependency tracking
  const supabase = React.useMemo(() => createClient(), [])
  
  const { user } = useAuth()
  const { mutate: globalMutate } = useSWRConfig()
  const [localUnlocked, setLocalUnlocked] = useState<Set<string>>(new Set())
  const sessionUser = user?.id || null;
  
  // 🧬 PERSISTENCE_CACHE_KEY
  const getCacheKey = React.useCallback((userId: string) => `studio_vault_cache_${userId}`, []);

  // Helper to force instant UI change globally
  const unlockItem = React.useCallback((id: string) => {
    setLocalUnlocked(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const removeItem = React.useCallback((id: string) => {
    setLocalUnlocked(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const clearCache = React.useCallback(() => {
      if (sessionUser) {
          localStorage.removeItem(getCacheKey(sessionUser));
          setLocalUnlocked(new Set());
          globalMutate(['user_vault', sessionUser], new Set(), false);
      }
  }, [sessionUser, getCacheKey, globalMutate])
  
  // 🧬 REALTIME_VAULT_SYNC
  const channelRef = React.useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const setupRealtime = async () => {
      if (!user) return;

      const userId = user.id

      // 📥 LOAD_PERSISTENCE (Offline-First Start)
      try {
        const cached = localStorage.getItem(getCacheKey(userId))
        if (cached) {
          const ids = JSON.parse(cached)
          const set = new Set(Array.isArray(ids) ? ids : [])
          if (set.size > 0) {
            globalMutate(['user_vault', userId], set, false)
          }
        }
      } catch (e) {
        console.error("[VAULT_CACHE_ERROR] Hydration failed", e)
      }
      
      // 🛡️ CLEANUP_PREVIOUS: Remove existing channel if any
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      // 📡 INITIATE_REALTIME: Chain events BEFORE subscribe
      channelRef.current = supabase.channel(`vault-realtime-${userId}`)
        .on(
          'postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'user_vault', filter: `user_id=eq.${userId}` }, 
          () => {
            console.log("[REALTIME] New item unlocked, syncing vault...");
            globalMutate(['user_vault', userId]);
          }
        )
        .subscribe()
    }

    setupRealtime()
    
    return () => { 
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [supabase, globalMutate, getCacheKey, user])

  // 🧬 SWR_VAULT_FETCH: Use an array key including userId for stability and separation
  const { data: vaultData, isLoading } = useSWR(sessionUser ? ['user_vault', sessionUser] : null, async ([_, userId]) => {
    // 🛡️ BATCH_LOGIC: Fetching both vault items and account status in parallel
    const [vaultRes, accountRes] = await Promise.all([
        supabase.from('user_vault').select('item_id').eq('user_id', userId),
        supabase.from('user_accounts').select('plan_id, subscription_status, subscription_plans(name)').eq('user_id', userId).single()
    ]);

    if (vaultRes.error) throw vaultRes.error;

    // 🛡️ A user is considered subscribed if they have a plan AND status is not 'INACTIVE'
    const isSubscribed = accountRes.data?.plan_id ? (accountRes.data.subscription_status !== 'INACTIVE') : false;

    const ids = new Set<string>()
    if (vaultRes.data) {
        vaultRes.data.forEach((v: any) => ids.add(v.item_id))
    }

    return { 
        ids, 
        isSubscribed, 
        subscriptionPlan: (accountRes.data?.subscription_plans as any)?.name || null 
    }
  }, {
    revalidateOnFocus: false, // 🛑 Disable re-fetch on window focus to save DB requests
    revalidateOnReconnect: true,
    refreshInterval: 0, // 🛑 No polling
    dedupingInterval: 600000, // 10 minute dedupe window for identical requests
    onSuccess: (newData: any) => {
        // 💾 SAVE_PERSISTENCE
        if (sessionUser && newData.ids instanceof Set) {
            localStorage.setItem(getCacheKey(sessionUser), JSON.stringify(Array.from(newData.ids)));
        }

        // 🛡️ PERSISTENCE_PROTECTION: Only remove from local if server definitely has it
        setLocalUnlocked(prev => {
            if (prev.size === 0) return prev;
            const next = new Set(prev)
            let changed = false
            prev.forEach(id => {
                if (newData.ids.has(id)) {
                    next.delete(id)
                    changed = true
                }
            })
            return changed ? next : prev
        })
    }
  })

  // 🧬 MERGE_SOURCES: Combined Ground Truth + Optimistic Local
  const combinedIds = React.useMemo(() => {
    const serverSet = vaultData?.ids instanceof Set ? vaultData.ids : new Set(vaultData?.ids || [])
    if (localUnlocked.size === 0) return serverSet;
    const merged = new Set(serverSet)
    localUnlocked.forEach(id => merged.add(id))
    return merged
  }, [vaultData?.ids, localUnlocked])

  return (
    <VaultContext.Provider value={{ 
        unlockedIds: combinedIds, 
        isLoading, 
        isSubscribed: vaultData?.isSubscribed || false,
        subscriptionPlan: vaultData?.subscriptionPlan || null,
        mutate: globalMutate,
        unlockItem,
        removeItem,
        clearCache
    }}>
      {children}
    </VaultContext.Provider>
  )
}

export function useVault() {
  const context = useContext(VaultContext)
  if (!context) throw new Error('useVault must be used within VaultProvider')
  return context
}

/**
 * Helper to check if a specific item is unlocked
 */
export function useIsUnlocked(itemId: string, packId?: string) {
  const { unlockedIds } = useVault()
  return unlockedIds.has(itemId) || (packId ? unlockedIds.has(packId) : false)
}
