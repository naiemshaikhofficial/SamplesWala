'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import useSWR, { useSWRConfig } from 'swr'

type VaultContextType = {
  unlockedIds: Set<string>
  isLoading: boolean
  mutate: (data?: any, options?: any) => Promise<any>
}

const VaultContext = createContext<VaultContextType>({
  unlockedIds: new Set(),
  isLoading: true,
  mutate: async () => {}
})

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { mutate } = useSWRConfig()
  
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
    dedupingInterval: 60000 // 1 minute
  })

  return (
    <VaultContext.Provider value={{ unlockedIds: unlockedIds || new Set(), isLoading, mutate }}>
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
  if (isLoading) return false
  return unlockedIds.has(itemId) || (packId ? unlockedIds.has(packId) : false)
}
