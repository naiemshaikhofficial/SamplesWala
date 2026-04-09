'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Activity, Cpu, Database, Zap } from 'lucide-react'
import Link from 'next/link'
import { HeroSearch } from './HeroSearch'
import { AnimatedHeroLogo } from './AnimatedHeroLogo'
import { useState, useEffect } from 'react'

export function AdaptiveHero() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative min-h-[600px] md:min-h-screen flex flex-col items-center justify-center pt-24 pb-16 md:pb-24 overflow-hidden bg-black w-full">
        
        {/* 🧬 STUDIO ATMOSPHERE */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-studio-neon opacity-[0.1] blur-[80px] md:blur-[180px] rounded-full" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[200px] md:w-[600px] h-[200px] md:h-[600px] bg-spider-red opacity-[0.05] blur-[60px] md:blur-[150px] rounded-full" />
            
            {/* 🧬 LOGO WATERMARK */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                <img src="/Logo.png" alt="" className="w-[120%] max-w-none grayscale invert" />
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-black z-10" />
        </div>

        {/* 🧬 CONSOLE SCAN PASS */}
        <div className="absolute inset-x-0 h-[2px] bg-studio-neon opacity-20 shadow-[0_0_15px_#a6e22e] animate-scan pointer-events-none z-20" />

        <div className="relative z-30 flex flex-col items-center text-center px-4 md:px-6 w-full max-w-full overflow-hidden">
            
            {/* TECHNICAL HEADER - CLEANER FOR MOBILE */}
            <div className="mb-8 md:mb-12 flex flex-wrap items-center justify-center gap-4 md:gap-10 opacity-40">
                <div className="flex items-center gap-2">
                    <Cpu className="w-3 h-3 text-studio-neon" />
                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest leading-none">CORE: v4</span>
                </div>
                <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-studio-yellow" />
                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest leading-none">SYNC: LIVE</span>
                </div>
                <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-spider-red" />
                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest leading-none">SIG: OK</span>
                </div>
            </div>

            {/* LOGO CONTAINER */}
            <div className="mb-10 md:mb-16 relative w-full flex justify-center">
                <div className="scale-75 sm:scale-90 md:scale-100 max-w-full">
                    <AnimatedHeroLogo />
                </div>
            </div>

            <div className="space-y-4 mb-12 md:mb-20 w-full flex flex-col items-center">
                <div className="flex items-center justify-center gap-4 md:gap-10 text-studio-neon w-full">
                    <div className="h-[1px] flex-1 max-w-[40px] md:max-w-[100px] bg-studio-neon/40 shadow-[0_0_10px_#a6e22e]" />
                    <span className="text-[8px] md:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.8em] flex items-center gap-2 bg-black/60 px-4 py-1.5 border border-studio-neon/20 italic">
                        <Zap className="h-3 w-3 animate-pulse" /> MASTER_CONSOLE
                    </span>
                    <div className="h-[1px] flex-1 max-w-[40px] md:max-w-[100px] bg-studio-neon/40 shadow-[0_0_10px_#a6e22e]" />
                </div>

                <p className="max-w-lg mx-auto text-[10px] md:text-2xl font-black uppercase tracking-[0.2em] md:tracking-[0.4em] leading-relaxed text-white/40 px-4 text-center">
                    PRO-GRADE_ARCHIVE_NODE :: UNLIMITED_SIGNAL_ACCESS
                </p>
            </div>

            {/* 🔎 MASTER SEARCH - ENSURE CENTERED */}
            <div className="w-full max-w-3xl flex justify-center mb-12 md:mb-24 px-2">
                <HeroSearch />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-12 w-full justify-center px-4 max-w-2xl">
                <Link href="/browse" className="relative group overflow-hidden flex items-center justify-center gap-6 px-10 py-6 bg-white text-black font-black uppercase tracking-widest text-[11px] md:text-[14px] transition-all shadow-2xl border-r-[8px] md:border-r-[16px] border-studio-yellow w-full xs:w-auto text-center">
                    <span className="relative z-10 flex items-center gap-4">
                        OPEN ARCHIVE <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-studio-neon translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>

                <div className="flex items-center gap-4 group cursor-pointer sm:border-l border-white/10 sm:pl-10 w-full sm:w-auto justify-center">
                    <div className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center border-2 border-white/10 group-hover:border-studio-neon transition-all bg-black/80 rounded-sm">
                         <Play size={20} fill="currentColor" className="text-white group-hover:text-studio-neon transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-studio-neon">Audio_Preview</p>
                        <p className="text-[8px] md:text-[10px] text-white/20 font-bold uppercase tracking-widest italic group-hover:text-white">Load session metadata</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Level Decor - Responsive count */}
        <div className="absolute bottom-6 left-0 right-0 h-10 flex items-end gap-[2px] md:gap-1 px-4 opacity-30 pointer-events-none justify-center">
             {isMounted && [...Array(window.innerWidth < 768 ? 12 : 32)].map((_, i) => (
                 <div key={i} className="flex-1 max-w-[10px] bg-studio-neon animate-meter" style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }} />
             ))}
        </div>
    </section>
  )
}
