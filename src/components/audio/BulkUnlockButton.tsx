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
  const { showToast, showAuthGate, showTopUpModal } = useNotify()

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
      } else {
          // 🩸 SOFT_FAIL_PROTOCOL
          if (res.error === 'INSUFFICIENT_FUNDS') {
              showToast("Insufficient credits. Opening top-up terminal...", "warning")
              showTopUpModal()
              return
          }
          showToast(res.error || 'Error unlocking bundle.', 'error')
      }
    } catch (err: any) {
      const errMsg = err.message || ""
      if (errMsg === 'Authentication required') {
          showAuthGate()
          return
      }

      if (errMsg.toLowerCase().includes('insufficient')) {
          showToast("Insufficient credits. Opening top-up terminal...", "warning")
          showTopUpModal()
          return
      }

      showToast(err.message || 'Error unlocking bundle.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleBulkUnlock}
      disabled={loading}
      className={`
        h-12 lg:h-14 px-4 lg:px-6 border-2 font-black text-[9px] lg:text-[10px] uppercase tracking-widest 
        transition-all group flex items-center justify-center gap-2 relative overflow-hidden rounded-sm w-full whitespace-nowrap
        ${needsConfirm 
          ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
          : 'border-white/20 bg-black text-white hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]'}
        ${loading ? 'opacity-80 cursor-wait' : 'active:scale-[0.98]'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
      <Zap className={`h-4 w-4 ${loading ? 'animate-spin text-white' : needsConfirm ? 'text-black animate-pulse' : 'group-hover:fill-current text-white/40'}`} />
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
