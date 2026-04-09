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

const sidebarGroups: {
  label: string;
  items: { 
    id: string; 
    label: string; 
    icon: any; 
    href?: string; 
  }[];
}[] = [
  {
    label: "Library",
    items: [
      { id: 'all', label: 'All Artifacts', icon: Layout },
      { id: 'packs', label: 'Sound Packs', icon: Disc },
      { id: 'trending', label: 'Trending', icon: Sparkles },
    ]
  },
  {
    label: "Categories",
    items: [
      { id: 'melodies', label: 'Melodies', icon: Music },
      { id: 'drums', label: 'Drums & Perc', icon: Disc },
      { id: 'vocals', label: 'Vocals', icon: Mic2 },
    ]
  },
  {
    label: "Account",
    items: [
      { id: 'library', label: 'My Library', icon: Key, href: '/library' },
      { id: 'settings', label: 'Settings', icon: Settings2, href: '/settings' },
    ]
  }
];

export function MobileMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') || 'all';

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
      >
        <Menu className="h-5 w-5 text-white/70" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[610] w-[85%] max-w-sm bg-studio-charcoal border-r border-white/5 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <Image src="/Logo.png" alt="Logo" width={100} height={24} className="h-6 w-auto" />
                </Link>
                <button onClick={() => setIsOpen(false)} className="p-2 text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-6">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {sidebarGroups.map((group) => (
                    <div key={group.label}>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 px-2">
                        {group.label}
                      </h4>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = currentFilter === item.id;
                          return (
                            <motion.div key={item.id} variants={itemVariants}>
                              <Link
                                href={item.href || `/browse?filter=${item.id}`}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                  isActive 
                                  ? 'bg-studio-neon text-black' 
                                  : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                {item.label}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Footer / Stats */}
              <div className="p-6 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/20">
                  <div className="w-1.5 h-1.5 bg-studio-neon rounded-full animate-pulse" />
                  System Operational
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link 
                    href="/pricing" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 transition-all"
                  >
                    <Zap size={14} className="text-studio-neon" /> UPGRADE
                  </Link>
                  <Link 
                    href="/contact" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 transition-all"
                  >
                    <Mail size={14} /> SUPPORT
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
