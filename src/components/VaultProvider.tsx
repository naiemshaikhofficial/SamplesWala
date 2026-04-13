'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import useSWR, { useSWRConfig } from 'swr'

type VaultContextType = {
  unlockedIds: Set<string>
  isLoading: boolean
  mutate: (key?: any, data?: any, options?: any) => Promise<any>
  unlockItem: (id: string) => void
  removeItem: (id: string) => void
}

const VaultContext = createContext<VaultContextType>({
  unlockedIds: new Set(),
  isLoading: true,
  mutate: async () => {},
  unlockItem: () => {},
  removeItem: () => {}
})

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { mutate } = useSWRConfig()
  const [localUnlocked, setLocalUnlocked] = useState<Set<string>>(new Set())
  
  // Helper to force instant UI change globally
  const unlockItem = (id: string) => {
    setLocalUnlocked(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const removeItem = (id: string) => {
    setLocalUnlocked(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }
  
  // 🧬 REALTIME_VAULT_SYNC
  useEffect(() => {
    let channel: any = null;
    
    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      channel = supabase.channel(`vault-realtime-${session.user.id}`)
        .on(
          'postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'user_vault', filter: `user_id=eq.${session.user.id}` }, 
          () => {
            console.log("[REALTIME] New item unlocked, syncing vault...");
            mutate('user_vault');
          }
        )
        .subscribe()
    }

    setup()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [supabase, mutate])

  const { data: unlockedIds, isLoading } = useSWR('user_vault', async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user;
    if (!user) return new Set<string>()

    const { data: vaultItems } = await supabase
      .from('user_vault')
      .select('item_id, item_type')
      .eq('user_id', user.id)

    if (!vaultItems) return new Set<string>()

    // Flatten all unlocked IDs (samples and IDs from packs)
    const ids = new Set<string>()
    const packIds = vaultItems.filter((v: any) => v.item_type === 'pack').map((v: any) => v.item_id)
    
    // Add direct sample IDs
    vaultItems.filter((v: any) => v.item_type === 'sample').forEach((v: any) => ids.add(v.item_id))

    // If there are packs, we might need to fetch their samples to mark them as unlocked
    // But for performance, we'll just keep the pack IDs for check
    packIds.forEach((pid: string) => ids.add(pid))

    return ids
  }, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    onSuccess: (newData: Set<string>) => {
        // 🛡️ PERSISTENCE_PROTECTION: Only remove from local if server definitely has it
        setLocalUnlocked(prev => {
            const next = new Set(prev)
            let changed = false
            prev.forEach(id => {
                if (newData.has(id)) {
                    console.log(`[VAULT_CONFIRMED] Asset ${id} now in server state. Clearing local ref.`);
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
    // Ensure we are working with a Set
    const serverSet = unlockedIds instanceof Set ? unlockedIds : new Set(unlockedIds || [])
    const merged = new Set(serverSet)
    localUnlocked.forEach(id => merged.add(id))
    return merged
  }, [unlockedIds, localUnlocked])

  return (
    <VaultContext.Provider value={{ 
        unlockedIds: combinedIds, 
        isLoading, 
        mutate,
        unlockItem,
        removeItem
    }}>
      {children}
    </VaultContext.Provider>
  )
}

export function useVault() {
  return useContext(VaultContext)
}

/**
 * Helper to check if a specific item is unlocked
 */
export function useIsUnlocked(itemId: string, packId?: string) {
  const { unlockedIds, isLoading } = useVault()
  // No loading check here for instant feel—if it's in the set, it's unlocked
  return unlockedIds.has(itemId) || (packId ? unlockedIds.has(packId) : false)
}
