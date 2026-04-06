'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { 
  Folder, FolderOpen, Search, Keyboard, Mic2, Cable, Cloud, Save, Key, UserCheck, 
  Layout, FileJson, Cpu as CpuIcon, Sparkles, Timer, Disc, Music, Settings2, Power, Layers, Zap
} from 'lucide-react'

const sidebarGroups = [
  {
    label: "Navigation",
    items: [
      { id: 'all', label: 'All Artifacts', icon: <Layout className="w-3 h-3" /> },
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
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter');

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r-4 border-black hidden lg:flex flex-col z-[70] bg-[#1a1a1a] shadow-2xl overflow-hidden">
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
                  }`}
                >
                    <Folder size={12} />
                    <span className="text-[7px] font-black uppercase tracking-tighter">{tab}</span>
                </Link>
            ))}
        </div>

        {/* Browser Search Input */}
        <div className="p-3 bg-[#1e1e1e] border-b border-black">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-black border border-white/5 rounded-sm">
                <Search size={12} className="text-white/40" />
                <input 
                  type="text" 
                  placeholder="SEARCH_CATALOG :: INPUT_REQUEST..." 
                  className="bg-transparent border-none text-[9px] w-full focus:ring-0 placeholder:text-white/10 uppercase font-black focus:outline-none"
                />
            </div>
        </div>

        {/* Tree Structure */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
            {sidebarGroups.map((group, gIdx) => (
              <div key={group.label} className="space-y-1">
                  <div className="px-2 py-1 flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{group.label}</span>
                    <div className="h-px flex-1 bg-white/5"></div>
                  </div>
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/browse?filter=${item.id}`}
                      className={`flex items-center gap-3 px-3 py-1.5 text-[10px] font-bold transition-all hover:bg-white/5 group border-l-2 ${
                        currentFilter === item.id 
                        ? 'border-studio-neon bg-white/10 text-white' 
                        : 'border-transparent text-white/40 hover:text-white'
                      }`}
                    >
                      <span className={`${currentFilter === item.id ? 'text-studio-neon' : 'text-white/20 group-hover:text-studio-neon'}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  ))}
              </div>
            ))}
        </div>

        {/* Console Health Monitor */}
        <div className="p-4 bg-black/40 border-t border-black space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Power className="w-3 h-3 text-studio-neon" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/60">MASTER_IO</span>
              </div>
              <span className="text-[8px] font-black text-studio-neon opacity-70">ACTIVE</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[7px] font-black text-white/30">
                <span>CPU_LOAD</span>
                <span>12%</span>
              </div>
              <div className="h-1 bg-white/5 overflow-hidden">
                <div className="h-full bg-studio-neon w-[12%]" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[7px] font-black text-white/30">
                <span>MEM_UNIT</span>
                <span>2.4GB</span>
              </div>
              <div className="h-1 bg-white/5 overflow-hidden">
                <div className="h-full bg-studio-yellow w-[35%]" />
              </div>
            </div>
        </div>
    </aside>
  )
}
