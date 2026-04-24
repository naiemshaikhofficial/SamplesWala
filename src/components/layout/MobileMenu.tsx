'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Menu, X, Music, User, Zap, Home, Search, LogOut,
  Layout, Disc, Sparkles, Settings2, Mic2, Key, HelpCircle, ShieldCheck, Activity, Lock, CreditCard, Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const mainNav = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'browse', label: 'Browse', icon: Search, href: '/browse' },
  { id: 'packs', label: 'Packs', icon: Disc, href: '/browse?filter=packs' },
  { id: 'sounds', label: 'Sounds', icon: Music, href: '/browse?filter=trending' },
  { id: 'pricing', label: 'Pricing', icon: CreditCard, href: '/subscription' },
  { id: 'about', label: 'About', icon: Info, href: '/about' },
];

const sidebarGroups: {
  label: string;
  items: { 
    id: string; 
    label: string; 
    icon: any; 
    href: string; 
  }[];
}[] = [
  {
    label: "Library",
    items: [
      { id: 'all', label: 'All Samples', icon: Layout, href: '/browse' },
      { id: 'trending', label: 'Trending', icon: Sparkles, href: '/browse?filter=trending' },
    ]
  },
  {
    label: "Categories",
    items: [
      { id: 'melodies', label: 'Melodies', icon: Music, href: '/browse?category=melodies' },
      { id: 'drums', label: 'Drums', icon: Disc, href: '/browse?category=drums' },
      { id: 'vocals', label: 'Vocals', icon: Mic2, href: '/browse?category=vocals' },
    ]
  },
  {
    label: "My Account",
    items: [
      { id: 'library', label: 'My Collection', icon: Key, href: '/library' },
      { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
      { id: 'settings', label: 'Settings', icon: Settings2, href: '/settings' },
    ]
  },
  {
    label: "Legal",
    items: [
      { id: 'terms', label: 'Terms', icon: ShieldCheck, href: '/terms' },
      { id: 'privacy', label: 'Privacy', icon: Lock, href: '/privacy' },
      { id: 'refund', label: 'Refunds', icon: Activity, href: '/refund' },
    ]
  }
];

export function MobileMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const currentFilter = searchParams.get('filter') || 'all';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="h-10 w-10 flex items-center justify-center bg-black/40 border border-white/10 rounded-xl hover:bg-studio-neon hover:text-black transition-all group"
      >
        <Menu className="h-5 w-5 text-white/70 group-hover:text-black" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-[2010] w-[88%] max-w-sm bg-studio-charcoal border-r border-white/5 flex flex-col h-full shadow-[20px_0_60px_rgba(0,0,0,0.8)]"
            >
              {/* Header */}
              <div className="p-6 border-b border-black flex justify-between items-center bg-black/40">
                <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-studio-neon rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(166,226,46,0.3)]">
                        <Image src="/Logo.png" alt="S" width={24} height={24} className="invert" />
                   </div>
                   <div className="flex flex-col">
                        <span className="font-black italic tracking-tighter text-xl uppercase leading-none">Samples<span className="text-studio-neon">Wala</span></span>
                   </div>
                </Link>
                <button onClick={() => setIsOpen(false)} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                
                <div className="p-6 border-b border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon/60 px-2">Navigation</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {mainNav.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link 
                                    key={item.id} 
                                    href={item.id === 'packs' ? '/browse?filter=packs' : item.id === 'sounds' ? '/browse' : item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex flex-col items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${isActive ? 'bg-studio-neon border-studio-neon text-black shadow-[0_0_30px_rgba(166,226,46,0.2)]' : 'bg-[#121212] border-white/5 hover:border-white/10 text-white/60 hover:text-white'}`}
                                >
                                    <Icon size={24} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-6 space-y-10"
                >
                  {sidebarGroups.map((group) => (
                    <div key={group.label}>
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-5 px-2 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        {group.label}
                      </h4>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname + searchParams.toString() === item.href.replace('?', '');
                          return (
                            <motion.div key={item.id} variants={itemVariants}>
                              <Link
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center justify-between px-5 py-3 rounded-xl transition-all group ${
                                  isActive 
                                  ? 'bg-white/5 text-studio-neon' 
                                  : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                    <Icon size={18} strokeWidth={2} />
                                    <span className="text-[13px] font-bold uppercase tracking-tight">{item.label}</span>
                                </div>
                                <Activity size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {user && (
                      <div className="pt-6 border-t border-white/5">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-spider-red bg-spider-red/5 hover:bg-spider-red hover:text-white transition-all group"
                        >
                            <LogOut size={20} />
                            <span className="text-[13px] font-black uppercase tracking-widest">LOGOUT</span>
                        </button>
                      </div>
                  )}
                </motion.div>

                <div className="h-12" />
              </div>

              {/* Footer */}
              <div className="p-6 bg-black border-t-2 border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-white/30">
                        <ShieldCheck size={12} className="text-studio-neon" /> 
                        © {new Date().getFullYear()} SAMPLES WALA // MUMBAI, IN
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-6">
                    {[
                        { 
                            name: 'Instagram', 
                            href: 'https://instagram.com/SamplesWala', 
                            color: 'bg-[#E1306C]/10 text-[#E1306C] border-[#E1306C]/20',
                            svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        },
                        { 
                            name: 'Twitter', 
                            href: 'https://twitter.com/SamplesWala', 
                            color: 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20',
                            svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        },
                        { 
                            name: 'Facebook', 
                            href: 'https://facebook.com/SamplesWala', 
                            color: 'bg-[#4267B2]/10 text-[#4267B2] border-[#4267B2]/20',
                            svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        },
                        { 
                            name: 'Linkedin', 
                            href: 'https://linkedin.com/company/SamplesWala', 
                            color: 'bg-[#0077B5]/10 text-[#0077B5] border-[#0077B5]/20',
                            svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        },
                        { 
                            name: 'Youtube', 
                            href: 'https://youtube.com/@SamplesWala', 
                            color: 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20',
                            svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                        }
                    ].map((social, i) => (
                        <a 
                            key={i} 
                            href={social.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex-1 flex items-center justify-center p-3 rounded-xl border transition-all active:scale-90 ${social.color}`}
                        >
                            {social.svg}
                        </a>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Link href="/faq" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 p-3 text-[10px] font-black uppercase text-white/40 border border-white/5 rounded-lg hover:text-white transition-colors">
                        <HelpCircle size={14} /> Help Center
                    </Link>
                    <Link href="/terms" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 p-3 text-[10px] font-black uppercase text-white/40 border border-white/5 rounded-lg hover:text-white transition-colors">
                        Terms
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
