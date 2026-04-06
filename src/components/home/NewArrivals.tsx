'use client'
import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Disc } from 'lucide-react'
import { PriceDisplay } from '@/components/PriceDisplay'

interface Pack {
    id: string
    name: string
    slug: string
    cover_url: string | null
    categories?: { name: string }
    price_inr: number
    price_usd: number
}

export function NewArrivals({ packs }: { packs: Pack[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const textY = useTransform(scrollYProgress, [0, 1], [0, -200])

  return (
    <section ref={containerRef} className="px-4 md:px-20 py-24 md:py-48 bg-black border-t border-white/10 relative overflow-hidden">
        {/* 🎰 THE GHOST TITLE (Parallax Background) */}
        <motion.div 
            style={{ y: textY }}
            className="absolute top-20 left-1/2 -translate-x-1/2 text-[25rem] font-black text-white/5 whitespace-nowrap pointer-events-none select-none italic"
        >
            NEW — आगमन
        </motion.div>

        <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-32 gap-8">
                <div className="max-w-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 md:mb-8 block">नया आगमन</span>
                    <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-4">NEW<br />COLLECTIONS</h2>
                </div>
                <Link href="/browse" className="text-[10px] md:text-xs font-black uppercase tracking-widest border-b-2 border-white pb-2 md:pb-4 hover:opacity-50 transition-all self-start md:self-auto">
                    Discover All Sounds
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-1px bg-white/10">
                {packs?.map((pack, i) => {
                    // Each item moves at a slightly different speed (Parallax Grid)
                    const itemY = useTransform(scrollYProgress, [0, 1], [0, (i + 1) * -50])
                    
                    return (
                        <motion.div 
                            key={pack.id} 
                            style={{ y: itemY }}
                            className="group bg-black p-10 hover:bg-white transition-all cursor-pointer border border-white/5 md:border-none"
                        >
                            <Link href={`/packs/${pack.slug}`}>
                                <div className="aspect-[4/5] bg-white/5 mb-10 relative overflow-hidden bw-stark-border group-hover:border-black/20 transition-all">
                                    <div className="absolute inset-0 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000">
                                        {pack.cover_url ? (
                                            <Image 
                                                src={pack.cover_url} 
                                                alt={pack.name} 
                                                fill 
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                className="object-cover" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Disc className="h-24 w-24 text-white/5 group-hover:text-black/5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4 text-[10px] font-black bg-black text-white px-3 py-1 group-hover:bg-black group-hover:text-white">NEW</div>
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter mb-16 group-hover:text-black leading-none">{pack.name}</h3>
                                <div className="flex items-center justify-between group-hover:text-black pt-10 border-t border-white/10 group-hover:border-black/10">
                                    <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} className="text-xs font-black uppercase group-hover:text-black" />
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    </section>
  )
}
