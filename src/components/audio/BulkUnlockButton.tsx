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
      className="h-14 px-10 rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-2"
    >
      <Zap className="h-4 w-4 fill-black" />
      Unlock Full Pack ({cost} Credits)
    </button>
  )
}
