'use client'

import React, { createContext, useContext, useEffect, useState, memo } from 'react'
import { createClient } from '@/lib/supabase/client'
import useSWR, { useSWRConfig } from 'swr'

type VaultContextType = {
  unlockedIds: Set<string>
  isLoading: boolean
  mutate: (key?: any, data?: any, options?: any) => Promise<any>
  unlockItem: (id: string) => void
  removeItem: (id: string) => void
  clearCache: () => void
}

const VaultContext = createContext<VaultContextType>({
  unlockedIds: new Set(),
  isLoading: true,
  mutate: async () => {},
  unlockItem: () => {},
  removeItem: () => {},
  clearCache: () => {}
})

export function VaultProvider({ children }: { children: React.ReactNode }) {
  // 🧬 STABLE_CLIENT_NODE: Memoize the singleton for dependency tracking
  const supabase = React.useMemo(() => createClient(), [])
  
  const { mutate: globalMutate } = useSWRConfig()
  const [localUnlocked, setLocalUnlocked] = useState<Set<string>>(new Set())
  const [sessionUser, setSessionUser] = useState<string | null>(null)
  
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

    const setup = async () => {
      // 🛡️ SECURITY_CHECK: Get session once and stop if no user
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return;

      if (!session?.user) {
        setSessionUser(null)
        return
      }

      const userId = session.user.id
      setSessionUser(userId)

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

    setup()
    
    return () => { 
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [supabase, globalMutate, getCacheKey])

  // 🧬 SWR_VAULT_FETCH: Use an array key including userId for stability and separation
  const { data: unlockedIds, isLoading } = useSWR(sessionUser ? ['user_vault', sessionUser] : null, async ([_, userId]) => {
    console.log(`[VAULT_SYNC] Synchronizing Artifacts for: ${userId}`);
    const { data: vaultItems, error } = await supabase
      .from('user_vault')
      .select('item_id')
      .eq('user_id', userId)

    if (error) throw error;
    if (!vaultItems) return new Set<string>()

    const ids = new Set<string>()
    vaultItems.forEach((v: any) => ids.add(v.item_id))
    return ids
  }, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // 5 minute dedupe window
    onSuccess: (newData: Set<string>) => {
        // 💾 SAVE_PERSISTENCE
        if (sessionUser && newData instanceof Set) {
            localStorage.setItem(getCacheKey(sessionUser), JSON.stringify(Array.from(newData)));
        }

        // 🛡️ PERSISTENCE_PROTECTION: Only remove from local if server definitely has it
        setLocalUnlocked(prev => {
            if (prev.size === 0) return prev;
            const next = new Set(prev)
            let changed = false
            prev.forEach(id => {
                if (newData.has(id)) {
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
    const serverSet = unlockedIds instanceof Set ? unlockedIds : new Set(unlockedIds || [])
    if (localUnlocked.size === 0) return serverSet;
    const merged = new Set(serverSet)
    localUnlocked.forEach(id => merged.add(id))
    return merged
  }, [unlockedIds, localUnlocked])

  return (
    <VaultContext.Provider value={{ 
        unlockedIds: combinedIds, 
        isLoading, 
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
