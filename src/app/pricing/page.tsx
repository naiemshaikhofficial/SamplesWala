import { createClient } from '@/lib/supabase/server'
import { Check, Sparkles, Zap, Crown, ShieldCheck, Activity, Cpu, Disc, Settings2, BarChart3, Database, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SubscribeButton } from '@/components/SubscribeButton'
import { CancelSubscriptionButton } from '@/components/CancelSubscriptionButton'
import React, { Suspense } from 'react'
import { SignalMeter, DAWVisualizer } from '@/components/ui/DAWVisualizer'
import { MasterLight, ScanlineOverlay } from '@/components/ui/MasterLight'

const planVisuals: any = {
    'Starter': { icon: <Sparkles className="h-6 w-6" />, color: 'border-white/10', glow: 'text-studio-neon', accent: 'bg-studio-neon/20' },
    'Professional': { icon: <Zap className="h-6 w-6" />, color: 'border-studio-yellow/20', glow: 'text-studio-yellow', accent: 'bg-studio-yellow/20' },
    'Producer': { icon: <Crown className="h-6 w-6" />, color: 'border-spider-red/20', glow: 'text-spider-red', accent: 'bg-spider-red/20' }
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // 📀 High-Fidelity Data Extraction with Fallbacks
  const [{ data: activeSub, error: subError }, { data: plans, error: plansError }, { data: packs, error: packsError }] = await Promise.all([
    user ? supabase.from('user_accounts').select('*, subscription_plans(*)').eq('user_id', user.id).maybeSingle() : { data: null, error: null },
    supabase.from('subscription_plans').select('*').order('price_inr', { ascending: true }),
    supabase.from('credit_packs').select('*').order('credits', { ascending: true })
  ])

  if (plansError) console.error("[PRICING_ENGINE] Plans Fetch Error:", plansError);
  if (packsError) console.error("[PRICING_ENGINE] Packs Fetch Error:", packsError);
  if (subError) console.error("[PRICING_ENGINE] Subscription Fetch Error:", subError);

  const currentPlanName = activeSub?.subscription_plans?.name || 'Free'
  const currentPrice = activeSub?.subscription_plans?.price_inr || 0

  return (
    <div className="min-h-screen bg-studio-charcoal text-white pt-24 md:pt-32 pb-24 relative overflow-hidden font-mono selection:bg-studio-neon selection:text-black">
        <MasterLight />
        <ScanlineOverlay />
        
        {/* Cinematic Backdrop Artifacts */}
        <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none">
            <Settings2 className="h-96 w-96 animate-spin-slow" />
        </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24 px-4">
          <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-sm bg-black border border-white/5 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-studio-neon mb-6 md:mb-10 animate-pulse">
            <Activity size={10} /> {activeSub ? `CURRENT PLAN : ${currentPlanName.toUpperCase()}` : 'CHOOSE YOUR PLAN'}
          </div>
          <h1 className="text-5xl md:text-[9rem] font-black tracking-tighter uppercase italic mb-8 leading-[0.8] mix-blend-difference">
            SIMPLE <span className="text-studio-neon">PRICING</span>
          </h1>
          <p className="text-xs md:text-xl text-white/30 font-black uppercase tracking-widest max-w-2xl mx-auto leading-relaxed italic">
            Choose a monthly subscription or buy credit packs to fit your needs. <br className="hidden md:block"/>
            100% Royalty Free. Keep What You Download Forever.
          </p>
        </div>

        {/* 🛡️ DATA_AVAILABILITY_GAURD (Surgical check for plan presence) */}
        {(!plans || plans.length === 0) && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-sm bg-black/20 text-white/10 uppercase font-black tracking-widest mb-32">
                <Database className="h-12 w-12 mb-6 animate-pulse" />
                No pricing plans available at the moment. Please check back later.
            </div>
        )}

        {/* 💎 1. SUBSCRIPTION PLANS SECTION */}
        <div className="mb-32 md:mb-48">
            <div className="flex items-center gap-4 mb-12 md:mb-16 text-white/10 group px-2">
                <BarChart3 className="h-5 w-5 md:h-6 md:w-6 group-hover:text-studio-neon transition-colors" />
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-[0.3em] italic">Memberships</h2>
                <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 max-w-[1600px] mx-auto">
            {plans?.map((plan) => {
                const visuals = planVisuals[plan.name] || planVisuals['Starter'];
                const isActive = (activeSub?.plan_id && activeSub.plan_id === plan.id)
                const isUpgrade = plan.price_inr > (activeSub?.subscription_plans?.price_inr || 0)
                const isLower = plan.price_inr < (activeSub?.subscription_plans?.price_inr || 0)
                
                // Fallback features if not synced yet (though SQL adds them)
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
                    {/* Diagnostic Sidebar */}
                    <div className="absolute left-0 inset-y-0 w-1 bg-studio-neon/10 group-hover:bg-studio-neon transition-all" />
                    
                    {plan.name === 'Professional' && !isActive && !isLower && (
                        <div className="absolute -top-3 right-6 bg-studio-yellow text-black text-[8px] md:text-[10px] font-black uppercase tracking-widest px-4 md:px-6 py-2 rounded-sm shadow-[0_0_20px_rgba(234,179,8,0.3)] z-20 italic">
                            BEST VALUE
                        </div>
                    )}

                    {isActive && (
                        <div className="absolute -top-3 right-6 bg-studio-neon text-black text-[8px] md:text-[10px] font-black uppercase tracking-widest px-4 md:px-6 py-2 rounded-sm flex items-center gap-2 z-20 italic">
                            ACTIVE PLAN
                        </div>
                    )}
                    
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
                            <span className="text-4xl md:text-6xl font-black tracking-tighter text-white mr-1 md:mr-2">₹{plan.price_inr}</span>
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
                        />

                        {plan.name === 'Starter' && !isActive && !isLower && !activeSub?.is_trial_used && (
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/25 text-center leading-relaxed px-2">
                                ₹5 refundable auth fee by Razorpay · First 30 days free · Cancel anytime
                            </p>
                        )}

                    </div>

                    {/* Animated diagnostic background */}
                    <div className="absolute bottom-4 right-4 opacity-[0.03] group-hover:opacity-10 transition-opacity hidden md:block">
                         <DAWVisualizer color="#a6e22e" bars={12} height={20} />
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
                             <p className="text-[8px] font-black uppercase tracking-widest text-white/15 italic">{pack.description || "One-time credit purchase."}</p>
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
                            <span className="text-3xl font-black tracking-tighter text-white">₹{pack.price_inr}</span>
                            <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">ONE TIME PAYMENT</span>
                        </div>
                        <div className="flex-1 max-w-[180px]">
                            <SubscribeButton 
                                planId={pack.id} 
                                planName={`BUY ${pack.credits} CREDITS`} 
                                mode="pack"
                                isFeatured={pack.is_featured}
                            />
                        </div>
                    </div>

                    {/* Industrial details overlay */}
                    <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-10">
                        {[...Array(4)].map((_, i) => <div key={i} className="w-1 h-3 bg-studio-yellow" />)}
                    </div>
                </div>
            ))}
            </div>
        </div>

        <div className="mt-48 grid grid-cols-1 md:grid-cols-2 gap-12 border-t-8 border-black pt-24">
            <div className="p-12 bg-black border-4 border-white/5 relative group hover:border-studio-neon transition-all rounded-sm overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="h-40 w-40" />
                </div>
                <h4 className="text-4xl font-black uppercase tracking-tighter mb-6 italic leading-none">100%<br/>Secure</h4>
                <p className="text-sm font-black uppercase tracking-widest opacity-30 leading-loose max-w-sm mb-10">Safe and encrypted payments powered by industry leaders Razorpay and Stripe.</p>
                <div className="flex gap-4">
                    <div className="h-10 px-6 bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest">RAZORPAY</div>
                    <div className="h-10 px-6 bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest">STRIPE</div>
                </div>
            </div>
             <div className="p-12 bg-black border-4 border-white/5 relative group hover:border-studio-neon transition-all rounded-sm overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity rotate-45">
                    <Database className="h-40 w-40" />
                </div>
                <h4 className="text-4xl font-black uppercase tracking-tighter mb-6 italic leading-none">Yours<br/>Forever</h4>
                <p className="text-sm font-black uppercase tracking-widest opacity-30 leading-loose max-w-sm mb-10">Every sound you download from SamplesWala is 100% royalty-free and yours to keep forever.</p>
                <Link href="/profile/library" className="inline-flex items-center gap-4 text-studio-neon text-[10px] font-black uppercase tracking-widest group">
                    View My Sounds <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </Link>
            </div>
        </div>

        <div className="mt-32 text-center">
             <p className="text-white/10 text-[9px] font-black uppercase tracking-[0.5em] italic">
                SAMPLESWALA © {new Date().getFullYear()}
             </p>
        </div>
      </div>
    </div>
  )
}
