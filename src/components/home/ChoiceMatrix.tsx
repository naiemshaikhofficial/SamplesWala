
'use client'

import React from 'react'
import { Music, Layers, ArrowRight, Zap, Target, Database } from 'lucide-react'
import Link from 'next/link'

export function ChoiceMatrix() {
    return (
        <section className="relative z-20 py-24 md:py-40 bg-black overflow-hidden">
            {/* 🧬 BACKGROUND ARTIFACTS */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-studio-neon/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-spider-red/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-20 relative">
                {/* 📡 HEADER_SIGNAL */}
                <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                    <div className="flex items-center gap-4 mb-8 bg-white/5 px-6 py-2 border border-white/10 rounded-full">
                        <Zap size={14} className="text-studio-neon animate-bounce" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-studio-neon">FLEXIBLE ACQUISITION</span>
                    </div>
                    <h2 className="text-5xl md:text-[7rem] font-black uppercase tracking-tighter leading-none italic mb-8 transform -skew-x-12">
                        YOUR WORKFLOW,<br/>
                        <span className="text-studio-neon drop-shadow-[0_0_30px_rgba(166,226,46,0.3)]">YOUR RULES.</span>
                    </h2>
                    <p className="text-lg md:text-2xl font-bold text-white/40 max-w-2xl uppercase tracking-tight">
                        Don't get locked into bundles. Grab a single artifact or the entire arsenal. 
                        <span className="text-white"> Choice is yours.</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    {/* 🕹️ SINGLE SOUNDS */}
                    <div className="group relative p-10 md:p-20 border-2 border-white/5 bg-[#0a0a0a] hover:border-studio-neon transition-all duration-700 perspective-lg overflow-hidden rounded-sm">
                        <div className="absolute -top-10 -right-10 text-[12rem] font-black text-white/[0.02] italic pointer-events-none group-hover:scale-110 group-hover:text-studio-neon/[0.04] transition-all duration-700">
                            01
                        </div>
                        
                        <div className="relative z-10 space-y-12">
                            <div className="h-24 w-24 bg-black border-2 border-white/10 flex items-center justify-center text-studio-neon shadow-[0_0_50px_rgba(166,226,46,0.15)] group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                                <Target size={48} />
                            </div>
                            
                            <div className="space-y-6">
                                <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">SINGLE<br/>SOUNDS</h3>
                                <p className="text-xl md:text-2xl font-bold text-white/40 group-hover:text-white/80 transition-colors leading-tight">
                                    Don't need the whole pack? Just pick the sounds you like and save your credits.
                                    <span className="text-studio-neon block mt-6 font-black text-sm tracking-widest bg-studio-neon/10 py-2 px-4 border-l-4 border-studio-neon w-fit">INDIVIDUAL SOUNDS FROM 1 CREDIT</span>
                                </p>
                            </div>

                            <Link href="/browse" className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-studio-neon transition-all pt-4">
                                BROWSE SOUNDS <ArrowRight className="h-5 w-5 group-hover:translate-x-3 transition-transform" />
                            </Link>
                        </div>
                        
                        {/* Interactive Scan Line */}
                        <div className="absolute inset-x-0 h-[2px] bg-studio-neon/40 top-0 -translate-y-full group-hover:animate-scan-slow pointer-events-none" />
                    </div>

                    {/* 🎰 FULL PACKS */}
                    <div className="group relative p-10 md:p-20 border-2 border-white/5 bg-[#0a0a0a] hover:border-spider-red transition-all duration-700 perspective-lg overflow-hidden rounded-sm">
                         <div className="absolute -top-10 -right-10 text-[12rem] font-black text-white/[0.02] italic pointer-events-none group-hover:scale-110 group-hover:text-spider-red/[0.04] transition-all duration-700">
                            02
                        </div>

                        <div className="relative z-10 space-y-12">
                            <div className="h-24 w-24 bg-black border-2 border-white/10 flex items-center justify-center text-spider-red shadow-[0_0_50px_rgba(255,0,51,0.15)] group-hover:-rotate-12 group-hover:scale-110 transition-all duration-500">
                                <Database size={48} />
                            </div>
                            
                            <div className="space-y-6">
                                <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">FULL<br/>PACKS</h3>
                                <p className="text-xl md:text-2xl font-bold text-white/40 group-hover:text-white/80 transition-colors leading-tight">
                                    Want everything? Get the complete pack in one click and save big on credits.
                                    <span className="text-spider-red block mt-6 font-black text-sm tracking-widest bg-spider-red/10 py-2 px-4 border-l-4 border-spider-red w-fit">GET 60% OFF ON FULL BUNDLES</span>
                                </p>
                            </div>

                            <Link href="/browse?filter=bundles" className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-spider-red transition-all pt-4">
                                EXPLORE PACKS <ArrowRight className="h-5 w-5 group-hover:translate-x-3 transition-transform" />
                            </Link>
                        </div>

                        {/* Interactive Red Scan Line */}
                        <div className="absolute inset-x-0 h-[2px] bg-spider-red/40 top-0 -translate-y-full group-hover:animate-scan-slow pointer-events-none" />
                    </div>
                </div>

                {/* 🔩 DECORATIVE HARDWARE BOLTS */}
                <div className="absolute top-4 left-4 h-2 w-2 rounded-full bg-white/10" />
                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-white/10" />
                <div className="absolute bottom-4 left-4 h-2 w-2 rounded-full bg-white/10" />
                <div className="absolute bottom-4 right-4 h-2 w-2 rounded-full bg-white/10" />
            </div>
        </section>
    )
}
