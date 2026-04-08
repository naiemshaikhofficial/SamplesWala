'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Activity, Disc } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { HeroSearch } from './HeroSearch'
import { AnimatedHeroLogo } from './AnimatedHeroLogo'
import { DAWVisualizer, SignalMeter } from '@/components/ui/DAWVisualizer'
import { TextScramble } from '@/components/ui/TextScramble'
import { useState, useEffect } from 'react'

export function AdaptiveHero() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative min-h-[calc(100vh-300px)] flex flex-col items-center justify-center pt-8 pb-16 md:pb-24 overflow-hidden bg-studio-charcoal step-grid">
        
        {/* 🧬 STUDIO ATMOSPHERE (Master Display Backdrop) */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-studio-neon opacity-20 animate-pulse" />
            
            {/* Pulsing Mechanical Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-studio-neon opacity-[0.03] blur-[80px] md:blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-spider-red opacity-[0.02] blur-[60px] md:blur-[120px] rounded-full animate-ping" />
        </div>

        {/* 🧬 CONSOLE SCAN PASS */}
        <div className="absolute inset-x-0 h-[2px] bg-studio-neon opacity-10 shadow-[0_0_20px_#a6e22e] animate-scan pointer-events-none z-10" />

        <div className="relative z-20 flex flex-col items-center text-center px-4 md:px-6 max-w-7xl mx-auto w-full">
            
            <div className="mb-6 md:mb-8 relative group scale-[0.65] sm:scale-75 md:scale-100">
                <div className="absolute -inset-10 bg-studio-neon/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <AnimatedHeroLogo />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 md:space-y-8 mb-8 md:mb-16 w-full"
            >
                <div className="flex items-center justify-center gap-4 md:gap-6 text-studio-neon">
                    <div className="hidden lg:block w-32 border-b border-studio-neon/20 opacity-40">
                         <SignalMeter className="h-2 w-full opacity-30" />
                    </div>
                    <div className="h-0.5 w-8 md:w-12 bg-studio-neon shadow-[0_0_10px_#a6e22e]" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] flex items-center gap-2 md:gap-4 whitespace-nowrap">
                        <Activity className="h-3 w-3 animate-pulse" /> Signal_Safe_Production :: V5.0
                    </span>
                    <div className="h-0.5 w-8 md:w-12 bg-studio-neon shadow-[0_0_10px_#a6e22e]" />
                    <div className="hidden lg:block w-32 border-b border-studio-neon/20 opacity-40 transform rotate-180">
                         <SignalMeter className="h-2 w-full opacity-30" />
                    </div>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black uppercase tracking-tighter leading-[0.9] italic">
                    <TextScramble text="THE WORLD'S BEST" duration={1200} /><br />
                    <span className="text-studio-neon bg-black px-4 sm:px-8 py-2 md:py-3 border-r-[12px] md:border-r-[24px] border-studio-yellow transform -skew-x-12 inline-flex items-center gap-4 md:gap-6 mt-3 md:mt-4 group/h1">
                        <TextScramble text="SOUNDS" delay={400} />
                        <div className="hidden md:flex h-8 gap-[1px] items-end opacity-40 group-hover/h1:opacity-100 transition-opacity">
                            <DAWVisualizer color="#a6e22e" bars={10} height={32} />
                        </div>
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto text-[10px] sm:text-sm md:text-xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] leading-relaxed px-4 opacity-40 hover:opacity-100 transition-opacity duration-700 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/20">
                    <TextScramble text="Premium high-definition samples for your track." delay={800} duration={1500} /> <br className="hidden md:block" />
                    <TextScramble text="Created by world-class producers. Royalty Free." delay={1000} duration={1500} />
                </p>
            </motion.div>

            {/* 🔎 MASTER PRESET SELECTOR (Search) */}
            <div className="w-full max-w-3xl transform hover:scale-[1.01] transition-transform duration-700 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                <HeroSearch />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="mt-12 md:mt-16 flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full justify-center"
            >
                <Link href="/browse" className="relative group overflow-hidden flex items-center gap-8 md:gap-10 px-10 md:px-16 py-6 md:py-8 bg-white text-black font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:-translate-y-2 active:scale-95 transition-all shadow-2xl border-r-[12px] md:border-r-[16px] border-studio-yellow w-full sm:w-auto signal-sweep">
                    <span className="relative z-10 flex items-center gap-4 justify-center w-full">
                        DISCOVER SOUNDS <ArrowRight className="h-4 w-4 group-hover:translate-x-3 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-studio-neon translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="absolute inset-0 flex items-center justify-center gap-4 text-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 font-black">
                        START NOW <Disc className="h-4 w-4 animate-spin-slow" />
                    </span>
                </Link>

                <div className="flex items-center gap-6 group cursor-pointer pl-0 md:pl-8 border-l-0 md:border-l-4 border-black w-full sm:w-auto justify-center sm:justify-start">
                    <div className="h-12 w-12 md:h-14 md:w-14 flex items-center justify-center studio-panel border-2 border-white/5 group-hover:border-studio-neon hover:bg-black transition-all rotate-12 group-hover:rotate-0">
                         <Play size={18} fill="currentColor" className="text-white group-hover:text-studio-neon transition-colors" />
                    </div>
                    <div className="text-left space-y-0.5">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-studio-neon transition-all">Studio Preview</p>
                        <p className="text-[7px] md:text-[8px] text-white/20 font-bold uppercase tracking-widest italic group-hover:text-white transition-all">Listen to the latest sequence</p>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Rhythmic Level Decor (Bottom) - Hidden on smallest screens */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden sm:flex items-end gap-1 px-4 opacity-10 md:opacity-20 max-w-full">
             {isMounted && [...Array(30)].map((_, i) => (
                 <div key={i} className="w-1.5 md:w-2 bg-studio-neon animate-meter" style={{ height: `${10 + Math.random() * 30}px`, animationDelay: `${i * 0.05}s` }} />
             ))}
        </div>
    </section>
  )
}
