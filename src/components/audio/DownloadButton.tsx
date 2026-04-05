'use client'

import React, { useState } from 'react'
import { Download, Lock, Loader2, Sparkles } from 'lucide-react'
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
    const { isPlaying } = useAudio()
    const { showToast, showConfirm } = useNotify()

    const handleAction = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsProcessing(true)

        try {
            if (!isUnlocked) {
                // 💳 Flow 1: Unlock using 1 credit
                const confirmed = await showConfirm(`Spend ${creditCost} credits to unlock this sound permanently?`)
                if (!confirmed) {
                    setIsProcessing(false) // Reset loading state
                    return
                }

                const result = await unlockSample(sampleId)
                if (result.success) {
                    setIsUnlocked(true)
                    showToast('SAMPLE UNLOCKED', 'success')
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
                window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
                return
            }
            showToast(err.message || "TRANSACTION FAILED", "error")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <button 
            onClick={handleAction}
            disabled={isProcessing}
            className={`
                group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300
                ${isUnlocked 
                    ? 'bg-white/5 hover:bg-white text-white hover:text-black border border-white/10' 
                    : 'bg-white/5 hover:bg-white text-white/40 hover:text-black border border-white/5 hover:border-white shadow-[0_0_20px_rgba(255,255,255,0)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                }
                active:scale-95
                disabled:opacity-50 disabled:cursor-wait
            `}
            title={isUnlocked ? 'Download Sample' : `Unlock for ${creditCost} Credits`}
        >
            <div className="relative">
                {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (isUnlocked || creditCost === 0) ? (
                    <Download className={`h-5 w-5 ${isPlaying ? 'animate-bounce' : ''}`} />
                ) : (
                    <div className="flex items-center gap-3 px-1">
                        <Lock className="h-4 w-4" />
                        <span className="text-[10px] uppercase font-black tracking-widest bg-white/5 px-2 py-0.5 rounded-full group-hover:bg-black/10 group-hover:text-black">
                            {creditCost} Credit{creditCost !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

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
