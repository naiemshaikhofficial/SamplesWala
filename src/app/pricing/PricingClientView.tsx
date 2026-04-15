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
    const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')

    const currentPlanName = activeSub?.subscription_plans?.name || 'Free'

    return (
        <div className="container mx-auto px-4 relative z-10">
            {/* Currency Toggle Artifact */}
            <div className="flex justify-center mb-12">
                <div className="bg-black/40 border border-white/5 p-1 rounded-sm inline-flex items-center gap-1">
                    <button 
                        onClick={() => setCurrency('INR')}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${currency === 'INR' ? 'bg-studio-neon text-black' : 'text-white/40 hover:text-white'}`}
                    >
                        Domestic (INR)
                    </button>
                    <button 
                        onClick={() => setCurrency('USD')}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${currency === 'USD' ? 'bg-studio-neon text-black' : 'text-white/40 hover:text-white'}`}
                    >
                        International (USD)
                    </button>
                </div>
            </div>

            {/* 💎 1. SUBSCRIPTION PLANS SECTION */}
            <div className="mb-32 md:mb-48">
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

                                <div className="mb-10 md:mb-12 p-5 md:p-6 bg-black/40 border border-white/5 relative overflow-hidden group/price">
                                    <div className="absolute inset-0 bg-studio-neon/5 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                                    <div className="flex items-baseline gap-2 relative z-10">
                                        <span className="text-4xl md:text-6xl font-black tracking-tighter text-white mr-1 md:mr-2">
                                            {currency === 'INR' ? `₹${plan.price_inr}` : `$${plan.price_usd}`}
                                        </span>
                                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">/ MON</span>
                                    </div>
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
                    {packs?.map((pack) => (
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
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black tracking-tighter text-white">
                                        {currency === 'INR' ? `₹${pack.price_inr}` : `$${pack.price_usd}`}
                                    </span>
                                    <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">ONE-TIME</span>
                                </div>
                                <div className="flex-1 max-w-[180px]">
                                    <SubscribeButton 
                                        planId={pack.id} 
                                        planName={`BUY ${pack.credits}`} 
                                        mode="pack"
                                        isFeatured={pack.is_featured}
                                        currency={currency}
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
