'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, Sparkles, ArrowRight, Disc, Layers, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface SoftwareProduct {
    id: string
    name: string
    slug: string
    description: string
    price_inr: number
    cover_url: string
    current_version: string
}

export function SoftwareSpotlight({ products }: { products: SoftwareProduct[] }) {
  if (!products || products.length === 0) return null

  return (
    <section className="relative py-24 md:py-32 bg-studio-charcoal border-y-4 border-black overflow-hidden">
        {/* 🧬 BACKGROUND ARTIFACTS */}
        <div className="absolute top-0 right-0 p-24 opacity-[0.02] pointer-events-none">
            <Cpu className="h-64 w-64 md:h-96 md:w-96 animate-pulse" />
        </div>
        
        <div className="container mx-auto px-4 md:px-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon bg-black/60 px-4 py-1.5 self-start border-l-4 border-studio-neon">
                        SOFTWARE & TOOLS
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-10 md:h-16 w-1.5 bg-studio-neon shadow-[0_0_20px_#a6e22e]" />
                        <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter leading-none italic">
                            SOFT<span className="text-studio-neon">WARE</span>
                        </h2>
                    </div>
                </div>
                
                <Link href="/software" className="group flex items-center gap-6 px-10 py-5 bg-black border border-white/10 hover:border-studio-neon transition-all relative overflow-hidden self-start">
                    <span className="text-[10px] md:text-[12px] font-black uppercase tracking-widest relative z-10">EXPLORE ALL SOFTWARE</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                    <div className="absolute inset-0 bg-studio-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            <div className={`grid grid-cols-1 ${products.length === 1 ? 'lg:flex lg:justify-center' : 'lg:grid-cols-2'} gap-12 md:gap-20`}>
                {products.map((soft, i) => (
                    <motion.div 
                        key={soft.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`group relative bg-black border-4 border-black hover:border-white/5 transition-all overflow-hidden rounded-sm ${products.length === 1 ? 'max-w-4xl w-full' : ''}`}
                    >
                        {/* Brushed Metal Top Bar */}
                        <div className="brushed-metal px-6 py-3 border-b-2 border-black flex justify-between items-center bg-[#1a1a1a]">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-studio-neon animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">MODULE_0{i+1} : {soft.name}</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">v{soft.current_version}</span>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row h-full">
                            {/* Visual Port */}
                            <Link href={`/software/${soft.slug}`} className="block w-full md:w-1/2 aspect-square relative bg-studio-charcoal group-hover:brightness-110 transition-all overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-black">
                                {soft.cover_url ? (
                                    <Image 
                                        src={soft.cover_url} 
                                        alt={soft.name} 
                                        fill 
                                        priority={i === 0}
                                        loading={i === 0 ? "eager" : "lazy"}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center p-12 opacity-5">
                                        <Disc className="w-full h-full animate-spin-slow" />
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                            </Link>

                            {/* Data Port */}
                            <div className="w-full md:w-1/2 p-10 flex flex-col justify-start bg-studio-charcoal/40">
                                <div>
                                    <Link href={`/software/${soft.slug}`}>
                                        <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-6 group-hover:text-studio-neon transition-colors leading-none cursor-pointer">
                                            {soft.name}
                                        </h3>
                                    </Link>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-white/30 leading-loose mb-10 line-clamp-3 italic">
                                        {soft.description}
                                    </p>
                                    
                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center gap-4 text-white/40">
                                            <Layers size={14} className="text-studio-neon" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">WORKS WITH ALL DAWS</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-white/40">
                                            <Zap size={14} className="text-studio-yellow" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">FAST & POWERFUL</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-6 pt-10 border-t border-white/5 w-full mt-2">
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl md:text-5xl font-black italic tracking-tighter text-white">₹{soft.price_inr}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Lifetime License</span>
                                    </div>
                                    <Link 
                                        href={`/software/${soft.slug}`}
                                        className="w-full h-14 flex items-center justify-center bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-studio-neon transition-all gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                    >
                                        PURCHASE NOW <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Background Scanline Artifacts */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(rgba(166,226,46,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
                    </motion.div>
                ))}
            </div>
            
            <div className="mt-20 flex justify-center">
                <div className="flex items-center gap-6 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <span className="text-[8px] font-black uppercase tracking-[0.5em]">VST / AU COMPATIBLE</span>
                    <div className="h-px w-20 bg-white/20" />
                    <span className="text-[8px] font-black uppercase tracking-[0.5em]">MAC & WINDOWS</span>
                </div>
            </div>
        </div>
    </section>
  )
}
