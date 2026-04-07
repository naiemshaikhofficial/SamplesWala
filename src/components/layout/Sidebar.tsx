'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { 
  Folder, FolderOpen, Search, Keyboard, Mic2, Cable, Cloud, Save, Key, UserCheck, 
  Layout, FileJson, Cpu as CpuIcon, Sparkles, Timer, Disc, Music, Settings2, Power, Layers, Zap, Activity,
  Menu, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import { SignalMeter } from '@/components/ui/DAWVisualizer'
import { useSidebar } from './SidebarContext'
import { createClient } from '@/lib/supabase/client'

const iconMap: any = {
  'melodies': <Music className="w-3 h-3" />,
  'drums': <Disc className="w-3 h-3" />,
  'vocals': <Mic2 className="w-3 h-3" />,
  'presets': <Settings2 className="w-3 h-3" />,
  'fx': <Zap className="w-3 h-3" />,
  'loops': <Activity className="w-3 h-3" />,
  'one-shots': <Layers className="w-3 h-3" />,
}

const sidebarGroups = [
  {
    label: "Navigation",
    items: [
      { id: 'all', label: 'All Sounds', icon: <Layout className="w-3 h-3" /> },
      { id: 'packs', label: 'Sound Packs', icon: <Disc className="w-3 h-3" /> },
      { id: 'trending', label: 'Trending', icon: <Sparkles className="w-3 h-3" /> },
      { id: 'bundles', label: 'Bundles', icon: <Layers className="w-3 h-3" /> },
    ]
  },
  {
    label: "Sample_Library",
    items: [
      { id: 'melodies', label: 'Melodies', icon: <Music className="w-3 h-3" /> },
      { id: 'drums', label: 'Drums_Perc', icon: <Disc className="w-3 h-3" /> },
      { id: 'vocals', label: 'Vocals_FX', icon: <Mic2 className="w-3 h-3" /> },
      { id: 'presets', label: 'Serum_Presets', icon: <Settings2 className="w-3 h-3" /> },
    ]
  },
  {
    label: "User_Archive",
    items: [
      { id: 'library', label: 'My_Library', icon: <Folder className="w-3 h-3" /> },
      { id: 'purchases', label: 'Purchases', icon: <Timer className="w-3 h-3" /> },
      { id: 'favorites', label: 'Favorites', icon: <Sparkles className="w-3 h-3" /> },
    ]
  },
  {
    label: "System_Node",
    items: [
      { id: 'subscription', label: 'Active_Plan', icon: <Zap className="w-3 h-3 text-studio-yellow" /> },
      { id: 'credits', label: 'My_Credits', icon: <Key className="w-3 h-3" /> },
      { id: 'license', label: 'License_Log', icon: <UserCheck className="w-3 h-3" /> },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter');
  const currentCategory = searchParams.get('category');
  const currentSearch = searchParams.get('q') || '';
  
  const { isOpen, toggle } = useSidebar();
  const [searchVal, setSearchVal] = useState(currentSearch);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [creditCount, setCreditCount] = useState<number | null>(null);
  const supabase = createClient();

  // 🛡️ AUTH_SIGNAL & CREDIT TELEMETRY
  useEffect(() => {
    const fetchCredits = async (uid: string) => {
        const { data } = await supabase.from('user_accounts').select('credits').eq('user_id', uid).single();
        if (data) setCreditCount(data.credits);
    }

    const checkUser = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        if (currentUser) fetchCredits(currentUser.id);
    }
    checkUser();

    // Live Credit Mirroring
    const accountSubscription = supabase
        .channel('public:user_accounts')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_accounts' }, (payload: any) => {
            if (user && payload.new.user_id === user.id) {
                setCreditCount(payload.new.credits);
            }
        })
        .subscribe();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) fetchCredits(currentUser.id);
        else setCreditCount(null);
    });

    return () => {
        authListener.subscription.unsubscribe();
        supabase.removeChannel(accountSubscription);
    }
  }, [supabase, user?.id]);

  // Fetch Categories from DB
  useEffect(() => {
    const fetchCats = async () => {
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data) setDbCategories(data);
    }
    fetchCats();
  }, [supabase]);

  // Update local search state when URL changes
  useEffect(() => {
    setSearchVal(currentSearch);
  }, [currentSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal) {
      params.set('q', searchVal);
    } else {
      params.delete('q');
    }
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <aside className={`fixed left-0 top-0 h-screen border-r-4 border-black hidden lg:flex flex-col z-[70] bg-[#1a1a1a] shadow-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
        {/* Toggle Button Inside Sidebar (Optional, maybe in Header is better but let's put it here too) */}
        <div className="absolute right-2 top-[50%] -translate-y-1/2 z-[80] hidden xl:block">
           <button 
             onClick={toggle}
             className="w-6 h-12 bg-black border border-white/10 flex items-center justify-center hover:bg-studio-neon hover:text-black transition-all group"
           >
              {isOpen ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
           </button>
        </div>
        {/* Browser Tabs */}
        <div className="bg-[#111] grid grid-cols-4 gap-px border-b border-black">
            {['All', 'Packs', 'Library', 'Star'].map((tab, i) => (
                <Link 
                  href={`/browse?mode=${tab.toLowerCase()}`}
                  key={tab} 
                  className={`py-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    (pathname.includes(tab.toLowerCase()) || (!currentFilter && tab === 'All')) 
                    ? 'bg-studio-grey text-white border-t-2 border-studio-neon' 
                    : 'text-white/20 hover:text-white/40'
                  } ${!isOpen ? 'px-1' : ''}`}
                >
                    <Folder size={12} />
                    {isOpen && <span className="text-[7px] font-black uppercase tracking-tighter">{tab}</span>}
                </Link>
            ))}
        </div>

        {/* Browser Search Input */}
        <div className="p-3 bg-[#1e1e1e] border-b border-black">
            <form onSubmit={handleSearch} className="flex items-center gap-2 px-2 py-1.5 bg-black border border-white/5 rounded-sm">
                <Search size={12} className="text-white/40 shrink-0" />
                {isOpen ? (
                    <input 
                    type="text" 
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="SEARCH_CATALOG :: ..." 
                    className="bg-transparent border-none text-[9px] w-full focus:ring-0 placeholder:text-white/10 uppercase font-black focus:outline-none"
                    />
                ) : (
                   <div className="w-full h-4" />
                )}
            </form>
        </div>

        {/* Tree Structure */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
            {/* Dynamic Navigation Group */}
            <div className="space-y-1">
                {isOpen && (
                <div className="px-2 py-1 flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Menu</span>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>
                )}
                {[
                    { id: 'all', label: 'All Sounds', icon: <Layout className="w-3 h-3" />, href: '/browse' },
                    { id: 'packs', label: 'Sound Packs', icon: <Disc className="w-3 h-3" />, href: '/browse?mode=packs' },
                    { id: 'trending', label: 'Trending', icon: <Sparkles className="w-3 h-3" />, href: '/browse?filter=trending' },
                    { id: 'bundles', label: 'Bundles', icon: <Layers className="w-3 h-3" />, href: '/browse?filter=bundles' },
                ].map((item) => (
                <Link
                    key={item.id}
                    href={item.href}
                    className={`flex flex-col gap-1 p-2 text-[10px] font-black uppercase tracking-tighter transition-all hover:bg-white/5 group border-l-2 ${
                    (pathname === item.href || currentFilter === item.id) 
                    ? 'border-studio-neon bg-white/10 text-white' 
                    : 'border-transparent text-white/40 hover:text-white'
                    } ${!isOpen ? 'items-center border-l-0 border-b-2' : ''}`}
                >
                    <div className="flex items-center gap-3">
                    <span className="text-white/20 group-hover:text-studio-neon">
                        {item.icon}
                    </span>
                    {isOpen && item.label}
                    </div>
                </Link>
                ))}
            </div>

            {/* Dynamic DB Categories Group */}
            <div className="space-y-1">
                {isOpen && (
                <div className="px-2 py-1 flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Library</span>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>
                )}
                {!isOpen && <div className="h-px bg-white/5 my-2" />}
                {dbCategories.map((cat) => (
                <Link
                    key={cat.id}
                    href={`/browse?category=${cat.id}`}
                    title={!isOpen ? cat.name : undefined}
                    className={`flex flex-col gap-1 p-2 text-[10px] font-black uppercase tracking-tighter transition-all hover:bg-white/5 group border-l-2 ${
                    currentCategory === cat.id 
                    ? 'border-studio-neon bg-white/10 text-white' 
                    : 'border-transparent text-white/40 hover:text-white'
                    } ${!isOpen ? 'items-center border-l-0 border-b-2' : ''}`}
                >
                    <div className="flex items-center gap-3">
                    <span className={`${currentCategory === cat.id ? 'text-studio-neon' : 'text-white/20 group-hover:text-studio-neon'}`}>
                        {iconMap[cat.name.toLowerCase()] || <Music className="w-3 h-3" />}
                    </span>
                    {isOpen && cat.name}
                    </div>

                    {isOpen && (
                    <div className="mt-1 ml-6 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none scale-y-50 origin-top">
                        <SignalMeter className="h-1.5 w-full" />
                    </div>
                    )}
                </Link>
                ))}
            </div>

            {/* Static User/System Sections */}
            <div className="space-y-1">
                {isOpen && (
                <div className="px-2 py-1 flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">My Account</span>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>
                )}
                {[
                    { id: 'library', label: 'Your_Library', icon: <Folder className="w-3 h-3" />, href: '/library' },
                    { id: 'profile', label: 'My_Account', icon: <UserCheck className="w-3 h-3" />, href: '/profile' },
                ].map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`flex flex-col gap-1 p-2 text-[10px] font-black uppercase tracking-tighter transition-all hover:bg-white/5 group border-l-2 border-transparent text-white/40 hover:text-white ${!isOpen ? 'items-center border-l-0 border-b-2' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-white/20 group-hover:text-studio-neon">{item.icon}</span>
                            {isOpen && item.label}
                        </div>
                    </Link>
                ))}

                {/* 🧧 LIVE_CREDIT_METER */}
                {user && (
                    <div className={`p-2 transition-all ${!isOpen ? 'bg-studio-yellow/5 border-b-2 border-studio-yellow/20' : ''}`}>
                         <div className={`flex items-center gap-3 p-2 bg-studio-yellow/5 border-2 border-studio-yellow/10 rounded-sm group hover:border-studio-yellow/40 transition-all ${!isOpen ? 'border-none bg-transparent justify-center' : ''}`}>
                            <Key size={12} className="text-studio-yellow animate-pulse" />
                            {isOpen ? (
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-studio-yellow leading-none uppercase">Available Credits</span>
                                    <span className="text-[8px] font-black text-white/40 mt-1 uppercase tracking-widest">{creditCount !== null ? `${creditCount} TOKENS` : 'FETCHING...'}</span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-black text-studio-yellow">{creditCount}</span>
                            )}
                         </div>
                    </div>
                )}
            </div>
        </div>

        {/* 🛡️ AUTH_TERMINAL_RACK */}
        <div className={`p-4 mt-auto border-t border-black bg-black/20 flex flex-col gap-2 transition-all duration-300 ${!isOpen ? 'px-1' : ''}`}>
            {user ? (
                <button 
                    onClick={async () => {
                        if (window.confirm("Are you sure you want to LOGOUT?")) {
                            const { error } = await supabase.auth.signOut();
                            if (error) console.error("SHUTDOWN_ERROR:", error);
                            router.refresh();
                            router.push('/auth/login');
                        }
                    }}
                    title="LOGOUT"
                    className={`w-full flex items-center justify-center py-4 bg-red-950/20 border-2 border-red-900/30 hover:bg-red-600 hover:text-black hover:border-red-400 transition-all group rounded-sm shadow-[0_0_30px_rgba(153,27,27,0.1)]`}
                >
                    <Power className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                    {isOpen && <span className="ml-3 text-[10px] font-black uppercase tracking-[0.2em]">LOGOUT</span>}
                </button>
            ) : (
                <div className="flex flex-col gap-2">
                    <Link 
                        href="/auth/login"
                        title="LOGIN"
                        className={`w-full flex items-center justify-center py-3 bg-studio-neon/10 border-2 border-studio-neon/20 hover:bg-studio-neon hover:text-black transition-all group rounded-sm`}
                    >
                        <Key className={`w-4 h-4 transition-transform group-hover:rotate-45`} />
                        {isOpen && <span className="ml-2 text-[10px] font-black uppercase tracking-[0.2em]">LOGIN</span>}
                    </Link>
                    <Link 
                        href="/auth//signup"
                        title="SIGNUP"
                        className={`w-full flex items-center justify-center py-3 bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all group rounded-sm`}
                    >
                        <UserCheck className={`w-4 h-4 transition-transform group-hover:scale-110`} />
                        {isOpen && <span className="ml-2 text-[10px] font-black uppercase tracking-[0.2em]">SIGNUP</span>}
                    </Link>
                </div>
            )}
        </div>
    </aside>
  )
}
