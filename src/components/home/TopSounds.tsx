'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, SlidersHorizontal, Sparkles } from 'lucide-react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'

export function TopSounds({ 
  samples: initialSamples = [], 
  unlockedSampleIds: initialUnlockedIds = [] 
}: { 
  samples?: any[], 
  unlockedSampleIds?: string[] 
}) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set(initialUnlockedIds))
  
  useEffect(() => {
    setUnlockedIds(new Set(initialUnlockedIds))
  }, [initialUnlockedIds])
  
  const filteredSounds = useMemo(() => {
    if (!query) return initialSamples
    return initialSamples.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.sample_packs?.name || '').toLowerCase().includes(query.toLowerCase())
    )
  }, [query, initialSamples])

  return (
    <SectionReveal className="relative py-16 md:py-24 bg-transparent overflow-hidden block" style={{ position: 'relative' }}>
        {/* 🧬 BACKGROUND SIGNAL METER */}
        <div className="absolute inset-x-0 bottom-0 top-0 opacity-[0.05] pointer-events-none flex items-end justify-around gap-1 px-4 z-0">
            {[...Array(20)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-full bg-studio-yellow animate-meter origin-bottom"
                    style={{ 
                        height: `${20 + Math.random() * 80}%`,
                        animationDelay: `${i * 0.1}s`
                    }}
                />
            ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-yellow bg-black/40 px-4 py-1 self-start border-l-4 border-studio-yellow">
                        Master_Chart :: Top Sounds
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-10 md:h-14 w-1 bg-studio-yellow shadow-[0_0_15px_#FFC800]" />
                        <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                            TOP<span className="text-studio-yellow"> SOUNDS</span>
                        </h2>
                    </div>
                </div>
                <Link href="/browse?filter=trending" className="group flex items-center gap-4 px-8 py-4 bg-black border border-white/10 hover:border-studio-yellow transition-all relative overflow-hidden self-start">
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest relative z-10">Scan_Library_Full</span>
                    <Activity className="w-4 h-4 relative z-10 group-hover:scale-y-150 transition-transform" />
                </Link>
            </div>

            <div className="flex flex-col gap-2 md:gap-3 w-full max-w-5xl mx-auto">
                <div className="hidden md:flex items-center px-8 py-2 text-[8px] font-black uppercase text-white/20 tracking-[0.3em] border-b border-white/5 mb-2">
                    <div className="w-16">Preview</div>
                    <div className="flex-1">Peak_Metadata</div>
                    <div className="w-48 text-center">Spectral_Data</div>
                    <div className="w-32 text-right">Download</div>
                </div>

                {filteredSounds.length > 0 ? (
                    filteredSounds.slice(0, 15).map((sound, index) => {
                        const isUnlocked = unlockedIds.has(sound.id)
                        const cost = sound.credit_cost || 1
                        
                        return (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.03 }}
                                key={sound.id}
                                className="group relative bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/5 hover:border-studio-yellow/40 transition-all flex items-center px-3 py-3 md:px-8 md:py-5 gap-4 md:gap-8 overflow-hidden"
                            >
                                {/* Play Action (Slide-up restored) */}
                                <div className="relative shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-black border border-white/10 group-hover:border-studio-yellow/50 overflow-hidden transition-colors">
                                    <Image 
                                        src={sound.sample_packs?.cover_url || '/placeholder.png'} 
                                        alt={sound.name} 
                                        fill 
                                        className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center translate-y-12 group-hover:translate-y-0 transition-transform duration-300 z-10 bg-black/40 backdrop-blur-sm">
                                        <PlayButton 
                                            id={sound.id} 
                                            url={sound.audio_url} 
                                            name={sound.name}
                                            packName={sound.sample_packs?.name}
                                            coverUrl={sound.sample_packs?.cover_url}
                                            bpm={sound.bpm}
                                            audioKey={sound.key}
                                            isUnlocked={isUnlocked}
                                            creditCost={cost}
                                            lightMode={false}
                                        />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-black tracking-tight truncate uppercase text-xs md:text-base group-hover:text-studio-yellow transition-colors leading-none italic mb-1">
                                        {sound.name}
                                    </h3>
                                    <p className="text-[8px] md:text-[10px] text-white/30 truncate font-mono uppercase tracking-widest">
                                        PACK: {sound.sample_packs?.name || 'TRENDING_SIGNAL'}
                                    </p>
                                </div>

                                {/* Metrics */}
                                <div className="hidden sm:flex items-center justify-center gap-6 w-48 text-center border-x border-white/5">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[6px] font-black text-white/20 uppercase tracking-widest">BPM</span>
                                        <span className="text-[10px] font-black text-studio-yellow italic">{sound.bpm || '--'}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[6px] font-black text-white/20 uppercase tracking-widest">KEY</span>
                                        <span className="text-[10px] font-black text-studio-yellow italic">{sound.key || '--'}</span>
                                    </div>
                                </div>

                                {/* Download */}
                                <div className="shrink-0 flex items-center gap-4 w-auto md:w-32 justify-end">
                                    <DownloadButton 
                                        sampleId={sound.id} 
                                        isUnlockedInitial={isUnlocked} 
                                        creditCost={cost}
                                    />
                                </div>

                                <div className="absolute bottom-0 right-0 h-[2px] w-0 bg-studio-yellow group-hover:w-full transition-all duration-700" />
                            </motion.div>
                        )
                    })
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center border-4 border-dashed border-white/5 text-white/10 uppercase font-black tracking-widest italic rounded-sm bg-black/20">
                        <Activity className="w-16 h-16 mb-4 opacity-10" />
                        Awaiting Chart Signal...
                    </div>
                )}
            </div>
        </div>
    </SectionReveal>
  )
}
