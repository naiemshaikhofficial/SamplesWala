
'use client'

import { 
  User, Settings as SettingsIcon, ShieldCheck, Zap, 
  History, LogOut, Database, Cpu, Activity, Mail, Trash2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CancelSubscriptionButton } from '@/components/CancelSubscriptionButton'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'purchases' | 'subscription'>('profile')
  const [account, setAccount] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return (window.location.href = '/auth/login')
      
      setUser(user)

      const { data } = await supabase
        .from('user_accounts')
        .select(`
            *,
            subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .maybeSingle()
      
      setAccount(data)
      setLoading(false)
    }
    init()
  }, [supabase])

  if (loading) return (
    <div className="min-h-screen bg-studio-charcoal flex items-center justify-center">
        <Activity className="animate-spin text-studio-neon" />
    </div>
  )

  const status = account?.subscription_status?.toUpperCase() || 'INACTIVE'
  const hasSubId = account?.razorpay_subscription_id !== null && account?.razorpay_subscription_id !== undefined
  
  // 🔬 DETECT_PLAN: Prioritize Tier, then mapped Plan Name, fallback to STARTER if SubID exists
  let planName = (account?.subscription_tier && account.subscription_tier !== 'NONE') ? account.subscription_tier.toUpperCase() : (account?.subscription_plans?.name?.toUpperCase() || 'FREE')
  if (planName === 'FREE' && hasSubId) planName = 'STARTER (ACTIVE)'

  const isActive = (planName !== 'FREE' && status !== 'INACTIVE') || hasSubId
  
  // 🔭 DYNAMIC_CREDIT_MAPPING
  const creditsPerMonth = account?.subscription_plans?.credits || (planName.includes('STARTER') ? 100 : planName === 'PRODUCER' ? 500 : planName === 'PROFESSIONAL' ? 1000 : 0)
  const currentCredits = account?.credits || 0

  return (
    <div className="min-h-screen bg-studio-charcoal text-white pt-24 md:pt-32 pb-24 relative overflow-hidden font-mono selection:bg-studio-neon selection:text-black">
        {/* 🧬 BACKGROUND_GRID */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} 
        />

        <div className="w-full px-8 md:px-12 relative z-10 max-w-[1920px]">
            {/* 🏷️ HEAD_SIGNAL */}
            <div className="mb-16 md:mb-20 text-center">
                <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-sm bg-black border border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon mb-6">
                    <SettingsIcon size={10} /> SETTINGS
                </div>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-6">
                    ACCOUNT <span className="text-white/10 italic">SETTINGS</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                
                {/* 🕹️ NAVIGATION_TAB (Dynamic Selection Rack) */}
                <div className="md:col-span-3 space-y-2">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-widest italic rounded-sm border transition-all ${activeTab === 'profile' ? 'bg-studio-neon text-black border-studio-neon shadow-lg' : 'bg-white/5 text-white/40 border-transparent hover:text-white hover:bg-white/10'}`}
                    >
                        <User size={14} /> My Profile
                    </button>
                    <Link href="/library" className="w-full flex items-center gap-4 px-4 py-4 bg-white/5 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest italic rounded-sm border border-transparent hover:border-white/10 transition-all">
                        <History size={14} /> Purchases
                    </Link>
                    <button 
                        onClick={() => setActiveTab('subscription')}
                        className={`w-full flex items-center gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-widest italic rounded-sm border transition-all ${activeTab === 'subscription' ? 'bg-studio-neon text-black border-studio-neon shadow-lg' : 'bg-white/5 text-white/40 border-transparent hover:text-white hover:bg-white/10'}`}
                    >
                        <Zap size={14} /> Subscription
                    </button>
                    
                    <div className="pt-8 mt-8 border-t border-white/5">
                        <Link href="/auth/logout" className="w-full flex items-center gap-4 px-4 py-3 bg-red-950/20 text-red-500/60 hover:text-white hover:bg-red-500 text-[9px] font-black uppercase tracking-widest italic rounded-sm transition-all text-center">
                            <LogOut size={12} /> Logout
                        </Link>
                    </div>
                </div>

                {/* 📡 CONTENT_TERMINAL */}
                <div className="md:col-span-9">
                    
                    {activeTab === 'profile' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="group">
                                <div className="flex items-center gap-3 mb-8 text-white/10">
                                    <User size={16} />
                                    <h2 className="text-sm font-black uppercase tracking-[0.3em] italic">Profile Info</h2>
                                    <div className="h-px flex-1 bg-white/5" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-8 bg-black/40 border border-white/5 rounded-sm">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block italic">Email Address</span>
                                        <div className="flex items-center justify-between font-black text-sm tracking-tight text-white/80">
                                            {user.email}
                                            <ShieldCheck size={14} className="text-studio-neon" />
                                        </div>
                                    </div>
                                    <div className="p-8 bg-black/40 border border-white/5 rounded-sm">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block italic">Display Name</span>
                                        <div className="text-sm font-black tracking-tight text-white/60 uppercase">
                                            {account?.full_name || user.user_metadata?.full_name || 'MEMBER'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                            {activeTab === 'subscription' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="group">
                                <div className="flex items-center gap-3 mb-8 text-white/10">
                                    <Zap size={16} />
                                    <h2 className="text-sm font-black uppercase tracking-[0.3em] italic">Subscription Details</h2>
                                    <div className="h-px flex-1 bg-white/5" />
                                </div>

                                <div className="p-10 bg-black/60 border-2 border-white/5 rounded-sm relative overflow-hidden">
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                        <div className="space-y-10">
                                            <div>
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block italic mb-6">Current Plan</span>
                                                <div className="flex items-center gap-6">
                                                    <div className={`h-16 w-16 rounded-sm flex items-center justify-center border-2 ${isActive ? 'bg-studio-neon/10 border-studio-neon text-studio-neon shadow-2xl pulse-glow' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                                        <ShieldCheck size={32} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white leading-none mb-2">
                                                            {planName}
                                                        </h3>
                                                        <div className="space-y-1">
                                                            <p className="text-[11px] font-black text-studio-neon uppercase tracking-[0.4em] italic leading-none">
                                                                {currentCredits} AVAILABLE CREDITS
                                                            </p>
                                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none">
                                                                STATUS: {isActive ? 'ACTIVE' : 'INACTIVE'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-8 border-t border-white/5">
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block italic mb-2">Billing Details</span>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-white/2 border border-white/5 rounded-sm">
                                                        <span className="text-[8px] font-black text-studio-neon uppercase tracking-widest block mb-2 italic">Account Created</span>
                                                        <p className="text-[10px] font-black uppercase text-white/60 tracking-tighter">
                                                            {account?.updated_at ? new Date(account.updated_at).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="p-4 bg-white/2 border border-white/5 rounded-sm">
                                                        <span className="text-[8px] font-black text-studio-neon uppercase tracking-widest block mb-2 italic">Next Billing</span>
                                                        <p className="text-[10px] font-black uppercase text-white/60 tracking-tighter">
                                                            {account?.next_billing ? new Date(account.next_billing).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : 'NO PENDING ACTION'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 pt-4 text-white/50">
                                                    {[
                                                        { label: `${creditsPerMonth} Monthly Credits`, icon: <Activity size={12} /> },
                                                        { label: `Tier: ${planName}`, icon: <Database size={12} /> },
                                                        { label: 'Full Access To Sound Library', icon: <Cpu size={12} /> },
                                                        { label: '100% Royalty-Free License', icon: <ShieldCheck size={12} /> }
                                                    ].map((perk, i) => (
                                                        <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase text-white/60 italic">
                                                            <div className="text-studio-neon">{perk.icon}</div>
                                                            {perk.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <Link href="/pricing" className="w-full py-6 bg-white text-black text-center text-[10px] font-black uppercase tracking-[0.4em] hover:bg-studio-neon transition-all italic rounded-sm shadow-2xl flex items-center justify-center">
                                                UPGRADE MEMBERSHIP
                                            </Link>
                                            
                                            {isActive ? (
                                                <div className="space-y-4 pt-6 border-t border-white/5">
                                                    <div className="p-5 bg-red-950/10 border border-red-500/20 rounded-sm">
                                                        <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-red-500 leading-relaxed italic">
                                                            Warning: Stopping membership will stop your monthly credits.
                                                        </p>
                                                    </div>
                                                    <CancelSubscriptionButton />
                                                </div>
                                            ) : (
                                                <div className="pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-center italic">
                                                    NO ACTIVE MEMBERSHIP
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 🧬 Decorative background element */}
                                    <div className="absolute -right-10 -bottom-10 opacity-[0.03] pointer-events-none scale-150 rotate-12">
                                        <Database size={300} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}
