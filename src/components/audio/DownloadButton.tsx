'use client'
import { Download, Lock } from 'lucide-react'
import { useState } from 'react'
import { generateDownloadToken, unlockSample } from '@/app/packs/[slug]/actions'

export function DownloadButton({ sampleId, isUnlockedInitial }: { sampleId: string; isUnlockedInitial: boolean }) {
  const [loading, setLoading] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(isUnlockedInitial)

  const handleAction = async () => {
    try {
      setLoading(true)
      
      if (!isUnlocked) {
        // Splice-style unlock
        const res = await unlockSample(sampleId)
        if (res.success) {
          setIsUnlocked(true)
          alert('Sample Unlocked! You can now download it.')
        }
        return
      }

      // Secure Download logic
      const token = await generateDownloadToken(sampleId)
      window.location.href = `/api/download?token=${token}`
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error processing request. Check your credits.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleAction}
      disabled={loading}
      className="group flex items-center justify-center gap-2 p-2 px-3 rounded-full transition-all active:scale-90 bg-white/5 border border-white/10 hover:bg-white/10"
    >
      {isUnlocked ? (
        <Download className="h-4 w-4" />
      ) : (
        <>
          <Lock className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
          <span className="text-[10px] font-black uppercase tracking-widest px-1">Unlock</span>
        </>
      )}
    </button>
  )
}
