'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Music, User, CreditCard, Zap, Globe, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function MobileMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden h-10 w-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all"
      >
        <Menu className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col p-8"
          >
            {/* CLOSE BUTTON */}
            <div className="flex justify-between items-center mb-16">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-4 group">
                <div className="h-4 w-4 bg-white rotate-45" />
                <span className="text-xl font-black tracking-tighter uppercase italic">SAMPLES WALA</span>
              </Link>
              <button 
                onClick={() => setIsOpen(false)}
                className="h-12 w-12 flex items-center justify-center border border-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* NAV LINKS */}
            <nav className="flex-1 space-y-8">
               <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/10 block mb-4">Discovery — खोजें</span>
                  <Link href="/browse" onClick={() => setIsOpen(false)} className="text-4xl font-black uppercase tracking-tighter italic italic hover:text-emerald-400 block transition-all">Digital Vault</Link>
                  <Link href="/packs" onClick={() => setIsOpen(false)} className="text-4xl font-black uppercase tracking-tighter italic italic hover:text-emerald-400 block transition-all">Collections</Link>
                  <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-4xl font-black uppercase tracking-tighter italic italic hover:text-emerald-400 block transition-all">Membership Access</Link>
               </div>

               <div className="pt-8 space-y-4 border-t border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/10 block mb-4">Agent Base — एजेंट</span>
                  {user ? (
                    <>
                        <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-xl font-black uppercase tracking-widest hover:text-emerald-400 transition-all">
                             <User className="h-5 w-5" /> Security Profile
                        </Link>
                        <Link href="/library" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-xl font-black uppercase tracking-widest hover:text-emerald-400 transition-all">
                             <Music className="h-5 w-5" /> My Secured Sounds
                        </Link>
                    </>
                  ) : (
                    <Link href="/auth/login" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-xl font-black uppercase tracking-widest hover:text-emerald-400 transition-all">
                         <Zap className="h-5 w-5" /> Disconnected Signal: Login
                    </Link>
                  )}
               </div>
            </nav>

            {/* FOOTER SHORTCUTS */}
            <div className="pt-12 grid grid-cols-2 gap-4">
                 <Link href="/contact" onClick={() => setIsOpen(false)} className="p-4 border border-white/10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                     <Mail className="h-4 w-4 text-white/20" /> Support
                 </Link>
                 <Link href="/about" onClick={() => setIsOpen(false)} className="p-4 border border-white/10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                     <Globe className="h-4 w-4 text-white/20" /> Manifesto
                 </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
