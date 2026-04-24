'use client'

import React, { useState } from 'react'
import { Download, Lock, Loader2, Sparkles, Diamond, ArrowRight } from 'lucide-react'
import { useAudio } from './AudioProvider'
import { unlockSample } from '@/app/packs/[slug]/actions'
import { getSecureDownloadUrl } from '@/app/packs/actions'

import { useNotify } from '@/components/ui/NotificationProvider'
import { useVault, useIsUnlocked } from '@/components/VaultProvider'
import { useSWRConfig } from 'swr'

type DownloadButtonProps = {
  sampleId: string
  creditCost?: number
  packId?: string
  variant?: 'default' | 'neon'
}

export function DownloadButton({ sampleId, creditCost = 1, packId, variant = 'default' }: DownloadButtonProps) {
    const isUnlocked = useIsUnlocked(sampleId, packId)
    const { isSubscribed, unlockedIds, mutate, unlockItem, removeItem } = useVault()
    const [isProcessing, setIsProcessing] = useState(false)
    const [needsConfirm, setNeedsConfirm] = useState(false)
    const { isPlaying, updateMetadataUnlocked, user } = useAudio()
    const { showToast, showConfirm, showAuthGate, showTopUpModal } = useNotify()

    const handleAction = async (e: React.MouseEvent) => {
        e.stopPropagation()
        
        if (!user) {
            showAuthGate()
            return
        }

        // 📥 FREE_SIGNAL: Direct Download if creditCost is 0
        if (creditCost === 0 || isUnlocked) {
            setIsProcessing(true)
            try {
                showToast('Initiating Download...', 'success')
                const secureUrl = await getSecureDownloadUrl(sampleId, true)
                if (secureUrl) {
                    window.location.assign(secureUrl)
                }
            } catch (err: any) {
                showToast(err.message || "Download failed", "error")
            } finally {
                setIsProcessing(false)
            }
            return
        }

        // 🛡️ SUBSCRIPTION_ONLY_GATEway (Only for items with cost > 0)
        if (!isSubscribed) {
            showToast("Active Studio Subscription Required To Unlock Sounds", "error")
            setTimeout(() => {
                window.location.href = '/subscription';
            }, 1000);
            return
        }

        if (!needsConfirm) {
            setNeedsConfirm(true)
            setTimeout(() => setNeedsConfirm(false), 3000)
            return
        }

        setIsProcessing(true)

        try {
            // 💳 Flow 1: Unlock using credits (Only if subscribed)
            setNeedsConfirm(false)
            
            // 🚀 ABSOLUTE_INSTANT_SIGNAL
            unlockItem(sampleId) 
            updateMetadataUnlocked(sampleId)

            const result = await unlockSample(sampleId)
            
            if (result.success) {
                // Success! 🧬 FORCE-SYNC PROTOCOL
                updateMetadataUnlocked(sampleId)
                
                // Force-inject into SWR Cache
                mutate('user_vault', (current: any) => {
                    const next = new Set(current?.ids instanceof Set ? current.ids : (current?.ids || []))
                    next.add(sampleId)
                    return { ...current, ids: next }
                }, false)

                showToast('Sound Unlocked!', 'success')
                window.dispatchEvent(new Event('refresh-credits'))
                mutate('user_vault')
            } else {
                // 🩸 SOFT_FAIL_PROTOCOL
                if (result.error === 'INSUFFICIENT_FUNDS') {
                    showToast("Insufficient credits. Opening top-up terminal...", "warning")
                    showTopUpModal()
                    removeItem(sampleId)
                    return
                }
                throw new Error(result.error || "Transaction failed")
            }
        } catch (err: any) {
            // 🔄 GLOBAL_ROLLBACK
            console.error("[VAULT_ROLLBACK] Unlocking failed. Reverting local state.", err);
            removeItem(sampleId)
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
                ${variant === 'neon' ? 'h-14 px-8 text-sm' : 'h-10 px-4'}
                ${isUnlocked || creditCost === 0
                    ? variant === 'neon' 
                        ? 'bg-white text-black font-black uppercase tracking-widest' 
                        : 'bg-white/5 hover:bg-studio-neon text-white hover:text-black border border-white/10' 
                    : needsConfirm || isProcessing
                        ? 'bg-black text-studio-neon border-2 border-studio-neon shadow-[0_0_20px_#a6e22e33]'
                        : variant === 'neon'
                            ? 'bg-studio-neon text-black border-none shadow-[0_0_30px_#a6e22e66]'
                            : 'bg-white/5 hover:bg-white text-white/40 hover:text-black border border-white/5 hover:border-white'
                }
                active:scale-95
                disabled:opacity-80 disabled:cursor-wait font-black uppercase italic
            `}
            title={isUnlocked ? 'Download Sample' : `Unlock for ${creditCost} Credits`}
        >
            <div className="relative z-10 flex items-center justify-center">
                {(isProcessing && !isUnlocked) ? (
                    <div className="flex items-center gap-2 px-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-[8px] font-black uppercase tracking-widest italic animate-pulse">
                            Processing...
                        </span>
                    </div>
                ) : (isUnlocked || creditCost === 0) ? (
                    <Download className={`${variant === 'neon' ? 'h-5 w-5' : 'h-4 w-4'} ${isPlaying ? 'animate-bounce' : ''} text-white group-hover:text-black transition-colors`} />
                ) : needsConfirm ? (
                    <div className="flex items-center gap-2 px-2">
                         <span className="text-[9px] font-black uppercase tracking-widest">CONFIRM?</span>
                         <ArrowRight className="h-3 w-3" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-1">
                        <Lock className={`${variant === 'neon' ? 'h-4 w-4' : 'h-3 w-3'} opacity-40 group-hover:opacity-100 transition-all`} />
                        <span className={`${variant === 'neon' ? 'text-xs' : 'text-[10px]'} font-black uppercase tracking-tight text-white/40 group-hover:text-black transition-colors`}>
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
            {isUnlocked && (
                 <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-500 animate-ping" />
            )}
        </button>
    )
}
