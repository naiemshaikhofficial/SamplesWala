'use client'
import { Zap, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { unlockFullPack } from '@/app/packs/[slug]/actions'

export function BulkUnlockButton({ packId, cost }: { packId: string, cost: number }) {
  const [loading, setLoading] = useState(false)

  const handleBulkUnlock = async () => {
    try {
      setLoading(true)
      const res = await unlockFullPack(packId)
      if (res.success) alert('Full Pack Unlocked! All sounds are now in your library.')
    } catch (err: any) {
      alert(err.message || 'Error unlocking bundle.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleBulkUnlock}
      disabled={loading}
      className={h-14 px-10 rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-2 \}
    >
      <Zap className="h-4 w-4 fill-black" />
      Unlock Full Pack ({cost} Credits)
    </button>
  )
}
