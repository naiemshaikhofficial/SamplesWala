'use client'
import React from 'react'
import Image from 'next/image'
import { Disc, ArrowRight, Activity } from 'lucide-react'
import Link from 'next/link'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { PriceDisplay } from '@/components/PriceDisplay'
import { motion } from 'framer-motion'

interface Sample {
    id: string
    name: string
    audio_url: string
    credit_cost: number
    bpm?: number
    key?: string
    sample_packs?: { 
        name: string
        cover_url?: string | null
        slug?: string
    }
}

export function TopSounds({ samples, unlockedSampleIds = [] }: { samples: Sample[], unlockedSampleIds?: string[] }) {
  const unlockedSet = new Set(unlockedSampleIds)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
        y: 20, 
        opacity: 0, 
        scale: 0.95,
        filter: 'blur(10px)'
    },
    visible: { 
        y: 0, 
        opacity: 1, 
        scale: 1, 
        filter: 'blur(0px)',
        transition: { 
            duration: 0.8
        }
    }
  }

  return (
    <section className="px-4 md:px-20 py-24 md:py-48 bg-[#050505] border-t border-white/10 relative overflow-hidden">
        {/* 🧬 ANALOG BACKGROUND PULSE */}
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-20" />

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-32 gap-8 relative z-10">
            <div className="max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 md:mb-8 block">लोकप्रिय ध्वनियाँ</span>
                <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-4 italic">TOP<br />SOUNDS</h2>
            </div>
            <Link href="/browse?mode=samples" className="text-[10px] md:text-xs font-black uppercase tracking-widest border-b-2 border-white pb-2 md:pb-4 hover:opacity-50 transition-all self-start md:self-auto">
                Audition All Samples
            </Link>
        </div>

        <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 relative z-10"
        >
            {samples?.map((sample) => (
                <motion.div 
                    key={sample.id} 
                    variants={itemVariants}
                    className="group relative bg-black aspect-square overflow-hidden bw-stark-border hover:border-white transition-all duration-700 p-1"
                >
                    <div className="relative h-full w-full bg-[#111] overflow-hidden">
                        {/* 🧬 CARD LEVEL SCAN LINE */}
                        <div className="animate-scan hidden group-hover:block" />
                        
                        <div className="absolute inset-0 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-40 group-hover:opacity-80">
                            {sample.sample_packs?.cover_url ? (
                                <Image src={sample.sample_packs.cover_url} alt={sample.name} fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Disc className="h-12 w-12 text-white/5" />
                                </div>
                            )}
                        </div>

                        {/* 💿 CENTERED PLAY COMMAND */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center transform-gpu scale-75 group-hover:scale-100 transition-all duration-500">
                            <PlayButton 
                                id={sample.id} 
                                url={sample.audio_url} 
                                name={sample.name}
                                packName={sample.sample_packs?.name}
                                coverUrl={sample.sample_packs?.cover_url}
                            />
                        </div>

                        {/* 💿 ACTION HUD & SIGNAL SYNC */}
                        <div className="absolute top-4 left-4 z-30 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2">
                             <DownloadButton 
                                sampleId={sample.id} 
                                isUnlockedInitial={unlockedSet.has(sample.id)} 
                                creditCost={sample.credit_cost}
                            />
                            <div className="flex gap-[2px]">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-[3px] h-[3px] bg-white animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
                                ))}
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black uppercase tracking-widest text-white/40">
                             {sample.bpm || '--'} BPM
                        </div>

                        {/* 💿 GHOST TITLE OVERLAY */}
                        <div className="absolute bottom-0 left-0 w-full p-4 z-10 bg-gradient-to-t from-black via-black/40 to-transparent">
                            <div className="flex items-end justify-between">
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-white block mb-1">
                                        {sample.sample_packs?.name || 'ARTIFACT'}
                                    </span>
                                    <h3 className="text-sm font-black uppercase tracking-tight group-hover:italic transition-all">
                                        {sample.name}
                                    </h3>
                                </div>
                                <Link 
                                    href={`/packs/${sample.sample_packs?.slug || ''}`} 
                                    className="opacity-0 group-hover:opacity-100 transition-all text-white/40 hover:text-white flex items-center gap-2 group/link"
                                >
                                    <span className="text-[7px] font-black uppercase tracking-widest translate-x-2 group-hover/link:translate-x-0 transition-transform">Bundle</span>
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>

                        {/* 💿 GLOBAL SURFACE LINK */}
                        <Link 
                            href={`/packs/${sample.sample_packs?.slug || ''}`} 
                            className="absolute inset-0 z-0" 
                        />
                    </div>
                </motion.div>
            ))}
        </motion.div>

        <div className="mt-16 md:mt-24 p-6 md:p-12 bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4 md:gap-6">
                <Activity className="h-10 w-10 md:h-12 md:w-12 text-white/20 shrink-0" />
                <div>
                    <h4 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none mb-2">Custom Sound Request?</h4>
                    <p className="text-white/30 text-[9px] md:text-xs font-black uppercase tracking-widest">Our producers release new premium sounds every week.</p>
                </div>
            </div>
            <Link href="/browse?mode=samples" className="w-full md:w-auto text-center px-10 md:px-12 py-4 md:py-5 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] hover:bg-transparent hover:text-white border border-white transition-all whitespace-nowrap">
                Browse All Samples
            </Link>
        </div>
    </section>
  )
}
