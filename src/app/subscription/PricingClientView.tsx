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
            const isIndia = zone.includes('Kolkata') || zone.includes('Calcutta')
            setCurrency(isIndia ? 'INR' : 'USD')
            setIsAutoDetected(true)
        } catch (e) {
            setCurrency('INR')
        }
    }, [])

    const currentPlanName = activeSub?.subscription_plans?.name || 'Free'
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY')

    return (
        <div className="container mx-auto px-4 relative z-10 text-center">
            {/* 🌸 COMPACT SPRING SALE BANNER */}
            <div className="max-w-4xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <h2 className="text-2xl md:text-3xl font-black text-studio-neon italic tracking-tighter mb-1 mix-blend-difference">
                    Spring Sale: 25% OFF Annual Plans
                </h2>
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">
                    Best value deal active. Save more with an Annual plan today.
                </p>
            </div>

            {/* 💎 1. COMPACT BILLING TOGGLE */}
            <div className="flex flex-col items-center gap-4 mb-12">
                <div className="flex items-center gap-8 bg-white/[0.03] border border-white/5 py-3 px-8 rounded-full backdrop-blur-xl">
                    <button 
                        onClick={() => setBillingCycle('MONTHLY')}
                        className="flex items-center gap-3 group transition-all"
                    >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${billingCycle === 'MONTHLY' ? 'border-studio-neon bg-studio-neon shadow-[0_0_15px_#a6e22e]' : 'border-white/20 group-hover:border-white/40'}`}>
                            {billingCycle === 'MONTHLY' && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                        </div>
                        <span className={`text-[12px] font-black uppercase tracking-widest transition-colors ${billingCycle === 'MONTHLY' ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>Monthly</span>
                    </button>

                    <button 
                        onClick={() => setBillingCycle('ANNUAL')}
                        className="flex items-center gap-3 group transition-all relative"
                    >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${billingCycle === 'ANNUAL' ? 'border-studio-neon bg-studio-neon shadow-[0_0_15px_#a6e22e]' : 'border-white/20 group-hover:border-white/40'}`}>
                            {billingCycle === 'ANNUAL' && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                        </div>
                        <span className={`text-[12px] font-black uppercase tracking-widest transition-colors ${billingCycle === 'ANNUAL' ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>Annual</span>
                        
                        <div className="bg-studio-neon text-black text-[7px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter ml-2 hidden md:block">
                            LIMITED TIME OFFER
                        </div>
                    </button>
                </div>
            </div>

            {/* 💎 2. SUBSCRIPTION PLANS SECTION */}
            <div id="subscription-plans" className="mb-32 md:mb-48">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 max-w-[1400px] mx-auto items-stretch">
                    {plans?.map((plan) => {
                        const visuals = planVisuals[plan.name] || planVisuals['Starter']
                        const isActive = (activeSub?.plan_id && activeSub.plan_id === plan.id)
                        const isUpgrade = plan.price_inr > (activeSub?.subscription_plans?.price_inr || 0)
                        const isLower = plan.price_inr < (activeSub?.subscription_plans?.price_inr || 0)
                        
                        // Signal Calculus
                        const priceInr = billingCycle === 'ANNUAL' ? plan.price_inr_annual : plan.price_inr
                        const priceUsd = billingCycle === 'ANNUAL' ? plan.price_usd_annual : plan.price_usd
                        const effectiveMonthInr = Math.round(priceInr / (billingCycle === 'ANNUAL' ? 12 : 1))
                        const savingsTotalInr = (plan.price_inr * 12) - plan.price_inr_annual

                        const features = plan.features || [
                            `${billingCycle === 'ANNUAL' ? (plan.credits_annual || plan.credits_per_month * 12) : plan.credits_per_month} Credits Added`,
                            '100% Royalty Free access',
                            'DAW-Ready WAV Artifacts',
                            'Commercial Usage Rights'
                        ]
                        
                        const isProducer = plan.name === 'Producer'
                        const isProfessional = plan.name === 'Professional'

                        return (
                            <div 
                                key={plan.id} 
                                className={`group relative bg-studio-grey border border-white/5 p-8 md:p-10 transition-all hover:bg-[#252525] flex flex-col min-h-[550px] shadow-2xl rounded-3xl ${isActive ? 'border-white/50 bg-white/[0.02]' : ''} ${isLower ? 'opacity-20 grayscale pointer-events-none' : ''} ${isProfessional ? 'border-white/10 ring-1 ring-white/10' : ''}`}
                            >
                                {/* Offer Badges */}
                                {billingCycle === 'ANNUAL' && plan.name !== 'Starter' && (
                                    <div className="absolute top-4 right-6 bg-white text-black px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse">
                                        LIMITED TIME OFFER
                                    </div>
                                )}

                                <div className="space-y-2 mb-10 text-left">
                                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{plan.name} Plan</h3>
                                    <p className="text-[11px] font-bold text-white/20 italic tracking-widest uppercase">{plan.description || "High-fidelity audio signal access."}</p>
                                </div>

                                <div className="text-left mb-10">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        {billingCycle === 'ANNUAL' ? (
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[20px] font-black text-white/20 line-through tracking-tighter decoration-studio-neon">
                                                    {currency === 'INR' ? `₹${plan.price_inr}` : `$${plan.price_usd}`}
                                                </span>
                                                <span className="text-5xl font-black tracking-tighter text-studio-neon">
                                                    {currency === 'INR' ? `₹${effectiveMonthInr}` : `$${(priceUsd / 12).toFixed(1)}`}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-5xl font-black tracking-tighter text-white">
                                                {currency === 'INR' ? `₹${priceInr}` : `$${priceUsd}`}
                                            </span>
                                        )}
                                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">/month</span>
                                    </div>
                                    
                                    {billingCycle === 'ANNUAL' && plan.name !== 'Starter' && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-studio-neon uppercase tracking-[0.2em] italic">
                                                Saves {currency === 'INR' ? `₹${savingsTotalInr}` : `$${(plan.price_usd * 12 - plan.price_usd_annual).toFixed(1)}`} by billing yearly!
                                            </p>
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Taxes calculated at checkout</p>
                                        </div>
                                    )}
                                    {billingCycle === 'MONTHLY' && (
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Taxes calculated at checkout</p>
                                    )}
                                </div>

                                <div className="mb-10">
                                    <SubscribeButton 
                                        planId={plan.id} 
                                        planName={isActive ? 'Active Identity' : 'Subscribe'}
                                        isFeatured={isProfessional || isActive} 
                                        mode="subscription"
                                        disabled={isActive || isLower}
                                        currency={currency}
                                    />
                                </div>

                                <div className="space-y-4 flex-1 text-left">
                                    {features.map((feature: any) => (
                                        <div key={feature} className="flex items-center gap-3 text-[11px] font-bold text-white/40 group-hover:text-white/70 transition-all">
                                            <Check size={16} className="text-studio-neon" />
                                            <span className="uppercase tracking-[0.15em]">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ⚡ 2. CREDIT PACKS (ONE-TIME) SECTION */}
            {currentPlanName !== 'Free' && (
                <div>
                    <div className="flex items-center gap-4 mb-16 text-white/10 group px-2">
                        <Database className="h-5 w-5 md:h-6 md:w-6 group-hover:text-studio-yellow transition-colors" />
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-[0.3em] italic">Buy Extra Credits</h2>
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
            )}
        </div>
    )
}
