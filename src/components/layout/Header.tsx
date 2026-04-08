'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSidebar } from './SidebarContext'
import { useAudio } from '@/components/audio/AudioProvider'
import { Search, Play, Pause, User, Music, LogOut, Menu, X, SlidersHorizontal, Settings, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CreditCounter } from '@/components/CreditCounter'
import { MobileMenu } from './MobileMenu'

export function Header() {
  const { isOpen } = useSidebar()
  const { isPlaying, activeId, activeMetadata, currentTime, duration, play, pause } = useAudio()
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <header className={`fixed top-0 right-0 z-[500] bg-studio-grey text-white border-b-4 border-black shadow-2xl transition-all duration-500 ease-in-out pointer-events-auto ${isOpen ? 'left-0 lg:left-64' : 'left-0 lg:left-20'}`}>
        
      {/* 📡 TOP_STATUS_LINE (Global Status Signal) */}
      <div className="h-6 md:h-8 bg-black border-b border-white/5 flex items-center justify-between px-4 md:px-8 overflow-hidden pointer-events-none">
          <div className="flex items-center gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-studio-neon animate-pulse" />
                  <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Signal_Active</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.4em] text-white/20 italic">Encrypted_Link_V5.0</span>
              </div>
          </div>
          <div className="flex items-center gap-4">
              <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.4em] text-studio-yellow animate-pulse">Master_Output_Locked</span>
          </div>
      </div>

      <div className="px-4 md:px-6 py-2 md:py-4 flex flex-row items-center justify-between gap-4 max-w-[2000px] mx-auto">
        
        {/* 🧬 BRAND_IDENTITY */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className="lg:hidden">
              <Suspense fallback={<div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />}>
                <MobileMenu user={user} />
              </Suspense>
            </div>
            <Link href="/" className="group relative transition-all hover:scale-105 hidden sm:block">
                <Image 
                  src="/Logo.png" 
                  alt="SAMPLES WALA Logo" 
                  width={140} 
                  height={35} 
                  className="h-6 md:h-10 w-auto object-contain brightness-110 group-hover:brightness-150 transition-all duration-700"
                  priority
                />
            </Link>
        </div>

        {/* 🚀 TRANSPORT_TERMINAL (Responsive hiding) */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 bg-[#181818] p-1.5 lg:p-2.5 border-2 border-white/5 shadow-inner rounded-sm">
            <div className="flex gap-1 border-r border-white/10 pr-4 lg:pr-6 shrink-0">
                <button 
                    onClick={() => isPlaying ? pause() : activeId ? null : null} 
                    className={`h-8 w-8 lg:h-10 lg:w-10 flex items-center justify-center bg-black hover:bg-studio-neon hover:text-black transition-all border border-white/5 rounded-sm group ${isPlaying ? 'bg-studio-neon text-black' : ''}`}
                >
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="text-studio-neon ml-0.5" />}
                </button>
            </div>

            <div className="flex gap-2 lg:gap-4 overflow-hidden">
                <div className="flex flex-col items-center justify-center px-3 lg:px-5 py-1 bg-black/80 border border-white/10 rounded-sm min-w-[50px] lg:min-w-[70px]">
                    <span className="text-[12px] lg:text-[18px] font-black text-studio-neon leading-none tracking-tighter">
                        {activeMetadata?.bpm ? activeMetadata.bpm.toFixed(0) : '120'}
                    </span>
                    <span className="text-[4px] lg:text-[6px] font-black uppercase text-white/20 tracking-widest">BPM</span>
                </div>
                <div className="flex flex-col items-center justify-center px-3 lg:px-5 py-1 bg-black/80 border border-white/10 rounded-sm">
                    <span className="text-[12px] lg:text-[18px] font-black text-white leading-none tracking-tighter tabular-nums">
                        {formatTime(currentTime).split(':')[1]}:{formatTime(currentTime).split(':')[2]}
                    </span>
                    <span className="text-[4px] lg:text-[6px] font-black uppercase text-white/20 tracking-widest">TIME</span>
                </div>
            </div>
        </div>

        {/* 🧬 AUTH_DASHBOARD */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {user ? (
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Scale Credit Counter for different screens */}
                    <div className="scale-90 sm:scale-100 origin-right transition-transform">
                        <CreditCounter />
                    </div>
                    <Link href="/profile" className="group h-9 w-9 sm:h-11 sm:w-11 flex items-center justify-center studio-panel border border-white/10 hover:border-studio-neon transition-all bg-[#222] pointer-events-auto cursor-pointer relative overflow-hidden">
                        <User className="h-4 w-4 text-white/40 group-hover:text-studio-neon transition-colors" />
                        <div className="absolute inset-0 bg-studio-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>
            ) : (
                <Link href="/auth/login" className="h-9 sm:h-11 px-6 flex items-center justify-center bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-studio-neon transition-all border-r-4 border-studio-yellow signal-sweep">
                    Login_System
                </Link>
            )}
        </div>

      </div>
    </header>
  )
}
