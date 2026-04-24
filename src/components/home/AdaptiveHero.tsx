'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Activity, Cpu, Database, Zap } from 'lucide-react'
import Link from 'next/link'
import { HeroSearch } from './HeroSearch'
import { AnimatedHeroLogo } from './AnimatedHeroLogo'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export function AdaptiveHero() {
  const [isMounted, setIsMounted] = useState(false)
  const [meterCount, setMeterCount] = useState(32)

  useEffect(() => {
    setIsMounted(true)
    setMeterCount(window.innerWidth < 768 ? 12 : 32)
  }, [])

  return (
    <section className="relative min-h-[500px] md:min-h-[85vh] flex flex-col items-center justify-center pt-16 pb-12 md:pb-16 overflow-hidden bg-black w-full">
        
        {/* 📟 CYBER_GRID_ARRAY */}
        <div className="absolute inset-0 z-0 opacity-[0.15]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <motion.div 
                animate={{ 
                    backgroundPosition: ["0px 0px", "40px 40px"] 
                }}
                transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
                className="absolute inset-0 bg-[linear-gradient(to_right,#a6e22e05_1px,transparent_1px),linear-gradient(to_bottom,#a6e22e05_1px,transparent_1px)] bg-[size:200px_200px]"
            />
        </div>

        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-studio-neon opacity-[0.15] blur-[80px] md:blur-[180px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-spider-red opacity-[0.08] blur-[60px] md:blur-[150px] rounded-full" />
            
            {/* 🧬 LOGO WATERMARK */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
                <Image 
                    src="/Logo.png" 
                    alt="" 
                    fill
                    priority
                    loading="eager"
                    className="object-contain grayscale invert scale-110" 
                />
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black z-10" />
        </div>

        <div className="relative z-30 flex flex-col items-center text-center px-4 md:px-6 w-full max-w-full overflow-hidden mt-[-100px] md:mt-[-160px]">
            
            {/* LOGO CONTAINER */}
            <div className="mb-2 md:mb-4 relative w-full flex flex-col items-center justify-center">
                <div className="scale-[0.35] sm:scale-50 md:scale-[0.55] max-w-full">
                    <AnimatedHeroLogo />
                </div>
                {/* 🧬 BRAND_IDENTITY_CORE */}
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mt-[-30px] sm:mt-[-40px] md:mt-[-60px] text-[8px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/60 italic px-4 text-center max-w-2xl studio-glow"
                >
                    India's Biggest Platform For Samples, Plugins And Music Production Tools
                </motion.p>
            </div>

            {/* 🔎 MASTER SEARCH - ENSURE CENTERED */}
            <div className="w-full max-w-3xl flex justify-center mb-6 md:mb-10 px-2">
                <HeroSearch />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-12 w-full justify-center px-4 max-w-2xl">
                <Link href="/browse" className="relative group overflow-hidden flex items-center justify-center gap-6 px-10 py-6 bg-white text-black font-black uppercase tracking-widest text-[11px] md:text-[14px] transition-all shadow-2xl border-r-[8px] md:border-r-[16px] border-studio-yellow w-full xs:w-auto text-center hover:shadow-[0_0_30px_rgba(166,226,46,0.5)]">
                    <span className="relative z-10 flex items-center gap-4">
                        Browse Samples <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-studio-neon translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>

                <div className="hidden sm:flex items-center gap-4 group cursor-pointer sm:border-l border-white/10 sm:pl-10 w-full sm:w-auto justify-center">
                    <div className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center border-2 border-white/10 group-hover:border-studio-neon transition-all bg-black/80 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                         <Play size={20} fill="currentColor" className="text-white group-hover:text-studio-neon transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-studio-neon">Sound Preview</p>
                        <p className="text-[8px] md:text-[10px] text-white/20 font-bold uppercase tracking-widest italic group-hover:text-white">Listen to high-quality audio</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 🌊 FLOATING_AUDIO_DECOR */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-20 z-0">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                <motion.path 
                    animate={{ d: [
                        "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                        "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,139,864,133.3C960,128,1056,96,1152,101.3C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ]}}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    fill="#a6e22e" 
                    fillOpacity="0.3"
                ></motion.path>
            </svg>
        </div>

        {/* Level Decor - Responsive count */}
        <div className="absolute bottom-6 left-0 right-0 h-10 flex items-end gap-[2px] md:gap-1 px-4 opacity-10 pointer-events-none justify-center">
             {/* Animating meter removed to avoid "fake loader" perception */}
        </div>
    </section>
  )
}
