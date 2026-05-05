'use client'

import React, { useState } from 'react'
import { useVault } from '@/components/VaultProvider'
import { BulkUnlockButton } from './BulkUnlockButton'
import { SecureDownloadButton } from './SecureDownloadButton'
import { SubscribeButton } from '@/components/SubscribeButton'
import { Zap, ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/CartProvider'

interface PackActionCenterProps {
    packId: string
    bundleCost: number
    priceInr: number
    priceUsd?: number
    name: string
    coverUrl: string
    slug: string
}

export function PackActionCenter({ 
    packId, 
    bundleCost, 
    priceInr, 
    priceUsd,
    name,
    coverUrl,
    slug
}: PackActionCenterProps) {
    const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')
    const { addItem, isInCart } = useCart()
    const { unlockedIds, isLoading } = useVault()
    
    React.useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (!tz.includes('Asia/Kolkata') && !tz.includes('Asia/Calcutta')) {
            setCurrency('USD')
        }
    }, [])

    const alreadyInCart = isInCart(packId)
    const isFullPackUnlocked = unlockedIds.has(packId)

    const handleAddToCart = () => {
        addItem({
            id: packId,
            name,
            cover_url: coverUrl,
            price_inr: priceInr,
            price_usd: priceUsd || Math.round(priceInr/80),
            slug,
            type: 'pack'
        })
    }

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
        <div className="w-full flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 relative">
                <div className="flex flex-col gap-3">
                    <BulkUnlockButton packId={packId} cost={bundleCost} />
                    <div className="flex items-center justify-center gap-2 opacity-30">
                        <div className="h-[1px] w-4 bg-white/20" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">Pay with Credits</span>
                        <div className="h-[1px] w-4 bg-white/20" />
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <SubscribeButton 
                        planId={packId} 
                        planName={currency === 'INR' ? `Buy Now: ₹${priceInr}` : `Buy Now: $${priceUsd || Math.round(priceInr/80)}`} 
                        mode="sample_pack"
                        variant="white"
                        currency={currency}
                    />
                    <div className="flex items-center justify-center gap-2 opacity-30">
                        <div className="h-[1px] w-4 bg-white/20" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">Instant Download</span>
                        <div className="h-[1px] w-4 bg-white/20" />
                    </div>
                </div>
            </div>

            {/* 🛒 ADD_TO_CART_BUTTON */}
            {!isFullPackUnlocked && (
                <button 
                    onClick={handleAddToCart}
                    disabled={alreadyInCart}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all border-2 ${
                        alreadyInCart 
                        ? 'bg-studio-neon/5 text-studio-neon/30 border-studio-neon/10 cursor-not-allowed' 
                        : 'bg-[#111] text-white/60 border-white/5 hover:border-studio-neon hover:text-studio-neon hover:shadow-[0_0_30px_rgba(166,226,46,0.15)] shadow-2xl group'
                    }`}
                >
                    <div className={`p-1.5 rounded-md ${alreadyInCart ? 'bg-studio-neon/10' : 'bg-white/5 group-hover:bg-studio-neon/20'}`}>
                        <ShoppingCart size={16} className={alreadyInCart ? 'text-studio-neon/40' : 'text-white/40 group-hover:text-studio-neon'} />
                    </div>
                    <span className="text-[11px]">{alreadyInCart ? 'In Cart' : 'Add to Cart'}</span>
                </button>
            )}
        </div>
    )
}
