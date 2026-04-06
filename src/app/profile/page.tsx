import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, CreditCard, Clock, ShieldCheck, ArrowRight, Music, Disc, MapPin } from 'lucide-react'
import { BillingSettings } from '@/components/profile/BillingSettings'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // 💿 FETCH ACCOUNT ARCHIVE
    const { data: activeSub } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .maybeSingle()

    const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const { count: unlockedCount } = await supabase
        .from('unlocked_samples')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20">
            {/* 🎰 THE PROFILE HEADER */}
            <header className="border-b border-white/10 px-6 md:px-20 py-24 bg-black">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                    <div className="max-w-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 block">Security Profile — पहचान</span>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4 italic italic">{user.user_metadata?.full_name || 'Agent Producer'}</h1>
                        <p className="text-white/20 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                             Connected: {user.email} <div className="h-1 w-1 bg-white/20 rounded-full" /> Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </header>

            <main className="px-6 md:px-20 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* 🔌 1. MEMBERSHIP HUB */}
                    <div className="lg:col-span-2 space-y-12">
                        
                        {/* ⚡ CREDIT DASHBOARD */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="p-10 border border-white/10 bg-white/[0.02] space-y-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block">Active Currency</span>
                                <div className="flex items-baseline gap-4">
                                    <h2 className="text-6xl font-black italic tracking-tighter">{activeSub?.current_credits || 0}</h2>
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Credits Available</span>
                                </div>
                                <Link href="/pricing" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-studio-yellow transition-colors">
                                    Top up artifact balance <ArrowRight className="h-3 w-3" />
                                </Link>
                             </div>

                             <div className="p-10 border border-white/10 bg-white/[0.02] space-y-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block">Membership Status</span>
                                <div className="flex items-center gap-4">
                                    <ShieldCheck className={`h-8 w-8 ${activeSub?.plan_id ? 'text-studio-yellow' : 'text-white/10'}`} />
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">{activeSub?.subscription_plans?.name || 'FREE AGENT'}</h2>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{activeSub?.plan_id ? 'ACCESS SECURED' : 'UNRESTRICTED ACCESS NEEDED'}</span>
                                    </div>
                                </div>
                                <Link href="/pricing" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-studio-yellow transition-colors">
                                    Manage Artifact Access <ArrowRight className="h-3 w-3" />
                                </Link>
                             </div>
                        </div>

                        {/* 🏛️ 3. BILLING & COMPLIANCE HUD */}
                        <BillingSettings initialData={activeSub} userId={user.id} />

                        {/* 📜 TRANSACTION LOG */}
                        <div className="space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Transmission History — लेन-देन</h3>
                            <div className="border border-white/5 divide-y divide-white/10">
                                {purchases && purchases.length > 0 ? (
                                    purchases.map((purchase) => (
                                        <div key={purchase.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="h-10 w-10 flex items-center justify-center border border-white/10">
                                                    <CreditCard className="h-4 w-4 text-white/20" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest">{purchase.item_name}</h4>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">{new Date(purchase.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[11px] font-black text-white italic tracking-tighter">₹{purchase.amount}</div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Captured</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-16 text-center text-white/10 text-[10px] font-black uppercase tracking-widest italic">
                                        No artifacts captured yet. — कोई डेटा नहीं
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 🛡️ 2. QUICK ACTIONS SIDEBAR */}
                    <div className="space-y-12">
                         <div className="p-10 border border-white/10 bg-white/[0.02] space-y-8">
                             <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Secured Library</span>
                                <div className="flex items-center gap-4">
                                     <Disc className="h-8 w-8 text-white/10" />
                                     <h2 className="text-3xl font-black italic tracking-tighter">{unlockedCount || 0}</h2>
                                     <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Artifacts Unlock'd</span>
                                </div>
                             </div>
                             
                             <Link href="/library" className="flex items-center justify-between p-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">
                                 Enter Archive <Music className="h-4 w-4" />
                             </Link>
                         </div>

                         <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">Quick Signals</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <Link href="/browse" className="p-4 border border-white/5 hover:bg-white/[0.05] transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-between">
                                    Browse Vault <ArrowRight className="h-3 w-3" />
                                </Link>
                                <Link href="/license" className="p-4 border border-white/5 hover:bg-white/[0.05] transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-between text-white/40">
                                    Legal Registry <ArrowRight className="h-3 w-3" />
                                </Link>
                                <form action="/auth/logout" method="POST">
                                    <button type="submit" className="w-full text-left p-4 border border-white/5 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-between text-white/20">
                                        Disconnect Signal <ArrowRight className="h-3 w-3" />
                                    </button>
                                </form>
                            </div>
                         </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
