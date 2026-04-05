import { createClient } from '@/lib/supabase/server'
import { Check, Sparkles, Zap, Crown, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const planConfigs: any = {
    'Starter': { icon: <Sparkles className="h-6 w-6" />, color: 'from-slate-400 to-slate-600', glow: 'text-slate-400' },
    'Professional': { icon: <Zap className="h-6 w-6" />, color: 'from-yellow-400 to-orange-600', glow: 'text-yellow-500' },
    'Producer': { icon: <Crown className="h-6 w-6" />, color: 'from-emerald-400 to-cyan-600', glow: 'text-emerald-400' }
}

import { SubscribeButton } from '@/components/SubscribeButton'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: plans } = await supabase.from('subscription_plans').select('*').order('price_inr', { ascending: true })
  const { data: packs } = await supabase.from('credit_packs').select('*').order('credits', { ascending: true })

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-yellow-500/10 blur-[150px] rounded-full" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-6 leading-[0.9]">Unlock Your Sound</h1>
          <p className="text-xl text-white/40 leading-relaxed">
            Choose a monthly membership for consistent value, or grab a one-time pack to top up your credits whenever you need.
          </p>
        </div>

        {/* 💎 1. SUBSCRIPTION PLANS SECTION */}
        <div className="mb-32">
            <h2 className="text-2xl font-black uppercase tracking-widest italic mb-12 flex items-center gap-4 text-white/40">
                <div className="h-[1px] w-12 bg-white/20" /> Monthly Memberships
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans?.map((plan) => {
                const config = planConfigs[plan.name] || planConfigs['Starter'];
                const features = [
                    `${plan.credits_per_month} Monthly Credits`,
                    `${plan.name} License Rights`,
                    'Access to Exclusive Packs',
                    'Priority Support'
                ]
                
                return (
                    <div 
                        key={plan.id} 
                        className={`group relative rounded-[2.5rem] bg-white/[0.02] border border-white/10 p-10 transition-all hover:bg-white/[0.04] flex flex-col ${plan.name === 'Professional' ? 'bg-white/[0.05] border-white/20 scale-105 z-10' : ''}`}
                    >
                    {plan.name === 'Professional' && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                            Most Popular Choice
                        </div>
                    )}
                    
                    <div className="mb-8 flex items-center justify-between">
                        <div className={`p-4 rounded-2xl border border-white/10 ${config.glow}`}>
                            {React.cloneElement(config.icon, { className: `h-6 w-6` })}
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-1">Monthly</span>
                            <span className="text-2xl font-black italic tracking-tighter text-white">{plan.credits_per_month} Cr</span>
                        </div>
                    </div>

                    <h3 className="text-3xl font-black uppercase italic tracking-tight mb-4">{plan.name}</h3>
                    <p className="text-sm text-white/40 leading-relaxed mb-10 h-10 overflow-hidden">
                        The ultimate starting point for {plan.name === 'Starter' ? 'new' : 'pro'} sound designers.
                    </p>

                    <div className="mb-10">
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black tracking-tighter text-white">₹{plan.price_inr}</span>
                            <span className="text-white/20 text-sm italic">/mo</span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-12 flex-1">
                        {features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 text-sm text-white/60 group-hover:text-white transition-colors text-left">
                            <div className="p-1 rounded-full bg-emerald-500/20">
                                <Check className="h-3 w-3 text-emerald-400" />
                            </div>
                            {feature}
                        </div>
                        ))}
                    </div>

                    <SubscribeButton 
                        planId={plan.id} 
                        planName={plan.name} 
                        isFeatured={plan.name === 'Professional'} 
                        mode="subscription"
                    />
                    </div>
                )
            })}
            </div>
        </div>

        {/* ⚡ 2. CREDIT PACKS (ONE-TIME) SECTION */}
        <div>
            <h2 className="text-2xl font-black uppercase tracking-widest italic mb-12 flex items-center gap-4 text-white/40">
                <div className="h-[1px] w-12 bg-white/20" /> Extra Credits (One-Time)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {packs?.map((pack) => (
                <div 
                    key={pack.id} 
                    className={`group relative rounded-[2.5rem] bg-white/[0.01] border border-white/5 p-8 transition-all hover:bg-white/[0.03] flex items-center gap-8 ${pack.is_featured ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : ''}`}
                >
                    <div className="flex flex-col flex-1">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-1">{pack.name}</h3>
                        <div className="text-4xl font-black text-white italic tracking-tighter mb-4">
                            {pack.credits} <span className="text-xs uppercase font-normal tracking-widest text-white/20 not-italic">Credits</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">₹{pack.price_inr}</span>
                            <span className="text-[10px] font-medium text-white/20 tracking-tighter uppercase">(~${pack.price_usd})</span>
                        </div>
                    </div>
                    <div className="w-48">
                        <SubscribeButton 
                            planId={pack.id} 
                            planName={`${pack.credits} Extra`} 
                            mode="pack"
                            isFeatured={pack.is_featured}
                        />
                    </div>
                </div>
            ))}
            </div>
        </div>

        <div className="mt-32 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 mb-8">
                <ShieldCheck className="h-4 w-4" /> Secure checkout with Razorpay & Stripe
            </div>
            <p className="text-center text-white/20 text-xs max-w-xl">
                By choosing a plan, you agree to our Terms of Service and Licensing Agreement. All sales are final regarding digital currency assets.
            </p>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
