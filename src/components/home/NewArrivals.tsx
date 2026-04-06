'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { Music2, Play, Plus, Info, Layers, ArrowRight } from 'lucide-react'

export function NewArrivals({ packs }: { packs: any[] }) {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const textY = useTransform(scrollYProgress, [0, 1], [-100, 100])

  return (
    <SectionReveal className="relative py-24 bg-transparent overflow-hidden" ref={containerRef}>
        {/* 🧬 BACKGROUND PARALLAX TEXT */}
        <motion.div 
            style={{ y: textY }}
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[15rem] font-black text-white/5 whitespace-nowrap pointer-events-none select-none italic"
        >
            FRESH_ARTIFACTS
        </motion.div>

        <div className="relative z-10 container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon bg-black/40 px-4 py-1 self-start border-l-4 border-studio-neon">
                        Marketplace_Unit :: New_Arrivals
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-1 bg-studio-neon shadow-[0_0_15px_#a6e22e]" />
                        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                            FRESH<span className="text-studio-neon">_SAMPLES</span>
                        </h2>
                    </div>
                </div>
                <Link href="/browse" className="group flex items-center gap-4 px-10 py-5 bg-black border-2 border-white/5 hover:border-studio-neon transition-all relative overflow-hidden">
                    <span className="text-[11px] font-black uppercase tracking-widest relative z-10">BROWSE_CATALOG</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform" />
                    <div className="absolute inset-0 bg-studio-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {packs && packs.length > 0 ? (
                    packs.map((pack, i) => (
                        <div key={pack.id} className="studio-panel bg-studio-grey border-2 border-white/10 group shadow-2xl relative">
                            {/* VST Header Bar */}
                            <div className="bg-[#111] px-4 py-2 flex items-center justify-between border-b border-black">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 truncate pr-10">{pack.name}</span>
                                <div className="flex gap-1.5 opacity-40">
                                    <div className="w-2 h-2 rounded-full bg-white/20" />
                                    <div className="w-2 h-2 rounded-full bg-white/20" />
                                    <div className="w-2 h-2 rounded-full bg-white/20" />
                                </div>
                            </div>
                            
                            <Link href={`/packs/${pack.slug}`} className="block p-4 bg-black/40 hover:bg-black transition-all">
                                <div className="aspect-square relative overflow-hidden mb-6 border border-white/5">
                                    {pack.cover_url ? (
                                        <Image 
                                            src={pack.cover_url} 
                                            alt={pack.name} 
                                            fill 
                                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 opacity-60 group-hover:opacity-100" 
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Music2 className="h-16 w-16 text-white/5" />
                                        </div>
                                    )}
                                    
                                    {/* 🧬 SIGNAL ANALYZE FILTER (Hover) */}
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-studio-neon scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                                </div>
                                
                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">TYPE: {pack.categories?.name || 'PACK'}</span>
                                        <span className="text-xl font-black text-white tracking-tighter">₹{pack.price_inr}</span>
                                    </div>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-studio-neon text-black opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center border-4 border-dashed border-white/5 text-white/10 uppercase font-black tracking-widest italic">
                        <Layers className="w-16 h-16 mb-4 opacity-10" />
                        SEARCH_CATALOG_ACTIVE...
                    </div>
                )}
            </div>
        </div>
    </SectionReveal>
  )
}
