
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  User, Settings as SettingsIcon, ShieldCheck, CreditCard, 
  History, Bell, ShieldAlert, ArrowLeft, Activity, Database,
  Cpu, Zap, Key, UserCheck, LogOut
} from 'lucide-react'
import { CancelSubscriptionButton } from '@/components/CancelSubscriptionButton'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/settings')
  }

  // 📀 Fetch Account State
  const { data: account } = await supabase
    .from('user_accounts')
    .select('*, subscription_plans(*)')
    .eq('user_id', user.id)
    .maybeSingle()

  const isActive = account?.subscription_status === 'ACTIVE'
  const planName = account?.subscription_plans?.name || 'FREE'

  return (
    <div className="min-h-screen bg-studio-charcoal text-white pt-24 md:pt-32 pb-24 relative overflow-hidden font-mono selection:bg-studio-neon selection:text-black">
        {/* 🧬 BACKGROUND_GRID (Musician Precision) */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} 
        />

        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            {/* 🏷️ HEAD_SIGNAL */}
            <div className="mb-16 md:mb-20">
                <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-sm bg-black border border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon mb-6 animate-pulse">
                    <Activity size={10} /> SETTINGS :: PROFILE_TERMINAL
                </div>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-6">
                    USER <span className="text-white/10">PREFERENCES</span>
                </h1>
                <p className="text-xs md:text-lg text-white/30 font-black uppercase tracking-widest italic max-w-2xl">
                    Configure your studio identity and manage your artifact allocation signals.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                
                {/* 🕹️ 1. SIDE_NAVIGATION_TAB */}
                <div className="md:col-span-3 space-y-2">
                    <button className="w-full flex items-center gap-4 px-4 py-4 bg-studio-neon text-black text-[10px] font-black uppercase tracking-widest italic rounded-sm border border-studio-neon">
                        <User size={14} /> Account Info
                    </button>
                    <Link href="/library" className="w-full flex items-center gap-4 px-4 py-4 bg-white/5 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest italic rounded-sm border border-transparent hover:border-white/10 transition-all">
                        <History size={14} /> Usage History
                    </Link>
                    <button className="w-full flex items-center gap-4 px-4 py-4 bg-white/5 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest italic rounded-sm border border-transparent hover:border-white/10 transition-all opacity-40 cursor-not-allowed">
                        <Bell size={14} /> Notifications
                    </button>
                </div>

                {/* 📡 2. MAIN_SETTINGS_CONSOLE */}
                <div className="md:col-span-9 space-y-12">
                    
                    {/* SECTION: IDENTITY */}
                    <div className="group">
                        <div className="flex items-center gap-3 mb-8 text-white/10 group-hover:text-studio-neon transition-colors">
                            <Cpu size={16} />
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] italic">Identity_Matrix</h2>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-black/40 border border-white/5 rounded-sm group-hover:border-white/10 transition-all">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Email Address</span>
                                <div className="flex items-center justify-between font-black text-xs md:text-sm tracking-tight text-white/80">
                                    {user.email}
                                    <ShieldCheck size={14} className="text-studio-neon" />
                                </div>
                            </div>
                            <div className="p-6 bg-black/40 border border-white/5 rounded-sm group-hover:border-white/10 transition-all">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Display Name</span>
                                <div className="text-xs md:text-sm font-black tracking-tight text-white/60">
                                    {user.user_metadata?.full_name || 'Anonymous Producer'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: COMMERCE (Moved from Pricing) */}
                    <div className="group">
                        <div className="flex items-center gap-3 mb-8 text-white/10 group-hover:text-studio-yellow transition-colors">
                            <Zap size={16} />
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] italic">Membership_Management</h2>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>

                        <div className="p-8 bg-black/60 border-2 border-white/5 rounded-sm group-hover:border-white/10 transition-all relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 block">ACTIVE_MEMBERSHIP</span>
                                    <div className="flex items-center gap-6">
                                        <div className={`h-12 w-12 rounded-sm flex items-center justify-center border-2 ${isActive ? 'bg-studio-neon/10 border-studio-neon text-studio-neon shadow-[0_0_20px_rgba(166,226,46,0.2)]' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white leading-none mb-2">
                                                {planName} PLAN
                                            </h3>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic">
                                                {isActive ? 'STATUS :: SYNCHRONIZED & ACTIVE' : 'STATUS :: FREE_TIER_IDLE'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 min-w-[240px]">
                                    <Link href="/pricing" className="w-full py-4 bg-white text-black text-center text-[10px] font-black uppercase tracking-[0.4em] hover:bg-studio-neon transition-all italic rounded-sm shadow-xl">
                                        UPGRADE MEMBERSHIP
                                    </Link>
                                    
                                    {isActive && (
                                        <div className="mt-2 pt-6 border-t border-white/5">
                                            <CancelSubscriptionButton />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                <Database size={200} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: TERMINATE_SESSION (Simple Logout) */}
                    <div className="pt-12 border-t border-white/5">
                        <Link 
                            href="/auth/logout"
                            className="inline-flex items-center gap-4 px-8 py-4 bg-red-950/20 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] italic rounded-sm transition-all"
                        >
                            <LogOut size={16} /> Relinquish Identity (Logout)
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    </div>
  )
}
