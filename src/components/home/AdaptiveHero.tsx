'use client'
import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedHeroLogo } from './AnimatedHeroLogo'
import { HeroSearch } from './HeroSearch'

import { TextScramble } from '@/components/ui/TextScramble'

export function AdaptiveHero() {
  const [query, setQuery] = useState('')

  // 🏛️ VIBE ENGINE 
  const vibe = useMemo(() => {
    const q = query.toLowerCase()
    if (q.includes('bollywood') || q.includes('party') || q.includes('vibrant')) return 'vibrant'
    if (q.includes('aggressive') || q.includes('drill') || q.includes('trap')) return 'aggressive'
    if (q.includes('sufi') || q.includes('peace') || q.includes('holy') || q.includes('traditional')) return 'sufi'
    if (q.includes('future') || q.includes('tech') || q.includes('cyber')) return 'future'
    return 'default'
  }, [query])

  // 🎨 FILTER CONFIG (Professional Studio Grade)
  const getFilter = () => {
    switch(vibe) {
      case 'vibrant': return 'saturate(1.4) contrast(1.1)'
      case 'aggressive': return 'grayscale(1) contrast(1.5) brightness(0.8)'
      case 'sufi': return 'sepia(0.3) brightness(0.9) contrast(0.9)'
      case 'future': return 'hue-rotate(180deg) saturate(1.2)'
      default: return 'grayscale(1) brightness(0.5)'
    }
  }

  return (
    <section className="min-h-[80vh] md:min-h-screen flex flex-col items-center justify-center px-4 md:px-20 relative overflow-hidden py-20 md:py-0 transition-colors duration-1000 bg-black">
        {/* 🖼️ ADAPTIVE BACKDROP (Rhythmic Reveal) */}
        <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ 
                filter: getFilter(),
                scale: 1,
                opacity: 1
            }}
            transition={{ 
                duration: 2, 
                ease: [0.16, 1, 0.3, 1] 
            }}
            className="absolute inset-0 z-0 pointer-events-none"
        >
            <Image 
                src="/indian_studio.png" 
                alt="Mumbai Studio" 
                fill 
                sizes="100vw"
                className="object-cover opacity-60"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </motion.div>

        {/* 🌬️ ADAPTIVE DEVANAGARI MARQUEE (Musician Focus) */}
        <div className="absolute top-1/2 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.02] pointer-events-none z-0 -translate-y-1/2">
            <motion.div 
                animate={{ 
                    x: ["0%", "-50%"]
                }}
                transition={{ 
                    x: { repeat: Infinity, duration: 60, ease: "linear" }
                }}
                className="text-[25rem] font-black uppercase inline-block italic tracking-tighter"
            >
                सैंपल्स वाला सैंपल्स वाला सैंपल्स वाला सैंपल्स वाला
            </motion.div>
        </div>

        <div className="relative z-10 w-full max-w-7xl flex flex-col items-center text-center">
            <div className="flex items-center gap-4 mb-8 md:mb-12">
                <div className="h-px w-8 bg-white/20" />
                <TextScramble 
                    key={vibe}
                    text={`MODERN HERITAGE / ${vibe === 'default' ? 'मुम्बई साउंड' : vibe.toUpperCase()}`}
                    className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.6em] text-white/60 block"
                    duration={1200}
                />
                <div className="h-px w-8 bg-white/20" />
            </div>
            
            <AnimatedHeroLogo />
            
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl mb-12"
            >
               <HeroSearch onSearchChange={setQuery} />
            </motion.div>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="max-w-2xl text-lg md:text-3xl font-medium tracking-tight leading-snug mb-12 md:mb-16 px-4 md:px-0"
            >
                Crafting the future of Indian music. Cinematic, high-contrast, and 
                profoundly local. Premium samples for digital music producers.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
            >
                <Link href="/browse" className="relative group overflow-hidden flex items-center gap-8 px-16 py-8 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0">
                    <span className="relative z-10 flex items-center gap-4">
                        DISCOVER ALL SOUNDS <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="absolute inset-0 flex items-center justify-center gap-4 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
                        START CREATING NOW <ArrowRight className="h-4 w-4" />
                    </span>
                </Link>
            </motion.div>
        </div>
    </section>
  )
}
