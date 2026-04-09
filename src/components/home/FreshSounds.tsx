'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Play, Info, Layers, Music2, Activity, Sparkles } from 'lucide-react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { Carousel } from '@/components/ui/Carousel'

interface FreshSoundsProps {
  samples: any[]
  unlockedSampleIds: string[]
}

export function FreshSounds({ samples = [], unlockedSampleIds = [] }: FreshSoundsProps) {
  return (
    <SectionReveal className="relative py-32 bg-black/40 border-y-8 border-black overflow-hidden block" style={{ position: 'relative' }}>
        {/* 🧬 STUDIO AMBIENCE BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon bg-black/60 px-4 py-1 self-start border-l-4 border-studio-neon">
                        Signal_Intake :: Fresh Sounds
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="h-10 md:h-14 w-1 bg-studio-neon shadow-[0_0_15px_#a6e22e]" />
                        <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                            FRESH<span className="text-white/20"> SOUNDS</span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-12 bg-black/40 p-6 border border-white/5 backdrop-blur-md">
                     <div className="hidden md:flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">LIVE_SIGNAL_STREAM</span>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-4 h-1 bg-studio-neon" />
                            ))}
                        </div>
                    </div>
                    <Link 
                        href="/browse?type=samples&sort=newest" 
                        className="group flex items-center gap-4 text-[12px] font-black uppercase tracking-widest hover:text-studio-neon transition-all"
                    >
                        DISCOVER_ALL_SIGNALS
                        <div className="w-12 h-1 bg-white/10 group-hover:bg-studio-neon overflow-hidden">
                             <motion.div 
                                className="w-full h-full bg-studio-neon"
                                animate={{ x: [-48, 48] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                             />
                        </div>
                    </Link>
                </div>
            </div>

            {/* 🎚️ SOUND GRID TERMINAL (Horizontal Scroll) */}
            <Carousel className="w-full">
                {samples.map((sample, index) => (
                    <motion.div 
                        key={sample.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative bg-[#0a0a0a] border border-white/5 p-6 hover:bg-[#111] transition-all hover:border-studio-neon/30 h-full"
                    >
                         {/* Signal Indicator */}
                        <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="w-3 h-3 text-studio-neon" />
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative shrink-0 overflow-hidden bg-black border border-white/10">
                                <Image
                                    src={sample.sample_packs?.cover_url || '/placeholder.png'}
                                    alt={sample.name}
                                    width={64}
                                    height={64}
                                    className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 flex items-center justify-center translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                                     <PlayButton 
                                        id={sample.id}
                                        url={sample.audio_url}
                                        name={sample.name}
                                        packName={sample.sample_packs?.name}
                                        coverUrl={sample.sample_packs?.cover_url}
                                        bpm={sample.bpm}
                                        audioKey={sample.key}
                                        isUnlocked={unlockedSampleIds.includes(sample.id)}
                                        creditCost={sample.credit_cost}
                                     />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold tracking-tight truncate uppercase text-sm mb-1 group-hover:text-studio-neon transition-colors">
                                    {sample.name}
                                </h3>
                                {(sample.bpm || sample.key) ? (
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white/40 tracking-widest italic">
                                        {sample.bpm && <span>{sample.bpm} BPM</span>}
                                        {sample.bpm && sample.key && <div className="w-1 h-1 rounded-full bg-white/20" />}
                                        {sample.key && <span>{sample.key}</span>}
                                    </div>
                                ) : (
                                    <div className="text-[8px] font-black uppercase text-white/10 tracking-[0.2em]">Metadata Pending</div>
                                )}
                                <p className="text-[8px] text-white/20 truncate mt-2 font-mono">
                                    FROM: {sample.sample_packs?.name || 'STUDIO_ARCHIVE'}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                                 <DownloadButton 
                                    sampleId={sample.id}
                                    isUnlockedInitial={unlockedSampleIds.includes(sample.id)}
                                    creditCost={sample.credit_cost || 1}
                                 />
                                 <div className="text-[10px] font-black text-studio-neon opacity-40">
                                    {sample.credit_cost || 1}CR
                                 </div>
                            </div>
                        </div>

                        {/* Aesthetic Footer Strip */}
                        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-studio-neon group-hover:w-full transition-all duration-700" />
                    </motion.div>
                ))}
            </Carousel>
            
            {/* 🧬 STATIONARY STATUS BAR */}
            <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
                 <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-studio-neon animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/40">MASTER_OUT</span>
                    </div>
                    <div className="hidden md:block text-[10px] font-black uppercase text-white/20 tracking-tighter">
                        ENCODING: 24-BIT / 96KHZ | STUDIO_GRADE_READY
                    </div>
                 </div>
                 <Activity className="w-4 h-4 text-white/10" />
            </div>
        </div>
    </SectionReveal>
  )
}
