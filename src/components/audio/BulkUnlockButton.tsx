'use client'
import { Zap } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { unlockFullPack } from '@/app/packs/[slug]/actions'
import { useNotify } from '@/components/ui/NotificationProvider'

export function BulkUnlockButton({ packId, cost }: { packId: string, cost: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast, showConfirm, showAuthGate } = useNotify()

  const handleBulkUnlock = async () => {
    // 🛡️ PREMIUM CONFIRMATION SYSTEM
    const confirmed = await showConfirm(`Are you sure you want to consume ${cost} credits to unlock this entire collection permanently?`)
    if (!confirmed) return;

    try {
      setLoading(true)
      const res = await unlockFullPack(packId)
      if (res.success) {
          showToast('ACCESS GRANTED: Full Pack Unlocked!', 'success')
          setTimeout(() => router.refresh(), 1000)
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
        h-12 lg:h-14 px-8 lg:px-10 border-2 border-studio-yellow/40 bg-black/80 text-white font-black text-[9px] lg:text-[10px] uppercase tracking-widest 
        hover:bg-studio-yellow hover:text-black hover:border-studio-yellow hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] 
        active:scale-[0.98] transition-all group flex items-center justify-center gap-3 relative overflow-hidden rounded-sm w-full
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
      <Zap className={`h-4 w-4 ${loading ? 'animate-pulse' : 'group-hover:fill-current'}`} />
      <span>{loading ? 'CALCULATING...' : `UNLOCK WITH CREDITS (${cost})`}</span>
    </button>
  )
}
