'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Music, User, Activity, Play, Pause, Square, Circle, Cpu, Layers, Disc, Settings as SettingsIcon, HelpCircle } from 'lucide-react'
import { CurrencyToggle } from '@/components/CurrencyToggle'
import { CreditCounter } from '@/components/CreditCounter'
import { MobileMenu } from './MobileMenu'
import { useEffect, useState, Suspense } from 'react'
import { useAudio } from '@/components/audio/AudioProvider'
import { useSidebar } from './SidebarContext'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  const isAdmin = pathname?.includes('/admin')
  const { isOpen, toggle } = useSidebar()
  
  if (isAdmin) return null;
  
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
    <header className={`fixed top-0 right-0 z-[1000] bg-studio-grey text-white border-b-4 border-black shadow-2xl transition-all duration-300 pointer-events-auto ${isOpen ? 'left-0 lg:left-64' : 'left-0 lg:left-20'}`}>
      
      {/* 🎹 TOP NAVIGATION (Hidden on Mobile) */}
      <div className="hidden md:flex bg-black/80 px-6 py-2.5 items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
            {[
              { label: 'Sounds', href: '/browse' },
              { label: 'Packs', href: '/browse' },
              { label: 'Software', href: '/software' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Library', href: '/library' },
              { label: 'Account', href: '/profile' }
            ].map((item: any) => (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  prefetch={true}
                  className="hover:text-studio-neon cursor-pointer transition-colors flex items-center gap-2 group relative" 
                  title={item.label}
                >
                   <div className="w-1.5 h-1.5 rounded-full bg-studio-neon opacity-20 group-hover:opacity-100 group-hover:animate-pulse transition-opacity" />
                   {item.label}
                   <div className="absolute -bottom-2.5 left-0 w-0 h-[1px] bg-studio-neon group-hover:w-full transition-all duration-300" />
                </Link>
            ))}
        </div>
        <div className="flex items-center gap-6 text-[9px] font-black uppercase text-white/20">
            <Link href="/faq" className="hover:text-studio-neon transition-colors" title="Help">
                <HelpCircle size={14} />
            </Link>
            <Link href="/settings" className="hover:text-studio-neon transition-colors" title="Settings">
                <SettingsIcon size={14} />
            </Link>
            <span className="flex items-center gap-2 text-studio-neon"><Activity size={10} /> Online</span>
            <span className="flex items-center gap-2"><Disc size={10} className="animate-spin-slow" /> 48K</span>
        </div>
      </div>

      <div className="px-4 md:px-6 py-2 md:py-4 flex flex-row items-center justify-between gap-4">
        
        {/* 🎹 MOBILE LOGO & MENU TOGGLE */}
        <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Suspense fallback={<div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />}>
                <MobileMenu user={user} />
              </Suspense>
            </div>
            <Link href="/" className="group relative transition-all hover:scale-105 shrink-0">
                <Image 
                  src="/Logo.png" 
                  alt="SAMPLES WALA Logo" 
                  width={120} 
                  height={30} 
                  className="h-6 md:h-9 w-auto object-contain brightness-110 group-hover:brightness-150 transition-all duration-700"
                  priority
                />
            </Link>
        </div>

        {/* 🚀 TRANSPORT CONTROLS (Hidden on small mobile, compact on tablet/md) */}
        <div className="hidden sm:flex items-center gap-4 md:gap-6 bg-[#181818] p-1.5 md:p-2.5 border-2 border-white/5 shadow-inner rounded-sm overflow-hidden">
            <div className="flex gap-1 border-r border-white/10 pr-3 md:pr-5 shrink-0">
                <button 
                    onClick={() => isPlaying ? pause() : activeId ? null : null} 
                    className={`h-7 w-7 md:h-9 md:w-9 flex items-center justify-center bg-black hover:bg-studio-neon hover:text-black transition-all border border-white/5 rounded-sm group ${isPlaying ? 'bg-studio-neon text-black' : ''}`}
                >
                    {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="text-studio-neon ml-0.5" />}
                </button>
            </div>

            <div className="flex gap-2 md:gap-4">
                <div className="flex flex-col items-center justify-center px-2 md:px-4 py-1 bg-black/80 border border-white/10 rounded-sm">
                    <span className="text-[10px] md:text-[16px] font-black text-studio-neon leading-none tracking-tighter">
                        {activeMetadata?.bpm ? activeMetadata.bpm.toFixed(0) : '120'}
                    </span>
                    <span className="text-[4px] md:text-[6px] font-black uppercase text-white/20 tracking-widest hidden md:block">BPM</span>
                </div>
                <div className="flex flex-col items-center justify-center px-2 md:px-4 py-1 bg-black/80 border border-white/10 rounded-sm">
                    <span className="text-[10px] md:text-[16px] font-black text-white leading-none tracking-tighter">
                        {formatTime(currentTime).split(':')[1]}:{formatTime(currentTime).split(':')[2]}
                    </span>
                    <span className="text-[4px] md:text-[6px] font-black uppercase text-white/20 tracking-widest hidden md:block">TIME</span>
                </div>
            </div>
        </div>

        {/* 🧬 AUTH & RACK STATS */}
        <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden xxl:flex items-center gap-5 px-5 py-1.5 bg-black/40 border-l border-white/10 scale-90">
                <span className="text-[7px] font-black uppercase text-white/15 tracking-widest">Status Ready</span>
            </div>

            {user ? (
                <div className="flex items-center gap-2 md:gap-4">
                    {/* 🛡️ ADMIN_QUICK_ACCESS */}
                    {(user.email?.toLowerCase().includes('naiem') || 
                      user.email?.toLowerCase().includes('sampleswala') || 
                      user.email?.toLowerCase() === 'naiemshaikh@gmail.com') && (
                        <Link href="/admin" className="hidden lg:flex items-center justify-center h-10 px-6 bg-studio-neon text-black text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all border-r-4 border-studio-yellow">
                            Dashboard
                        </Link>
                    )}
                    <CreditCounter />
                    <Link href="/profile" className="h-8 w-8 md:h-11 md:w-11 flex items-center justify-center studio-panel border border-white/10 hover:border-studio-neon transition-all bg-[#222] pointer-events-auto cursor-pointer relative overflow-hidden group">
                        <User className="h-4 w-4 text-white/40 group-hover:text-studio-neon" />
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-studio-neon opacity-40 animate-pulse" />
                    </Link>
                </div>
            ) : (
                <Link href="/auth/login" className="h-8 px-3 md:h-11 md:px-6 flex items-center justify-center bg-white text-black text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-studio-neon transition-all border-r-2 md:border-r-4 border-studio-yellow">
                    Login
                </Link>
            )}
            <div className="hidden sm:block">
            </div>
        </div>
      </div>
    </header>
  )
}
