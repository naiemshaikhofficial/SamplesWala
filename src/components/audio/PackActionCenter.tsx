'use client'

import { useVault } from '@/components/VaultProvider'
import { BulkUnlockButton } from './BulkUnlockButton'
import { SecureDownloadButton } from './SecureDownloadButton'
import { SubscribeButton } from '@/components/SubscribeButton'
import { Zap } from 'lucide-react'

interface PackActionCenterProps {
    packId: string
    bundleCost: number
    priceInr: number
}

export function PackActionCenter({ packId, bundleCost, priceInr }: PackActionCenterProps) {
    const { unlockedIds, isLoading } = useVault()
    const isFullPackUnlocked = unlockedIds.has(packId)

    if (isLoading) {
        return (
            <div className="w-full h-24 bg-white/5 animate-pulse rounded-sm border border-white/5" />
        )
    }

    if (isFullPackUnlocked) {
        return (
            <div className="w-full max-w-2xl mx-auto py-4">
                <SecureDownloadButton packId={packId} variant="yellow" />
            </div>
        )
    }

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative">
            <div className="flex flex-col gap-3">
                <BulkUnlockButton packId={packId} cost={bundleCost} />
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic text-center">PAY_WITH_CREDITS</span>
            </div>
            <div className="flex flex-col gap-3">
                <SubscribeButton 
                    planId={packId} 
                    planName={`BUY_NOW: ₹${priceInr}`} 
                    mode="sample_pack"
                    isFeatured
                />
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic text-center">INSTANT_DELIVERY</span>
            </div>
        </div>
    )
}
