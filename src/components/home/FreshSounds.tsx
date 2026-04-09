'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, Sparkles } from 'lucide-react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'

interface FreshSoundsProps {
  samples: any[]
  unlockedSampleIds: string[]
}

export function FreshSounds({ samples = [], unlockedSampleIds = [] }: FreshSoundsProps) {
  return (
    <SectionReveal className="relative py-24 bg-black/40 border-y-4 border-white/5 overflow-hidden block" style={{ position: 'relative' }}>
        {/* 🧬 STUDIO AMBIENCE BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon bg-black/60 px-4 py-1 self-start border-l-4 border-studio-neon">
                        Signal_Buffer :: Fresh Sounds
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="h-10 md:h-14 w-1 bg-studio-neon shadow-[0_0_15px_#a6e22e]" />
                        <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                            FRESH<span className="text-white/20"> SOUNDS</span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-8 md:gap-12 bg-black p-4 md:p-6 border border-white/5">
                    <div className="hidden lg:flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">LIVE_SIGNAL_STREAM</span>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-4 h-1 bg-studio-neon/40" />
                            ))}
                        </div>
                    </div>
                    <Link 
                        href="/browse?type=samples&sort=newest" 
                        className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-widest hover:text-studio-neon transition-all"
                    >
                        BROWSE_ALL
                        <div className="w-12 h-1 bg-white/10 group-hover:bg-studio-neon overflow-hidden hidden md:block">
                             <motion.div 
                                className="w-full h-full bg-studio-neon"
                                animate={{ x: [-48, 48] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                             />
                        </div>
                    </Link>
                </div>
            </div>

            {/* 🎚️ SOUND LIST TERMINAL (Vertical List with Original Animations) */}
            <div className="flex flex-col gap-2 md:gap-3 w-full max-w-5xl mx-auto">
                {/* Header for Desktop */}
                <div className="hidden md:flex items-center px-8 py-2 text-[8px] font-black uppercase text-white/20 tracking-[0.3em] border-b border-white/5 mb-2">
                    <div className="w-16">Preview</div>
                    <div className="flex-1">Source_Information</div>
                    <div className="w-48 text-center">Technical_Data</div>
                    <div className="w-32 text-right">Action</div>
                </div>

                {samples.slice(0, 10).map((sample, index) => {
                    const isUnlocked = unlockedSampleIds.includes(sample.id)
                    return (
                        <motion.div 
                            key={sample.id}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.03 }}
                            className="group relative bg-[#0d0d0d] border border-white/5 hover:border-studio-neon/40 transition-all flex items-center px-3 py-3 md:px-8 md:py-5 gap-4 md:gap-8 overflow-hidden"
                        >
                            {/* Signal Indicator (Hover Effect) */}
                            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <Sparkles className="w-3 h-3 text-studio-neon animate-pulse" />
                            </div>

                            {/* Play Action (Restored Slide-up Animation) */}
                            <div className="relative shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-black border border-white/10 group-hover:border-studio-neon/50 overflow-hidden transition-colors">
                                <Image
                                    src={sample.sample_packs?.cover_url || '/placeholder.png'}
                                    alt={sample.name}
                                    fill
                                    className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                                />
                                {/* THE BUTTON SLIDE ANIMATION */}
                                <div className="absolute inset-0 flex items-center justify-center translate-y-12 group-hover:translate-y-0 transition-transform duration-300 z-10 bg-black/40 backdrop-blur-sm">
                                     <PlayButton 
                                        id={sample.id}
                                        url={sample.audio_url}
                                        name={sample.name}
                                        packName={sample.sample_packs?.name}
                                        coverUrl={sample.sample_packs?.cover_url}
                                        bpm={sample.bpm}
                                        audioKey={sample.key}
                                        isUnlocked={isUnlocked}
                                        creditCost={sample.credit_cost}
                                     />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-white font-black tracking-tight truncate uppercase text-xs md:text-base group-hover:text-studio-neon transition-colors leading-none italic">
                                        {sample.name}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-[8px] md:text-[10px] text-white/30 truncate font-mono uppercase tracking-widest">
                                        SRC: {sample.sample_packs?.name || 'STUDIO_ARCHIVE'}
                                    </p>
                                </div>
                            </div>

                            {/* Technical Meta */}
                            <div className="hidden sm:flex items-center justify-center gap-6 w-48 text-center border-x border-white/5">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[6px] font-black text-white/20 uppercase tracking-widest">BPM</span>
                                    <span className="text-[10px] font-black text-studio-neon italic">{sample.bpm || '--'}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[6px] font-black text-white/20 uppercase tracking-widest">KEY</span>
                                    <span className="text-[10px] font-black text-studio-neon italic">{sample.key || '--'}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[6px] font-black text-white/20 uppercase tracking-widest">COST</span>
                                    <span className="text-[10px] font-black text-white italic">{sample.credit_cost || 1} CR</span>
                                </div>
                            </div>

                            {/* Download Action */}
                            <div className="shrink-0 flex items-center gap-2 md:gap-4 w-auto md:w-32 justify-end">
                                <DownloadButton 
                                    sampleId={sample.id}
                                    isUnlockedInitial={isUnlocked}
                                    creditCost={sample.credit_cost || 1}
                                />
                            </div>
                            
                            {/* Aesthetic Footer Strip (DAW Style) */}
                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-studio-neon group-hover:w-full transition-all duration-700" />
                        </motion.div>
                    )
                })}
            </div>
            
            {/* 🧬 STATUS FOOTER */}
            <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8 max-w-5xl mx-auto">
                 <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-studio-neon animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-white/40">OUTPUT_OK</span>
                    </div>
                 </div>
                 <Activity className="w-4 h-4 text-white/10" />
            </div>
        </div>
    </SectionReveal>
  )
}
