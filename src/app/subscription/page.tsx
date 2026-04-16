import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Activity, Settings2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { MasterLight, ScanlineOverlay } from '@/components/ui/MasterLight'
import PricingClientView from './PricingClientView'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // 📀 High-Fidelity Data Extraction with Fallbacks
  const [{ data: activeSub }, { data: plans }, { data: packs }] = await Promise.all([
    user ? supabase.from('user_accounts').select('*, subscription_plans(*)').eq('user_id', user.id).maybeSingle() : { data: null },
    supabase.from('subscription_plans').select('*').order('price_inr', { ascending: true }),
    supabase.from('credit_packs').select('*').order('credits', { ascending: true })
  ])

  const currentPlanName = activeSub?.subscription_plans?.name || 'Free'

  return (
    <div className="min-h-screen bg-studio-charcoal text-white pt-16 md:pt-20 pb-24 relative overflow-hidden font-mono selection:bg-studio-neon selection:text-black">
        <MasterLight />
        <ScanlineOverlay />
        
        {/* Cinematic Backdrop Artifacts */}
        <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none">
            <Settings2 className="h-96 w-96 animate-spin-slow" />
        </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-8 md:mb-12 px-4">
          <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-sm bg-black border border-white/5 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-studio-neon mb-4 md:mb-6 animate-pulse">
            <Activity size={10} /> {activeSub ? `SUBSCRIPTION : ${currentPlanName.toUpperCase()}` : 'CHOOSE YOUR PLAN'}
          </div>
          <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase italic mb-4 leading-[0.8] mix-blend-difference">
            SIMPLE <span className="text-studio-neon">PRICING</span>
          </h1>
          <p className="text-[9px] md:text-sm text-white/20 font-black uppercase tracking-[0.3em] max-w-2xl mx-auto italic">
            Monthly signals or top-up packs. 100% Royalty Free.
          </p>
        </div>

        {/* 🛡️ INTERACTIVE PRICING HUB */}
        <PricingClientView 
            plans={plans || []} 
            packs={packs || []} 
            activeSub={activeSub} 
            user={user} 
        />

        <div className="mt-48 grid grid-cols-1 md:grid-cols-2 gap-12 border-t-8 border-black pt-24">
            <div className="p-12 bg-black border-4 border-white/5 relative group hover:border-studio-neon transition-all rounded-sm overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="h-40 w-40" />
                </div>
                <h4 className="text-4xl font-black uppercase tracking-tighter mb-6 italic leading-none">100%<br/>Secure</h4>
                <p className="text-sm font-black uppercase tracking-widest opacity-30 leading-loose max-w-sm mb-10">Safe and encrypted payments powered by industry leaders Razorpay and PayPal.</p>
                <div className="flex gap-4">
                    <div className="h-10 px-6 bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest">RAZORPAY</div>
                    <div className="h-10 px-6 bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest">PAYPAL</div>
                </div>
            </div>
             <div className="p-12 bg-black border-4 border-white/5 relative group hover:border-studio-neon transition-all rounded-sm overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity rotate-45">
                    <Activity className="h-40 w-40" />
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
