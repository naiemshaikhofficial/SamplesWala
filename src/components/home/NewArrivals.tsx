'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useEffect, useState } from 'react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Music2 } from 'lucide-react'

export function NewArrivals() {
  const containerRef = useRef(null)
  const [packs, setPacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const textY = useTransform(scrollYProgress, [0, 1], [-100, 100])

  useEffect(() => {
    async function fetchPacks() {
      setLoading(true)
      const { data, error } = await supabase
        .from('sample_packs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (!error && data) {
        setPacks(data)
      }
      setLoading(false)
    }
    fetchPacks()
  }, [supabase])

  return (
    <SectionReveal className="relative py-24 md:py-48 bg-black overflow-hidden" ref={containerRef}>
        {/* 🧬 BACKGROUND PARALLAX TEXT */}
        <motion.div 
            style={{ y: textY }}
            className="absolute top-20 left-1/2 -translate-x-1/2 text-[25rem] font-black text-white/5 whitespace-nowrap pointer-events-none select-none italic"
        >
            NEW — आगमन
        </motion.div>

        <div className="relative z-10 px-4 md:px-20 container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-32 gap-8">
                <div className="max-w-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 md:md-8 block italic">नया आगमन</span>
                    <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-4">NEW<br />COLLECTIONS</h2>
                </div>
                <Link href="/browse" className="text-[10px] md:text-xs font-black uppercase tracking-widest border-b-2 border-white pb-2 md:pb-4 hover:opacity-50 transition-all self-start md:self-auto uppercase">
                    Discover All Packs
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24 items-start">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-white/[0.02] animate-pulse border border-white/5" />
                    ))
                ) : (
                    packs.map((pack, i) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8, y: 50, rotate: i % 2 === 0 ? -2 : 2 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ 
                                duration: 1.2, 
                                delay: i * 0.2,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            key={pack.id} 
                            className="group relative"
                        >
                            <Link href={`/packs/${pack.slug}`} className="block">
                                <div className="aspect-[4/5] bg-white/5 overflow-hidden relative mb-8 border border-white/5 group-hover:border-white/20 transition-all duration-700">
                                    <Image 
                                        src={pack.cover_url || 'https://images.unsplash.com/photo-1514525253361-bee87380cf40?q=80&w=400&h=500&auto=format&fit=crop'} 
                                        alt={pack.name} 
                                        fill 
                                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                    />
                                    {/* 🧬 SIGNAL ANALYZE FILTER (Hover) */}
                                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 z-30" />
                                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 mix-blend-color transition-all duration-700" />
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.8] underline decoration-white/0 group-hover:decoration-white transition-all underline-offset-4">
                                        {pack.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-emerald-400 transition-colors border border-white/5 group-hover:border-white/20 px-3 py-1 bg-white/[0.02]">
                                            FROM ₹{pack.price_inr}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 group-hover:text-white transition-colors py-1 italic">
                                            Premium Artifact Drop
                                        </span>
                                    </div>
                                </div>
    
                                {/* 🧬 Audio Meter Accent */}
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Music2 className="h-4 w-4 animate-bounce text-emerald-400" />
                                </div>
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    </SectionReveal>
  )
}
