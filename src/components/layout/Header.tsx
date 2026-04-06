'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Music, User, Activity, Play, Pause, Square, Circle, Cpu, Layers, Disc } from 'lucide-react'
import { CurrencyToggle } from '@/components/CurrencyToggle'
import { CreditCounter } from '@/components/CreditCounter'
import { MobileMenu } from './MobileMenu'
import { useEffect, useState } from 'react'
import { useAudio } from '@/components/audio/AudioProvider'
import { useSidebar } from './SidebarContext'
import { Menu } from 'lucide-react'

export function Header() {
  const { isOpen, toggle } = useSidebar()
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const { isPlaying, activeId, activeMetadata, currentTime, play, pause } = useAudio()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Format time MM:SS:CC
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    const cents = Math.floor((time % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${cents.toString().padStart(2, '0')}`
  }

  return (
    <header className={`fixed top-0 right-0 z-[80] bg-studio-grey text-white border-b-4 border-black shadow-2xl transition-all duration-300 ${isOpen ? 'left-0 lg:left-64' : 'left-0 lg:left-20'}`}>
      
      {/* 🎹 TOP NAVIGATION (Hidden on Mobile) */}
      <div className="hidden md:flex bg-black/80 px-6 py-2.5 items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
            {[
              { label: 'Sounds', href: '/browse' },
              { label: 'Packs', href: '/browse' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'My Library', href: '/profile/library' },
              { label: 'ACCOUNT', href: '/profile' }
            ].map(item => (
                <Link key={item.label} href={item.href} className="hover:text-studio-neon cursor-pointer transition-colors flex items-center gap-2 group">
                   <div className="w-1.5 h-1.5 rounded-full bg-studio-neon opacity-20 group-hover:opacity-100 transition-opacity" />
                   {item.label}
                </Link>
            ))}
        </div>
        <div className="flex items-center gap-6 text-[9px] font-black uppercase text-white/20">
            <span className="flex items-center gap-2 text-studio-neon"><Activity size={10} /> MASTER_BUS_LIVE</span>
            <span className="flex items-center gap-2"><Disc size={10} className="animate-spin-slow" /> AUDIO_ENCODED</span>
        </div>
      </div>

      <div className="px-4 md:px-6 py-3 md:py-4 flex flex-col xl:flex-row items-center gap-4 md:gap-12">
        
        {/* 🚀 TRANSPORT CONTROLS & LCD (Responsive Scaling) */}
        <div className="w-full xl:w-auto flex items-center justify-between xl:justify-start gap-4 md:gap-6 bg-[#181818] p-2 md:p-2.5 border-2 border-white/5 shadow-inner rounded-sm scale-90 sm:scale-100 origin-left overflow-x-auto no-scrollbar">
            <div className="flex gap-1.5 border-r border-white/10 pr-4 md:pr-5 shrink-0">
                <button 
                    onClick={() => isPlaying ? pause() : activeId ? null : null} 
                    className={`h-8 w-8 md:h-9 md:w-9 flex items-center justify-center bg-black hover:bg-studio-neon hover:text-black transition-all border border-white/5 rounded-sm group ${isPlaying ? 'bg-studio-neon text-black' : ''}`}
                >
                    {isPlaying ? (
                        <Pause size={14} fill="currentColor" />
                    ) : (
                        <Play size={14} fill="currentColor" className="text-studio-neon group-hover:text-black ml-0.5" />
                    )}
                </button>
                <button 
                    onClick={() => pause()}
                    className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center bg-black hover:bg-white hover:text-black transition-all border border-white/5 rounded-sm"
                >
                    <Square size={12} fill="currentColor" />
                </button>
            </div>

            <div className="flex gap-3 md:gap-4 shrink-0">
                {/* BPM LCD */}
                <div className="flex flex-col gap-0.5 items-center justify-center px-3 md:px-4 py-1 md:py-1.5 bg-black/80 border border-white/10 rounded-sm min-w-[60px] md:min-w-[70px]">
                    <span className="text-[14px] md:text-[16px] font-black text-studio-neon leading-none tracking-tighter">
                        {activeMetadata?.bpm ? activeMetadata.bpm.toFixed(2) : '120.00'}
                    </span>
                    <span className="text-[5px] md:text-[6px] font-black uppercase text-white/20 tracking-widest">TEMPO</span>
                </div>
                {/* TIME LCD */}
                <div className="flex flex-col gap-0.5 items-center justify-center px-3 md:px-4 py-1 md:py-1.5 bg-black/80 border border-white/10 rounded-sm min-w-[80px] md:min-w-[90px]">
                    <span className="text-[14px] md:text-[16px] font-black text-white leading-none tracking-tighter">
                        {formatTime(currentTime)}
                    </span>
                    <span className="text-[5px] md:text-[6px] font-black uppercase text-white/20 tracking-widest">TIMESTAMP</span>
                </div>
                {/* PATTERN LCD */}
                <div className="hidden sm:flex flex-col gap-0.5 items-center justify-center px-3 md:px-4 py-1 md:py-1.5 bg-black/80 border border-white/10 rounded-sm min-w-[40px] md:min-w-[50px]">
                    <span className="text-[14px] md:text-[16px] font-black text-studio-yellow leading-none tracking-tighter italic">P01</span>
                    <span className="text-[5px] md:text-[6px] font-black uppercase text-white/20 tracking-widest">RACK</span>
                </div>
            </div>
        </div>

        {/* 💎 MAIN LOGO (Responsive size) */}
        <div className="flex-1 flex items-center justify-center gap-4 order-first xl:order-none">
            <button 
              onClick={toggle}
              className="hidden lg:flex h-10 w-10 items-center justify-center bg-black/40 border border-white/5 hover:border-studio-neon transition-all rounded-sm group"
              title="Toggle Sidebar"
            >
               <Menu size={18} className="group-hover:text-studio-neon" />
            </button>
            <Link href="/" className="group relative px-2 transition-all hover:scale-105">
                <Image 
                  src="/Logo.png" 
                  alt="SAMPLES WALA Logo" 
                  width={140} 
                  height={35} 
                  className="h-7 md:h-9 w-auto object-contain brightness-110 group-hover:brightness-150 transition-all duration-700"
                  priority
                />
            </Link>
        </div>

        {/* 🧬 AUTH & RACK STATS */}
        <div className="flex items-center gap-4 md:gap-6 ml-auto xl:ml-0">
            <div className="hidden xxl:flex items-center gap-5 px-5 py-1.5 bg-black/40 border-l border-white/10 scale-90">
                <div className="flex flex-col items-end">
                    <div className="flex gap-1 h-1.5 mb-1">
                        {[...Array(6)].map((_, i) => <div key={i} className="w-1 bg-studio-neon/20 animate-peak" style={{ animationDelay: `${i*0.1}s` }} />)}
                    </div>
                    <span className="text-[7px] font-black uppercase text-white/15 tracking-widest">ENGINE_BUS_ACTIVE</span>
                </div>
            </div>

            {user ? (
                <div className="flex items-center gap-3 md:gap-4">
                    <CreditCounter />
                    <Link href="/profile" className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center studio-panel border-2 border-white/5 hover:border-studio-neon hover:bg-black transition-all group/user bg-[#222]">
                        <User className="h-4 w-4 group-hover:text-studio-neon text-white/40" />
                    </Link>
                </div>
            ) : (
                <Link href="/auth/login" className="h-9 px-4 md:h-11 md:px-6 flex items-center justify-center bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-studio-neon transition-all border-r-4 border-studio-yellow">
                    Login
                </Link>
            )}
            <MobileMenu user={user} />
        </div>
      </div>
    </header>
  )
}
