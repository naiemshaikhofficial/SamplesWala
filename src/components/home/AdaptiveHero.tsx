'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, Activity, Music2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { HeroSearch } from './HeroSearch'
import { AnimatedHeroLogo } from './AnimatedHeroLogo'
import { TextScramble } from '@/components/ui/TextScramble'

export function AdaptiveHero() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  // 📀 MASTER VIBE ENGINE 
  const vibe = useMemo(() => {
    if (!query) return 'default'
    const q = query.toLowerCase()
    if (q.includes('drum') || q.includes('beat')) return 'percussive'
    if (q.includes('vocal') || q.includes('sing')) return 'melodic'
    if (q.includes('vintage') || q.includes('old')) return 'analog'
    if (q.includes('trap') || q.includes('bass')) return 'heavy'
    return 'default'
  }, [query])

  // 🎨 FILTER CONFIG (Professional Studio Grade)
  const getFilter = () => {
    switch(vibe) {
      case 'percussive': return 'grayscale(1) contrast(1.4) brightness(0.7)'
      case 'melodic': return 'sepia(0.3) brightness(0.9) contrast(0.9)'
      case 'analog': return 'sepia(0.6) hue-rotate(-10deg) saturate(0.8) brightness(0.8)'
      case 'heavy': return 'invert(0.1) brightness(0.6) contrast(1.6) saturate(1.2)'
      default: return 'grayscale(1) brightness(0.5)'
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 md:pt-32 pb-24 md:pb-48 overflow-hidden bg-black">
        
        {/* 🧬 STUDIO ATMOSPHERE (Adaptive Backdrop) */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <motion.div 
                key={vibe}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ 
                    filter: getFilter(),
                    scale: 1,
                    opacity: 1
                }}
                transition={{ 
                    duration: 2.5,
                    ease: [0.16, 1, 0.3, 1]
                }}
                className="absolute inset-0 opacity-40 bg-cover bg-center bg-no-repeat transition-all duration-1000 animate-float-prod"
                style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1920&auto=format&fit=crop')`,
                }}
            />
            {/* 🧬 Dynamic Light Glares (Hover Reactivity Simulation) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
        </div>

        {/* 🧬 SCAN PASS EFFECT */}
        <div className="absolute inset-0 pointer-events-none z-10 animate-scan opacity-20" />

        <div className="relative z-20 flex flex-col items-center text-center px-4 md:px-0">
            <AnimatedHeroLogo />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-6 mb-8"
            >
                <div className="h-[1px] w-8 md:w-16 bg-white/20 animate-pulse" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-white/40 italic">
                    <TextScramble 
                        key={vibe}
                        text={`MODERN HERITAGE / ${vibe === 'default' ? 'मुम्बई साउंड' : vibe.toUpperCase()}`}
                        autostart={true}
                        duration={1200}
                    />
                </span>
                <div className="h-[1px] w-8 md:w-16 bg-white/20 animate-pulse" />
            </motion.div>

            <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.6 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 1.5, delay: 0.8 }}
                className="max-w-2xl text-lg md:text-3xl font-medium tracking-tight leading-snug mb-12 md:mb-16 px-4 md:px-0 italic group"
            >
                Crafting the future of <span className="text-white group-hover:text-emerald-400 transition-colors">Indian music</span>. Cinematic, high-contrast, and 
                profoundly local. Premium samples for music producers.
            </motion.p>

            <HeroSearch />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-12 md:mt-20 flex flex-col md:flex-row items-center gap-8"
            >
                <Link href="/browse" className="relative group overflow-hidden flex items-center gap-8 px-16 py-8 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.05] active:scale-[0.98] transition-all shrink-0">
                    <span className="relative z-10 flex items-center gap-4">
                        DISCOVER ALL SOUNDS <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="absolute inset-0 flex items-center justify-center gap-4 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 font-black">
                        START CREATING NOW <Music2 className="h-4 w-4 animate-bounce" />
                    </span>
                </Link>

                <div className="flex items-center gap-4 pl-4 md:border-l border-white/10 group cursor-pointer">
                    <div className="h-10 w-10 flex items-center justify-center border border-white/10 group-hover:border-white transition-all rounded-full group-hover:bg-white group-hover:text-black">
                         <Play size={16} fill="white" className="group-hover:fill-black ml-1 transition-all" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-all">Preview All Drops</p>
                        <p className="text-[9px] text-white/20 group-hover:text-emerald-400 transition-all italic underline decoration-white/0 group-hover:decoration-emerald-400/50 underline-offset-4">Listen to the latest sequence</p>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* 🧬 MASTER SIGNAL DECOR (Sides) */}
        <div className="absolute top-0 bottom-0 left-8 md:left-20 w-[1px] bg-white/5 flex flex-col items-center justify-center gap-24 py-32 pointer-events-none hidden md:flex">
             {[...Array(4)].map((_, i) => (
                 <div key={i} className="flex flex-col gap-1 items-center">
                    <div className="h-32 w-[1px] bg-white/5 overflow-hidden">
                        <div className="h-full w-full bg-white/20 animate-meter" style={{ animationDelay: `${i * 0.4}s` }} />
                    </div>
                    <span className="text-[8px] font-black vertical-text uppercase tracking-widest text-white/10 opacity-50">Signal_{i}</span>
                 </div>
             ))}
        </div>
    </section>
  )
}
