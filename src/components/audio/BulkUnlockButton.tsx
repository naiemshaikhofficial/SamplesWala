'use client'
import { Zap } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { unlockFullPack } from '@/app/packs/[slug]/actions'
import { useNotify } from '@/components/ui/NotificationProvider'
import { useSWRConfig } from 'swr'
import { useVault } from '@/components/VaultProvider'

export function BulkUnlockButton({ packId, cost }: { packId: string, cost: number }) {
  const [loading, setLoading] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { unlockItem } = useVault()
  const { showToast, showAuthGate } = useNotify()

  const handleBulkUnlock = async () => {
    // 🛡️ DOUBLE-CLICK CONFIRMATION SYSTEM (Same as Individual Samples)
    if (!needsConfirm) {
        setNeedsConfirm(true)
        setTimeout(() => setNeedsConfirm(false), 3000)
        return
    }

    try {
      setLoading(true)
      setNeedsConfirm(false)
      const res = await unlockFullPack(packId)
      if (res.success) {
          // 🧬 OPTIMISTIC_UNLOCK: Force UI to update at 0ms
          unlockItem(packId)
          
          // 💉 CACHE_INJECTION: Manually update SWR cache to prevent "relocking" glitch
          mutate('user_vault', (current: any) => {
              const next = new Set(current instanceof Set ? current : (current || []))
              next.add(packId)
              return next
          }, false)

          showToast('ACCESS GRANTED: Full Pack Unlocked!', 'success')
          window.dispatchEvent(new Event('refresh-credits'))
          
          // Delay server sync slightly to ensure DB replication is complete
          setTimeout(() => {
            mutate('user_vault')
            router.refresh()
          }, 2000)
      }
    } catch (err: any) {
      if (err.message === 'Authentication required') {
          showAuthGate()
          return
      }
      alert(err.message || 'Error unlocking bundle.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleBulkUnlock}
      disabled={loading}
      className={`
        h-12 lg:h-14 px-8 lg:px-10 border-2 font-black text-[9px] lg:text-[10px] uppercase tracking-widest 
        transition-all group flex items-center justify-center gap-3 relative overflow-hidden rounded-sm w-full
        ${needsConfirm 
          ? 'bg-black text-studio-neon border-studio-neon shadow-[0_0_20px_#a6e22e33]' 
          : 'border-studio-yellow/40 bg-black/80 text-white hover:bg-studio-yellow hover:text-black hover:border-studio-yellow hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]'}
        ${loading ? 'opacity-80 cursor-wait' : 'active:scale-[0.98]'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
      <Zap className={`h-4 w-4 ${loading ? 'animate-spin text-studio-yellow' : needsConfirm ? 'text-studio-neon animate-pulse' : 'group-hover:fill-current'}`} />
      <span>
        {loading 
          ? 'UNLOCKING...' 
          : needsConfirm 
            ? 'CONFIRM UNLOCK?' 
            : `UNLOCK WITH CREDITS (${cost})`}
      </span>
    </button>
  )
}
