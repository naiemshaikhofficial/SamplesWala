import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SubscribeButton } from '@/components/SubscribeButton'

export async function SubscriptionFeature() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // Fetch only the relevant plans for quick access
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .in('name', ['Professional', 'Producer'])
    .order('price_inr', { ascending: true })

  const { data: activeSub } = session ? await supabase
    .from('user_accounts')
    .select('*, subscription_plans(*)')
    .eq('user_id', session.user.id)
    .single() : { data: null }

  const hasActiveSub = !!activeSub?.plan_id

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden border-y-4 border-white/5">
      {/* 🧬 AMBIENT_BACKGROUND_GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* ⬅️ LEFT: SIMPLE_VALUE_PROPOSITION */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 bg-white/5 px-4 py-1 self-start border-l-4 border-white">
                ONE PRICE. ALL SOUNDS.
              </div>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] italic">
                GET ALL<br />
                <span className="text-white">SOUNDS</span>
              </h2>
              <p className="text-lg md:text-2xl text-white/40 font-bold italic leading-tight max-w-xl">
                The easiest way to get professional sounds. Join now to get monthly credits, a commercial license, and exclusive access.
              </p>
            </div>

            {/* Direct Plan Selection */}
            {!hasActiveSub ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plans?.map((plan) => (
                  <div key={plan.id} className="p-6 bg-studio-grey border border-white/10 flex flex-col gap-6 hover:border-white/20 transition-all rounded-2xl">
                    <div className="space-y-1">
                       <h4 className="text-xl font-black uppercase italic tracking-tighter text-white">{plan.name}</h4>
                       <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">
                         {plan.credits_per_month} Credits / Month
                       </p>
                    </div>
                    
                    <div className="text-left">
                       <span className="text-3xl font-black tracking-tighter">₹{plan.price_inr}</span>
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">/ month</span>
                    </div>

                    <SubscribeButton 
                      planId={plan.id} 
                      planName="JOIN NOW"
                      isFeatured={plan.name === 'Professional'}
                      mode="subscription"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-studio-grey border border-white/10 rounded-2xl inline-block">
                <p className="text-xl font-black italic text-white mb-2">You are already a Pro Subscriber!</p>
                <Link href="/profile" className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-2">
                  View My Account <ArrowRight size={10} />
                </Link>
              </div>
            )}

            <div className="pt-4">
               <Link href="/subscription" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all flex items-center gap-2">
                  See all plans & pricing <ArrowRight size={12} />
               </Link>
            </div>
          </div>

          {/* ➡️ RIGHT: VISUAL_CARD_STACK */}
          <div className="relative h-full flex items-center justify-center py-10">
             {/* 🎚️ THE_PREMIUM_CARD */}
             <div className="w-full max-w-md bg-[#0a0a0a] border-2 border-white/10 p-10 shadow-3xl relative z-20 group rounded-[2.5rem]">
                <div className="flex justify-between items-center mb-16">
                   <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black font-black italic shadow-[0_0_30px_rgba(255,255,255,0.2)]">SW</div>
                   <div className="px-4 py-1.5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors rounded-full">Pro Member</div>
                </div>

                <div className="space-y-10">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Signal Status: <span className="text-white">Active</span></p>
                      <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none">STUDIO PRO</h3>
                   </div>

                   <div className="h-1.5 w-full bg-white/5 relative rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-white w-[85%]" />
                   </div>

                   <div className="flex justify-between items-end pt-8">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">MEMBER SINCE</p>
                         <p className="text-2xl font-black italic tracking-tighter text-white">2024</p>
                      </div>
                      <div className="h-12 w-20 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-lg" />
                   </div>
                </div>
             </div>

             {/* Background Floating Elements */}
             <div className="absolute top-1/4 right-0 w-32 h-32 bg-white/5 border border-white/5 rotate-45 -z-10 blur-sm" />
             <div className="absolute bottom-1/4 left-10 w-24 h-24 bg-white/10 rounded-full -z-10 blur-xl h-24" />
          </div>

        </div>
      </div>
    </section>
  )
}
