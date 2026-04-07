'use client'

import React, { useState } from 'react'
import { Download, Lock, Loader2, Sparkles, Diamond, ArrowRight } from 'lucide-react'
import { useAudio } from './AudioProvider'
import { unlockSample, getDownloadUrl } from '@/app/packs/[slug]/actions'

import { useNotify } from '@/components/ui/NotificationProvider'

type DownloadButtonProps = {
  sampleId: string
  isUnlockedInitial: boolean
  creditCost?: number
}

export function DownloadButton({ sampleId, isUnlockedInitial, creditCost = 1 }: DownloadButtonProps) {
    const [isUnlocked, setIsUnlocked] = useState(isUnlockedInitial)
    const [isProcessing, setIsProcessing] = useState(false)
    const [needsConfirm, setNeedsConfirm] = useState(false)
    const { isPlaying, updateMetadataUnlocked } = useAudio()
    const { showToast, showConfirm, showAuthGate } = useNotify()

    // 🧬 SYNC STATE WITH PARENT RE-FETCH
    React.useEffect(() => {
        setIsUnlocked(isUnlockedInitial)
    }, [isUnlockedInitial])

    const handleAction = async (e: React.MouseEvent) => {
        e.stopPropagation()
        
        if (!isUnlocked && !needsConfirm) {
            setNeedsConfirm(true)
            setTimeout(() => setNeedsConfirm(false), 3000)
            return
        }

        setIsProcessing(true)

        try {
            if (!isUnlocked) {
                // 💳 Flow 1: Unlock using credits
                const result = await unlockSample(sampleId)
                if (result.success) {
                    setIsUnlocked(true)
                    updateMetadataUnlocked(sampleId)
                    setNeedsConfirm(false)
                    showToast('Sound Unlocked!', 'success')
                    window.dispatchEvent(new Event('refresh-credits'))
                }
            } else {
                // 📥 Flow 2: Download unlocked sample
                const response = await getDownloadUrl(sampleId)
                if (response.url) {
                    // Because the API sets 'Content-Disposition: attachment', 
                    // this will trigger a native browser download instantly.
                    window.location.assign(response.url)
                }
            }
        } catch (err: any) {
            if (err.message === 'Authentication required') {
                showAuthGate()
                return
            }
            showToast(err.message || "Error", "error")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <button 
            onClick={handleAction}
            disabled={isProcessing}
            className={`
                group relative flex items-center justify-center p-3 rounded-md transition-all duration-300 min-w-[70px]
                ${isUnlocked 
                    ? 'bg-white/5 hover:bg-studio-neon text-white hover:text-black border border-white/10' 
                    : needsConfirm || isProcessing
                        ? 'bg-black text-studio-neon border-2 border-studio-neon shadow-[0_0_20px_#a6e22e33]'
                        : 'bg-white/5 hover:bg-white text-white/40 hover:text-black border border-white/5 hover:border-white'
                }
                active:scale-95
                disabled:opacity-80 disabled:cursor-wait
            `}
            title={isUnlocked ? 'Download Sample' : `Unlock for ${creditCost} Credits`}
        >
            <div className="relative z-10 flex items-center justify-center">
                {isProcessing ? (
                    <div className="flex items-center gap-2 px-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Unlocking...</span>
                    </div>
                ) : (isUnlocked || creditCost === 0) ? (
                    <Download className={`h-4 w-4 ${isPlaying ? 'animate-bounce' : ''} text-white group-hover:text-black transition-colors`} />
                ) : needsConfirm ? (
                    <div className="flex items-center gap-2 px-2">
                         <span className="text-[9px] font-black uppercase tracking-widest">CONFIRM?</span>
                         <ArrowRight className="h-3 w-3" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-1">
                        <Lock className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-tight text-white/40 group-hover:text-black transition-colors">
                            {creditCost}
                        </span>
                    </div>
                )}
            </div>

            {/* 🧬 DYNAMIC BACKDROP */}
            <div className={`
                absolute inset-0 transition-all duration-300
                ${needsConfirm || isProcessing ? 'bg-transparent' : 'bg-transparent group-hover:bg-transparent'}
                ${isUnlocked ? '' : ''}
            `} />

            {/* Premium Glow for Locked Items */}
            {!isUnlocked && !isProcessing && (
                <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 blur-xl pointer-events-none transition-all duration-500" />
            )}

            {/* Unlock Success Sparkle */}
            {isUnlocked && !isUnlockedInitial && (
                 <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-500 animate-ping" />
            )}
        </button>
    )
}
