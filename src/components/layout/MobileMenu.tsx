'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Menu, X, Music, User, Zap, Globe, Mail, 
  Layout, FileJson, Cpu as CpuIcon, Sparkles, Timer, Disc, Settings2, Keyboard, Mic2, Cable, Cloud, Save, Key, UserCheck, Layers, Activity 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

const sidebarGroups = [
  {
    label: "Navigation",
    items: [
      { id: 'all', label: 'All Artifacts', icon: <Layout className="w-5 h-5" /> },
      { id: 'packs', label: 'Sound Packs', icon: <Disc className="w-5 h-5" /> },
      { id: 'trending', label: 'Trending', icon: <Sparkles className="w-5 h-5" /> },
      { id: 'bundles', label: 'Bundles', icon: <Layers className="w-5 h-5" /> },
    ]
  },
  {
    label: "Sample Library",
    items: [
      { id: 'melodies', label: 'Melodies', icon: <Music className="w-5 h-5" /> },
      { id: 'drums', label: 'Drums & Perc', icon: <Disc className="w-5 h-5" /> },
      { id: 'vocals', label: 'Vocals & FX', icon: <Mic2 className="w-5 h-5" /> },
      { id: 'presets', label: 'Synth Presets', icon: <Settings2 className="w-5 h-5" /> },
    ]
  },
  {
    label: "User Archive",
    items: [
      { id: 'library', label: 'My Library', icon: <Key className="w-5 h-5" /> },
      { id: 'purchases', label: 'Purchase History', icon: <Timer className="w-5 h-5" /> },
      { id: 'favorites', label: 'Liked Sounds', icon: <Sparkles className="w-5 h-5" /> },
    ]
  }
];

export function MobileMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') || 'all';

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="h-10 w-10 flex items-center justify-center border border-white/10 hover:border-studio-neon transition-all bg-black/60 pointer-events-auto cursor-pointer rounded-sm group"
        title="Open Navigation"
      >
        <Menu className="h-5 w-5 text-white/60 group-hover:text-studio-neon transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[600] bg-[#0a0a0a] flex flex-col p-6 overflow-y-auto"
          >
            {/* 🧬 HEADER GRID */}
            <div className="flex justify-between items-start mb-12">
              <Link href="/" onClick={() => setIsOpen(false)} className="studio-panel bg-black border border-white/10 p-4">
                <Image 
                  src="/Logo.png" 
                  alt="SAMPLES WALA Logo" 
                  width={120} 
                  height={30} 
                  className="h-7 w-auto object-contain"
                />
              </Link>
              <button 
                onClick={() => setIsOpen(false)}
                className="h-14 w-14 flex items-center justify-center border-l-4 border-studio-neon bg-[#111] text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* 🕹️ STUDIO FILTERS (Sidebar Parity) */}
            <div className="mb-12">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon mb-8 block border-b border-studio-neon/20 pb-2">CONSOLE_BROWSER :: NAVIGATION</span>
                <div className="space-y-10">
                    {sidebarGroups.map((group) => (
                        <div key={group.label} className="space-y-4">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-white/20 px-2">{group.label}</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/browse?filter=${item.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-4 p-4 text-[13px] font-black uppercase tracking-tighter transition-all border-l-4 ${
                                            currentFilter === item.id 
                                            ? 'bg-studio-neon text-black border-white shadow-[0_0_20px_#a6e22e]' 
                                            : 'bg-white/[0.03] text-white/40 border-transparent hover:border-studio-neon hover:text-white'
                                        }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 👤 AGENT NODE */}
            <div className="mb-16 pt-10 border-t border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 block">SECURITY_NODE :: PROFILE</span>
                <nav className="space-y-3">
                   {user ? (
                        <>
                            <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-5 bg-white/[0.03] text-[13px] font-black uppercase tracking-widest hover:text-studio-neon transition-all border-r-4 border-studio-yellow">
                                <User className="h-5 w-5" /> User Identity
                            </Link>
                            <Link href="/profile/library" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-5 bg-white/[0.03] text-[13px] font-black uppercase tracking-widest hover:text-studio-neon transition-all border-r-4 border-studio-yellow">
                                <Music className="h-5 w-5" /> Master Artifacts
                            </Link>
                        </>
                    ) : (
                        <Link href="/auth/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-4 p-6 bg-white text-black text-[13px] font-black uppercase tracking-widest hover:bg-studio-neon transition-all">
                             Connect_User_Signal
                        </Link>
                    )}
                </nav>
            </div>

            {/* 🧬 SYSTEM FOOTER */}
            <div className="mt-auto pt-10 grid grid-cols-1 gap-4">
                 <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.4em] text-white/10 mb-4 px-2">
                    <Activity className="h-3 w-3 animate-pulse" /> SYSTEM_HEARTBEAT_ACTIVE
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Link href="/contact" onClick={() => setIsOpen(false)} className="p-4 bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/40">
                        <Mail className="h-4 w-4" /> SUPPORT
                    </Link>
                    <Link href="/pricing" onClick={() => setIsOpen(false)} className="p-4 bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/40">
                        <Zap className="h-4 w-4" /> UPGRADE
                    </Link>
                 </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
