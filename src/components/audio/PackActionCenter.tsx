'use client'

import React, { useState } from 'react'
import { useVault } from '@/components/VaultProvider'
import { BulkUnlockButton } from './BulkUnlockButton'
import { SecureDownloadButton } from './SecureDownloadButton'
import { SubscribeButton } from '@/components/SubscribeButton'
import { Zap } from 'lucide-react'

interface PackActionCenterProps {
    packId: string
    bundleCost: number
    priceInr: number
    priceUsd?: number
}

export function PackActionCenter({ packId, bundleCost, priceInr, priceUsd }: PackActionCenterProps) {
    const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')
    
    React.useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (!tz.includes('Asia/Kolkata') && !tz.includes('Asia/Calcutta')) {
            setCurrency('USD')
        }
    }, [])

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
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 relative">
            <div className="flex flex-col gap-3">
                <BulkUnlockButton packId={packId} cost={bundleCost} />
                <div className="flex items-center justify-center gap-2 opacity-30">
                    <div className="h-[1px] w-4 bg-white/20" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">PAY_WITH_CREDITS</span>
                    <div className="h-[1px] w-4 bg-white/20" />
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <SubscribeButton 
                    planId={packId} 
                    planName={currency === 'INR' ? `BUY_NOW: ₹${priceInr}` : `BUY_NOW: $${priceUsd || Math.round(priceInr/80)}`} 
                    mode="sample_pack"
                    variant="white"
                    currency={currency}
                />
                <div className="flex items-center justify-center gap-2 opacity-30">
                    <div className="h-[1px] w-4 bg-white/20" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">INSTANT_DELIVERY</span>
                    <div className="h-[1px] w-4 bg-white/20" />
                </div>
            </div>
        </div>
    )
}
