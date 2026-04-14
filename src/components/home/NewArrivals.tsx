'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { Music2, Plus, Layers, ArrowRight } from 'lucide-react'

export function NewArrivals({ packs }: { packs: any[] }) {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const textY = useTransform(scrollYProgress, [0, 1], [-100, 100])

  return (
    <SectionReveal className="relative py-16 md:py-24 bg-transparent overflow-hidden block" ref={containerRef} style={{ position: 'relative' }}>
        {/* 🧬 BACKGROUND PARALLAX TEXT */}
        <motion.div 
            style={{ y: textY }}
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[10rem] md:text-[15rem] font-black text-white/[0.03] whitespace-nowrap pointer-events-none select-none italic"
        >
            NEW PACKS
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon bg-black/40 px-4 py-1 self-start border-l-4 border-studio-neon">
                        Signal_Intake :: Latest Packs
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-10 md:h-14 w-1 bg-studio-neon shadow-[0_0_15px_#a6e22e]" />
                        <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                            NEW<span className="text-studio-neon"> PACKS</span>
                        </h2>
                    </div>
                </div>
                <Link href="/browse?sort=newest" className="group flex items-center gap-4 px-8 py-4 md:px-10 md:py-5 bg-black border-2 border-white/5 hover:border-studio-neon transition-all relative overflow-hidden self-start">
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest relative z-10">Expand_Archive_Matrix</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform" />
                    <div className="absolute inset-0 bg-studio-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            <div className="w-full">
                {packs && packs.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mt-8">
                        {packs.map((pack, i) => (
                            <motion.div 
                                key={pack.id} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="studio-panel bg-studio-grey border-2 border-white/10 group shadow-2xl relative h-full flex flex-col"
                            >
                                {/* VST Header Bar */}
                                <div className="bg-[#111] px-3 py-1.5 flex items-center justify-between border-b border-black">
                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 truncate pr-4">{pack.name}</span>
                                    <div className="flex gap-1 opacity-40 shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    </div>
                                </div>
                                
                                <Link href={`/packs/${pack.slug}`} className="block p-3 md:p-4 bg-black/40 hover:bg-black transition-all flex-1">
                                    <div className="aspect-square relative overflow-hidden mb-4 border border-white/5 bg-black/20">
                                        {pack.cover_url ? (
                                            <Image 
                                                src={pack.cover_url} 
                                                alt={`${pack.name} - ${pack.categories?.name || 'Pro'} Sample Pack | SamplesWala`} 
                                                fill 
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                priority={i < 2}
                                                loading={i < 2 ? "eager" : "lazy"}
                                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 opacity-60 group-hover:opacity-100" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Music2 className="h-12 w-12 text-white/5" />
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-studio-neon scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                                    </div>
                                    
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[8px] font-black text-studio-neon uppercase tracking-widest">
                                                    {pack.categories?.name ? `${pack.categories.name} SAMPLE PACK` : 'SAMPLE PACK'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg md:text-xl font-black text-white tracking-tighter italic">₹{pack.price_inr}</span>
                                                <div className="h-8 w-8 flex items-center justify-center rounded-sm bg-studio-neon text-black opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </SectionReveal>
  )
}
