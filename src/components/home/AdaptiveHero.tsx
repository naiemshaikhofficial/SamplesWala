'use client'
import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedHeroLogo } from './AnimatedHeroLogo'
import { HeroSearch } from './HeroSearch'

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

  // 🎨 FILTER CONFIG
  const getFilter = () => {
    switch(vibe) {
      case 'vibrant': return 'grayscale(0) hue-rotate(45deg) brightness(1.1)'
      case 'aggressive': return 'grayscale(1) sepia(1) hue-rotate(-50deg) saturate(5) brightness(0.8)'
      case 'sufi': return 'grayscale(0.5) sepia(1) brightness(0.9) saturate(0.8)'
      case 'future': return 'grayscale(0) hue-rotate(180deg) brightness(1.2)'
      default: return 'grayscale(1) brightness(0.6)'
    }
  }

  return (
    <section className="min-h-[80vh] md:min-h-screen flex flex-col items-center justify-center px-4 md:px-20 relative overflow-hidden py-20 md:py-0 transition-colors duration-1000">
        {/* 🖼️ ADAPTIVE BACKDROP */}
        <motion.div 
            initial={false}
            animate={{ filter: getFilter() }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-0 pointer-events-none"
        >
            <Image 
                src="/indian_studio.png" 
                alt="Mumbai Studio" 
                fill 
                sizes="100vw"
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </motion.div>

        {/* 🌬️ ADAPTIVE DEVANAGARI MARQUEE */}
        <div className="absolute top-1/2 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.03] pointer-events-none z-0 -translate-y-1/2">
            <motion.div 
                animate={{ 
                    x: ["0%", "-50%"],
                    color: vibe === 'vibrant' ? '#ff00ff' : '#ffffff' 
                }}
                transition={{ 
                    x: { repeat: Infinity, duration: 40, ease: "linear" },
                    color: { duration: 2 }
                }}
                className="text-[20rem] font-bold uppercase inline-block italic"
            >
                सैंपल्स वाला सैंपल्स वाला सैंपल्स वाला सैंपल्स वाला
            </motion.div>
        </div>

        <div className="relative z-10 w-full max-w-7xl flex flex-col items-center text-center">
            <motion.span 
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-8 md:mb-12 block"
            >
                MODERN HERITAGE / {vibe === 'default' ? 'मुम्बई साउंड' : vibe.toUpperCase()}
            </motion.span>
            
            <AnimatedHeroLogo />
            
            <div className="w-full max-w-4xl mb-12">
               <HeroSearch onSearchChange={setQuery} />
            </div>

            <p className="max-w-2xl text-lg md:text-3xl font-medium tracking-tight leading-snug mb-12 md:mb-16 opacity-60 px-4 md:px-0">
                Crafting the future of Indian music. Cinematic, high-contrast, and 
                profoundly local. Premium sounds for the high-end producer.
            </p>

            <Link href="/browse" className="mt-12 md:mt-16 group flex items-center gap-4 md:gap-6 px-10 md:px-16 py-6 md:py-8 bg-white/5 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-white hover:text-black transition-all border border-white/10 shrink-0 mx-4 md:mx-0">
                EXPLORE ALL COLLECTIONS <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </Link>
        </div>
    </section>
  )
}
