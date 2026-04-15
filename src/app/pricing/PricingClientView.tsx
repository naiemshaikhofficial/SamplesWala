'use client'

import React, { useState } from 'react'
import { Check, Sparkles, Zap, Crown, BarChart3, Database, ArrowRight, Activity, Cpu } from 'lucide-react'
import { SubscribeButton } from '@/components/SubscribeButton'
import { DAWVisualizer } from '@/components/ui/DAWVisualizer'

interface PricingClientViewProps {
    plans: any[]
    packs: any[]
    activeSub: any
    user: any
}

const planVisuals: any = {
    'Starter': { icon: <Sparkles className="h-6 w-6" />, color: 'border-white/10', glow: 'text-studio-neon', accent: 'bg-studio-neon/20' },
    'Professional': { icon: <Zap className="h-6 w-6" />, color: 'border-studio-yellow/20', glow: 'text-studio-yellow', accent: 'bg-studio-yellow/20' },
    'Producer': { icon: <Crown className="h-6 w-6" />, color: 'border-spider-red/20', glow: 'text-spider-red', accent: 'bg-spider-red/20' }
}

export default function PricingClientView({ plans, packs, activeSub, user }: PricingClientViewProps) {
    const [currency, setCurrency] = React.useState<'INR' | 'USD'>('INR')
    const [isAutoDetected, setIsAutoDetected] = React.useState(false)

    React.useEffect(() => {
        try {
            const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
            const isIndia = zone === 'Asia/Kolkata'
            setCurrency(isIndia ? 'INR' : 'USD')
            setIsAutoDetected(true)
        } catch (e) {
            setCurrency('INR')
        }
    }, [])

    const currentPlanName = activeSub?.subscription_plans?.name || 'Free'

    return (
        <div className="container mx-auto px-4 relative z-10">
            {/* 🧿 SMART_REGION_INDICATOR */}
            <div className="flex flex-col items-center mb-16 md:mb-24">
                <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                    <div className="relative">
                        <Activity className="h-3 w-3 text-studio-neon" />
                        <div className="absolute inset-0 bg-studio-neon blur-sm animate-pulse rounded-full opacity-50" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                        {isAutoDetected ? 'SIGNAL DETECTED:' : 'SYNCING SIGNAL...'} 
                        <span className="text-white ml-2">
                            {currency === 'INR' ? '🇮🇳 Indian Node' : '🌎 Global Signal'}
                        </span>
                    </span>
                </div>
            </div>

            {/* ... rest of the section logic ... */}
            {/* 💎 1. SUBSCRIPTION PLANS SECTION */}
            <div id="subscription-plans" className="mb-32 md:mb-48">
                {/* ... existing header ... */}
                <div className="flex items-center gap-4 mb-12 md:mb-16 text-white/10 group px-2">
                    <BarChart3 className="h-5 w-5 md:h-6 md:w-6 group-hover:text-studio-neon transition-colors" />
                    <h2 className="text-lg md:text-2xl font-black uppercase tracking-[0.3em] italic">Subscription Plans</h2>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 max-w-[1600px] mx-auto">
                    {plans?.map((plan) => {
                        const visuals = planVisuals[plan.name] || planVisuals['Starter']
                        const isActive = (activeSub?.plan_id && activeSub.plan_id === plan.id)
                        const isUpgrade = plan.price_inr > (activeSub?.subscription_plans?.price_inr || 0)
                        const isLower = plan.price_inr < (activeSub?.subscription_plans?.price_inr || 0)
                        
                        const features = plan.features || [
                            `${plan.credits_per_month || 0} Monthly Credits`,
                            '100% Royalty Free',
                            'Keep Downloaded Sounds Forever'
                        ]
                        
                        return (
                            <div 
                                key={plan.id} 
                                className={`group relative bg-[#151515] border-2 ${visuals.color} p-6 md:p-10 transition-all hover:bg-black hover:border-studio-neon flex flex-col min-h-[550px] md:min-h-[650px] shadow-2xl rounded-sm ${isActive ? 'border-studio-neon ring-4 ring-studio-neon/10' : ''} ${isLower ? 'opacity-20 grayscale pointer-events-none' : ''}`}
                            >
                                <div className="absolute left-0 inset-y-0 w-1 bg-studio-neon/10 group-hover:bg-studio-neon transition-all" />
                                
                                <div className="mb-10 md:mb-12 flex items-center justify-between">
                                    <div className={`h-12 w-12 md:h-16 md:w-16 flex items-center justify-center bg-black border border-white/5 ${visuals.glow} group-hover:bg-studio-neon group-hover:text-black transition-all`}>
                                        {React.cloneElement(visuals.icon as React.ReactElement, { size: 24 } as any)}
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-white/20">CREDITS</span>
                                        <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">{plan.credits_per_month}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                                    <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">{plan.name}</h3>
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#fff]/20 leading-relaxed max-w-full md:max-w-[80%] italic">
                                        {plan.description || "Get full access to all essential sounds with this plan."}
                                    </p>
                                </div>

                                <div className="mb-10 md:mb-12 p-5 md:p-6 bg-black/40 border border-white/5 relative overflow-hidden group/price flex flex-col gap-2">
                                    <div className="absolute inset-0 bg-studio-neon/5 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                                    <div className="flex flex-col gap-1 relative z-10">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl md:text-6xl font-black tracking-tighter text-white mr-1 md:mr-2">
                                                {currency === 'INR' ? `₹${plan.price_inr}` : `$${plan.price_usd}`}
                                            </span>
                                            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">/ MON</span>
                                        </div>
                                    </div>
                                    {currency === 'USD' && (
                                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-studio-neon bg-studio-neon/10 px-2 py-1 self-start rounded-full animate-pulse">
                                            Includes Int. Signal Fees
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4 md:space-y-5 mb-10 md:mb-14 flex-1">
                                    {features.map((feature: any) => (
                                        <div key={feature} className="flex items-start gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-all text-left">
                                            <div className="mt-1 h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-studio-neon shadow-[0_0_10px_#a6e22e]" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 mt-auto">
                                    <SubscribeButton 
                                        planId={plan.id} 
                                        planName={
                                            isActive ? 'Active' : 
                                            isUpgrade && currentPlanName !== 'Free' ? 'UPGRADE' : 
                                            isLower ? '—' : 
                                            (plan.name === 'Starter' && !activeSub?.is_trial_used) ? 'START FREE TRIAL' : 
                                            'SUBSCRIBE'
                                        }
                                        isFeatured={plan.name === 'Professional' || isActive} 
                                        mode="subscription"
                                        disabled={isActive || isLower}
                                        currency={currency}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ⚡ 2. CREDIT PACKS (ONE-TIME) SECTION */}
            <div>
                <div className="flex items-center gap-4 mb-16 text-white/10 group px-2">
                    <Database className="h-5 w-5 md:h-6 md:w-6 group-hover:text-studio-yellow transition-colors" />
                    <h2 className="text-lg md:text-2xl font-black uppercase tracking-[0.3em] italic">Credit Packs</h2>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
                    {packs?.filter(p => {
                        if (currency === 'INR') return p.credits >= 50
                        return p.credits >= 100
                    }).map((pack) => (
                        <div 
                            key={pack.id} 
                            className={`group relative bg-[#111] border-2 ${pack.is_featured ? 'border-studio-yellow/20' : 'border-white/5'} p-8 hover:border-studio-yellow transition-all flex flex-col gap-8 rounded-sm shadow-xl`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-white/30 italic">{pack.name}</h3>
                                </div>
                                <div className="h-10 w-10 flex items-center justify-center bg-black border border-white/10 text-studio-yellow">
                                    <Cpu size={16} />
                                </div>
                            </div>

                            <div className="flex items-center gap-8 py-6 border-y border-white/5">
                                <div className="text-5xl font-black text-white italic tracking-tighter leading-none">
                                    {pack.credits} <span className="text-[10px] not-italic text-white/20 uppercase tracking-[0.4em] ml-2 font-black">CREDITS</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black tracking-tighter text-white">
                                            {currency === 'INR' ? `₹${pack.price_inr}` : `$${pack.price_usd}`}
                                        </span>
                                    </div>
                                    {currency === 'USD' && (
                                        <span className="text-[6px] font-black uppercase tracking-widest text-studio-yellow animate-pulse">
                                            + Gateway Artifact
                                        </span>
                                    )}
                                    <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">ONE-TIME</span>
                                </div>
                                <div className="flex-1 max-w-[180px]">
                                    <SubscribeButton 
                                        planId={pack.id} 
                                        planName={`BUY ${pack.credits}`} 
                                        mode="pack"
                                        isFeatured={pack.is_featured}
                                        currency={currency}
                                        hasActiveSubscription={!!activeSub}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
