import { createClient } from '@/lib/supabase/server'
import { Check, Sparkles, Zap, Crown, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const planConfigs: any = {
    'Silver': { icon: <Sparkles className="h-6 w-6" />, color: 'from-slate-400 to-slate-600', glow: 'text-slate-400' },
    'Gold': { icon: <Zap className="h-6 w-6" />, color: 'from-yellow-400 to-orange-600', glow: 'text-yellow-500' },
    'Pro Platinum': { icon: <Crown className="h-6 w-6" />, color: 'from-emerald-400 to-cyan-600', glow: 'text-emerald-400' }
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: plans } = await supabase.from('subscription_plans').select('*').order('price_inr', { ascending: true })

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-yellow-500/10 blur-[150px] rounded-full" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-6">Pricing Plans</h1>
          <p className="text-xl text-white/40 leading-relaxed">
            Invest in your sound. Choose a credit pack that matches your creative workflow. No hidden fees, just pure inspiration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans?.map((plan) => {
            const config = planConfigs[plan.name] || planConfigs['Silver'];
            const features = [
                `${plan.credits_per_month} High-Quality Credits`,
                `${plan.name} License Rights`,
                'Access to Exclusive Packs',
                'Priority Support'
            ]
            
            return (
                <div 
                    key={plan.id} 
                    className={`group relative rounded-[2.5rem] bg-white/[0.02] border border-white/10 p-10 transition-all hover:bg-white/[0.04] flex flex-col ${plan.name === 'Gold' ? 'bg-white/[0.05] border-white/20 scale-105 z-10' : ''}`}
                >
                {plan.name === 'Gold' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                        Most Popular Choice
                    </div>
                )}
                
                <div className="mb-8 flex items-center justify-between">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${config.color} bg-clip-text text-transparent border border-white/10`}>
                        {React.cloneElement(config.icon, { className: `h-6 w-6 ${config.glow}` })}
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-1">Monthly Credits</span>
                        <span className="text-2xl font-black italic tracking-tighter text-white">{plan.credits_per_month}</span>
                    </div>
                </div>

                <h3 className="text-3xl font-black uppercase italic tracking-tight mb-4">{plan.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-10 h-10 overflow-hidden">
                    Premium access to the {plan.name} tier with universal sample access.
                </p>

                <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter text-white">₹{plan.price_inr}</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-2">
                        One-time payment • Approx. ${plan.price_usd} USD
                    </div>
                </div>

                <div className="space-y-4 mb-12 flex-1">
                    {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-white/60 group-hover:text-white transition-colors">
                        <div className="p-1 rounded-full bg-emerald-500/20">
                            <Check className="h-3 w-3 text-emerald-400" />
                        </div>
                        {feature}
                    </div>
                    ))}
                </div>

                <Link 
                    href={`/auth/signup?plan=${plan.id}`} 
                    className={`w-full py-5 rounded-2xl text-center text-sm font-black uppercase tracking-widest transition-all ${plan.name === 'Gold' ? 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                >
                    Get {plan.name}
                </Link>
                </div>
            )
          })}
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
