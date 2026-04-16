import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
    CreditCard, Clock, ShieldCheck, ArrowRight, 
    Music, Disc, MapPin, Activity, Cpu, LogOut, 
    Phone, Mail, Calendar, Zap, AlertTriangle, Settings2, BarChart3, Database
} from 'lucide-react'
import { BillingSettings } from '@/components/profile/BillingSettings'
import { CancelSubscriptionButton } from '@/components/CancelSubscriptionButton'
import { SignalMeter, DAWVisualizer } from '@/components/ui/DAWVisualizer'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // 💿 DAW CONSOLE ARCHIVE (Multi-Node Sync)
    const [
        { data: account }, 
        { data: purchases }, 
        { count: unlockedCount }
    ] = await Promise.all([
        supabase.from('user_accounts').select('*, subscription_plans(*)').eq('user_id', user.id).maybeSingle(),
        supabase.from('purchases').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('unlocked_samples').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ])

    const totalCredits = account?.credits ?? 0
    const activePlan = account?.subscription_plans
    const planName = (activePlan as any)?.name || 'FREE'
    const expiryDate = account?.next_billing ? new Date(account.next_billing).toLocaleDateString() : 'PERPETUAL'
    const isCancelled = account?.subscription_status === 'CANCELED'
    const hasActiveSub = !!account?.plan_id && account?.subscription_status !== 'INACTIVE'

    return (
        <div className="min-h-screen bg-studio-charcoal text-white selection:bg-studio-neon selection:text-black lg:pl-20 font-mono pb-40 relative overflow-hidden">
            
            {/* 🧬 GLOBAL DAW OVERLAYS (Immersive Layer) */}
            <div className="fixed inset-0 pointer-events-none z-50">
                <div className="absolute inset-0 bg-[url('/grid.png')] bg-repeat opacity-[0.03]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-studio-neon/[0.01] to-black/40" />
                <div className="absolute inset-x-0 h-[2px] bg-studio-neon/10 animate-scan" style={{ top: '-10%' }} />
            </div>

            {/* 🎰 HARDWARE HEADER (Master Rack) */}
            <header className="border-b-8 border-black px-6 md:px-20 py-24 bg-[#0a0a0a] relative overflow-hidden group/header">
                {/* 📡 RACK ARTIFACTS */}
                <div className="absolute top-4 left-4 flex gap-2 opacity-20">
                    <div className="h-2 w-2 rounded-full border border-white/40 shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                    <div className="h-2 w-2 rounded-full border border-white/40 shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-20">
                    <div className="h-2 w-2 rounded-full border border-white/40 shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                    <div className="h-2 w-2 rounded-full border border-white/40 shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
                    <div className="max-w-3xl space-y-12">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-black border-2 border-white/5 flex items-center justify-center text-studio-neon shadow-[0_0_30px_rgba(166,226,46,0.1)] group-hover/header:rotate-12 transition-transform duration-500">
                                <Cpu size={32} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-studio-neon flex items-center gap-3">
                                    <Activity className="h-3 w-3 animate-pulse" /> SAMPLESWALA // MY ACCOUNT // {planName}
                                </span>
                                <h1 className="text-5xl md:text-[7rem] font-black uppercase tracking-tighter leading-none italic transform -skew-x-12 origin-left scale-y-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                                    {account?.full_name || user.user_metadata?.full_name || 'MEMBER'}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-widest bg-black/40 px-4 py-2 border border-white/5">
                                <Mail className="h-3 w-3 text-studio-neon" /> {user.email}
                            </div>
                            {account?.phone_number && (
                                <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-widest bg-black/40 px-4 py-2 border border-white/5">
                                    <Phone className="h-3 w-3 text-studio-neon" /> {account.phone_number}
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-widest bg-black/40 px-4 py-2 border border-white/5">
                                <Calendar className="h-3 w-3 text-studio-neon" /> JOINED: {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block bg-black/40 p-6 border-l-4 border-studio-neon/20">
                         <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10 block mb-4">LIVE STATUS</span>
                         <DAWVisualizer color="#a6e22e" bars={24} height={40} />
                    </div>
                </div>
            </header>

            <main className="px-6 md:px-20 py-16 max-w-7xl mx-auto relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    
                    {/* 🔌 THE HARDWARE RACK (Main Grid) */}
                    <div className="lg:col-span-8 space-y-16">
                        
                        {/* ⚡ ACCOUNT CREDITS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                             {/* 🔩 DECORATIVE HARDWARE SIFTER */}
                             <div className="absolute -left-6 top-0 bottom-0 w-2 flex flex-col justify-between py-10 opacity-20 hidden lg:flex">
                                <div className="h-4 w-4 rounded-full border border-white" />
                                <div className="h-4 w-4 rounded-full border border-white" />
                                <div className="h-4 w-4 rounded-full border border-white" />
                             </div>

                             <div className="p-8 border-r-4 border-studio-neon bg-[#121212]/80 backdrop-blur-md space-y-10 relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-2 right-2 opacity-10"><Zap size={40} /></div>
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-studio-neon">ACCOUNT CREDITS</span>
                                    <Database className="h-4 w-4 text-white/20" />
                                </div>
                                <div className="flex items-baseline gap-4 py-4">
                                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white break-all leading-none">{totalCredits}</h2>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">CAPACITY</span>
                                </div>
                                <Link href="/pricing" className="w-full py-5 bg-white text-black text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-studio-neon transition-all">
                                    REFUEL VAULT — टॉप अप <ArrowRight className="h-4 w-4" />
                                </Link>
                             </div>

                             <div className={`p-8 border-r-4 ${hasActiveSub ? 'border-studio-yellow' : 'border-white/10'} bg-[#121212]/80 backdrop-blur-md space-y-10 relative group shadow-2xl`}>
                                <div className="absolute top-2 right-2 opacity-10"><ShieldCheck size={40} /></div>
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-studio-yellow italic">MEMBERSHIP</span>
                                    <span className="text-[8px] font-black text-white/10">ACTIVE STATUS</span>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white underline decoration-studio-neon decoration-2 underline-offset-4 truncate">
                                            {planName} PLAN
                                        </h2>
                                        <div className="flex flex-col gap-3 pt-4 border-t border-white/5 group-hover:border-studio-neon/20 transition-colors">
                                            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-white/40">
                                                <div className={`h-1.5 w-1.5 rounded-full ${hasActiveSub ? 'bg-studio-neon' : 'bg-white/10'}`} /> {hasActiveSub ? 'UNLIMITED LICENSE :: ACTIVE' : 'STANDARD LICENSE :: ACTIVE'}
                                            </div>
                                            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-white/40">
                                                <div className={`h-1.5 w-1.5 rounded-full ${hasActiveSub ? 'bg-studio-neon' : 'bg-white/10'}`} /> {hasActiveSub ? 'HIGH QUALITY (WAV) :: ENABLED' : 'STANDARD QUALITY (MP3)'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        {hasActiveSub ? (
                                            <div className="flex flex-col gap-4">
                                                {!isCancelled && account?.id && <CancelSubscriptionButton />}
                                                {isCancelled && (
                                                    <div className="flex items-center gap-3 text-spider-red text-[9px] font-black uppercase tracking-widest bg-spider-red/5 p-4 border border-spider-red/20 shadow-inner">
                                                        <AlertTriangle size={16} /> MEMBERSHIP IS ENDING SOON
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Link href="/pricing" className="w-full py-5 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest hover:bg-studio-neon hover:text-black transition-all flex items-center justify-center gap-4">
                                                UPGRADE RACK <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* ⚡ BILLING ADDRESS */}
                        <div className="space-y-10 relative">
                             <div className="flex items-center gap-4 px-8 py-2 bg-black/40 border border-white/5 self-start">
                                <MapPin className="h-4 w-4 text-studio-neon animate-pulse" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 italic">BILLING ADDRESS</h3>
                             </div>
                             <BillingSettings initialData={account} userId={user.id} />
                        </div>

                        {/* ⚡ PURCHASE HISTORY */}
                        <div className="space-y-10">
                            <div className="flex items-center gap-4 px-8 py-2 bg-black/40 border border-white/5 self-start">
                                <BarChart3 className="h-4 w-4 text-studio-neon" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 italic">PURCHASE HISTORY</h3>
                            </div>
                            <div className="border border-white/5 divide-y divide-white/5 bg-black/60 rounded-sm overflow-hidden shadow-2xl">
                                {purchases && purchases.length > 0 ? (
                                    purchases.map((purchase) => (
                                        <div key={purchase.id} className="p-8 flex items-center justify-between group hover:bg-studio-neon/[0.02] transition-all">
                                            <div className="flex items-center gap-8">
                                                <div className="h-12 w-12 flex items-center justify-center bg-black border-2 border-white/10 text-white/10 group-hover:border-studio-neon group-hover:text-studio-neon transition-all perspective-sm">
                                                    <CreditCard className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[12px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors flex items-center gap-2">
                                                        {purchase.item_name} <span className="text-[8px] bg-studio-neon/10 px-2 text-studio-neon rounded-full">SUCCESS</span>
                                                    </h4>
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/10 italic">{new Date(purchase.created_at).toLocaleDateString()} // ID: {purchase.id.slice(0,6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[14px] font-black text-white italic tracking-tighter shadow-studio-neon">₹{purchase.amount}</div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-studio-neon brightness-150 flex items-center gap-2 justify-end">
                                                   <div className="h-1 w-1 bg-studio-neon rounded-full animate-ping" /> SAFE PAYMENT
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-32 text-center text-white/10 text-[11px] font-black uppercase tracking-[0.4em] italic bg-[#080808]">
                                        No purchases yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 🛡️ RIGHT CHANNEL: SYSTEM MONITOR */}
                    <div className="lg:col-span-4 space-y-16">
                         <div className="p-12 border-2 border-studio-neon/20 bg-black/80 space-y-12 relative rounded-sm shadow-2xl overflow-hidden group hover:border-studio-neon transition-all">
                             <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-1000 rotate-45">
                                <Disc className="h-60 w-60" />
                             </div>
                             
                             <div className="space-y-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-studio-neon block border-b border-studio-neon/20 pb-4">MY SOUNDS</span>
                                <div className="flex items-center gap-6">
                                     <div className="h-16 w-16 bg-black border-2 border-studio-neon/20 flex items-center justify-center text-studio-neon shadow-[0_0_40px_rgba(166,226,46,0.1)]">
                                        <Music size={28} className="group-hover:animate-bounce" />
                                     </div>
                                     <div>
                                        <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter text-white">{unlockedCount || 0}</h2>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">TOTAL SOUNDS</span>
                                     </div>
                                </div>
                             </div>
                             
                             <Link href="/library" className="w-full py-6 bg-studio-neon text-black text-[12px] font-black uppercase tracking-[0.4em] hover:invert transition-all shadow-[0_20px_60px_rgba(166,226,46,0.4)] flex items-center justify-center gap-4 group/lib">
                                 MY LIBRARY <ArrowRight className="h-5 w-5 group-hover/lib:translate-x-3 transition-transform" />
                             </Link>
                         </div>

                         {/* ⚡ QUICK LINKS */}
                         <div className="space-y-8 bg-[#0a0a0a] p-8 border border-white/5 relative">
                            {/* 🔩 DECOR SCREWS */}
                            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/10" />
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/10" />
                            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-white/10" />
                            <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-white/10" />

                            <span className="text-[9px] font-black uppercase tracking-[0.8em] text-white/10 block mb-6 text-center">QUICK LINKS</span>
                            <div className="grid grid-cols-1 gap-4">
                                <Link href="/browse" className="p-6 bg-black border border-white/5 hover:border-studio-neon transition-all group flex items-center justify-between shadow-lg">
                                    <span className="text-[12px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors flex items-center gap-4">
                                        <Zap size={16} className="text-studio-neon" /> BROWSE CATALOG
                                    </span>
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-studio-neon" />
                                </Link>
                                <Link href="/license" className="p-6 bg-black border border-white/5 hover:border-studio-neon transition-all group flex items-center justify-between shadow-lg">
                                    <span className="text-[12px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors flex items-center gap-4">
                                        <CheckCircle size={16} /> LICENSE AGREEMENT
                                    </span>
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-studio-neon" />
                                </Link>
                                
                                <form action="/api/auth/logout" method="POST" className="block pt-12 mt-4 border-t border-white/10">
                                    <button type="submit" className="w-full p-6 bg-[#1a0000] border-2 border-spider-red/20 text-spider-red hover:bg-spider-red hover:text-white transition-all text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-between group shadow-2xl rounded-sm active:scale-95">
                                         <span>SIGN OUT</span>
                                         <LogOut size={20} className="group-hover:translate-x-3 transition-transform" />
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

function CheckCircle({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
