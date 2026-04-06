'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Music, User, Menu, Play, Activity } from 'lucide-react'
import { CurrencyToggle } from '@/components/CurrencyToggle'
import { CreditCounter } from '@/components/CreditCounter'
import { MobileMenu } from './MobileMenu'
import { TextScramble } from '@/components/ui/TextScramble'
import { useEffect, useState } from 'react'
import { signOut } from '@/app/auth/actions'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black text-white lg:pl-20 group/nav h-20 md:h-24">
      {/* 🧬 NAVIGATION SCAN LINE */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white opacity-[0.05] animate-scan-line pointer-events-none group-hover/nav:opacity-20 transition-all duration-700" />
      
      <div className="flex h-full items-center justify-between px-4 md:px-20 container mx-auto">
        <div className="flex items-center gap-6 md:gap-16">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group/logo relative">
            <div className="relative">
                <Image 
                  src="/Logo.png" 
                  alt="SAMPLES WALA Logo" 
                  width={300} 
                  height={80} 
                  style={{ width: 'auto' }}
                  className="h-12 md:h-16 w-auto object-contain transition-transform duration-700 group-hover/logo:scale-110 group-hover/logo:brightness-125"
                  priority
                />
                {/* 🧬 Logo Pulse Aura */}
                <div className="absolute inset-0 bg-white/0 group-hover/logo:bg-white/5 blur-xl transition-all duration-700 -z-10 rounded-full" />
            </div>
            
            {/* 🧬 Logo Rhythmic Decoration */}
            <div className="hidden xl:flex flex-col gap-[2px] items-start opacity-20 group-hover/logo:opacity-60 transition-all">
                <div className="h-[2px] w-4 bg-white animate-meter" style={{ animationDelay: '0.1s' }} />
                <div className="h-[2px] w-6 bg-white animate-meter" style={{ animationDelay: '0.2s' }} />
                <div className="h-[2px] w-2 bg-white animate-meter" style={{ animationDelay: '0.3s' }} />
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] overflow-hidden">
            <Link href="/browse" className="text-white/30 hover:text-white transition-all py-8 px-2 relative group/link">
                <TextScramble text="Sounds" autostart={false} />
                <div className="absolute bottom-4 left-0 w-0 h-[2px] bg-white group-hover/link:w-full transition-all duration-500" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/link:opacity-100 transition-opacity">
                    <Activity size={10} className="text-white/40" />
                </div>
            </Link>
            <Link href="/packs" className="text-white/30 hover:text-white transition-all py-8 px-2 relative group/link">
                <TextScramble text="Packs" autostart={false} />
                <div className="absolute bottom-4 left-0 w-0 h-[2px] bg-white group-hover/link:w-full transition-all duration-500" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/link:opacity-100 transition-opacity">
                    <Music size={10} className="text-white/40" />
                </div>
            </Link>
            <Link href="/pricing" className="text-white/30 hover:text-white transition-all py-8 px-2 relative group/link">
                <TextScramble text="Pricing" autostart={false} />
                <div className="absolute bottom-4 left-0 w-0 h-[2px] bg-white group-hover/link:w-full transition-all duration-500" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/link:opacity-100 transition-opacity">
                    <Play size={10} fill="white" className="text-white/40" />
                </div>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-6">
              {user && (
                  <Link href="/library" className="group flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all overflow-hidden relative">
                      <Music className="h-3 w-3 relative z-10" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-inherit relative z-10">My Library</span>
                      <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-0" />
                  </Link>
              )}
              {user && <CreditCounter />}
              <CurrencyToggle />
          </div>

          <div className="flex items-center gap-3 md:gap-4 ml-2 md:ml-6 pl-2 md:pl-6 border-l border-white/10 h-10">
            {user ? (
                <div className="flex items-center gap-3 md:gap-4 h-full">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 hidden sm:block">
                        {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <Link href="/profile" className="h-full w-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all">
                        <User className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <Link href="/auth/login" className="h-full px-4 md:px-8 flex items-center justify-center bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white border border-white transition-all overflow-hidden relative group">
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-black transition-all duration-300 -z-0" />
                </Link>
            )}
            <MobileMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
