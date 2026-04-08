'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, Play, Download, Lock, Check, ShoppingCart, Music2, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { useAudio } from '@/components/audio/AudioProvider'
import { useNotify } from '@/components/ui/NotificationProvider'
import { unlockSample } from '@/app/packs/[slug]/actions'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { Carousel } from '@/components/ui/Carousel'

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
  const [isUnlocking, setIsUnlocking] = useState<string | null>(null)
  
  // 🧬 SYNC WITH SERVER REVALIDATION
  useEffect(() => {
    setUnlockedIds(new Set(initialUnlockedIds))
  }, [initialUnlockedIds])
  
  const { activeId, isPlaying } = useAudio()
  const { showToast, showConfirm, showAuthGate } = useNotify()

  const filteredSounds = useMemo(() => {
    if (!query) return initialSamples
    return initialSamples.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.sample_packs?.name || '').toLowerCase().includes(query.toLowerCase())
    )
  }, [query, initialSamples])

    const [isMounted, setIsMounted] = useState(false)
    const heights = useMemo(() => {
        if (!isMounted) return new Array(64).fill(0)
        return [...Array(64)].map(() => Math.random() * 80 + 10)
    }, [isMounted])

    useEffect(() => { setIsMounted(true) }, [])

  return (
    <SectionReveal className="relative py-24 bg-transparent overflow-hidden block" style={{ position: 'relative' }}>
        {/* 🧬 BACKGROUND SIGNAL METER */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-end justify-around gap-1 px-4">
            {heights.map((h, i) => (
                    <div 
                        key={i} 
                        className="w-full bg-white animate-meter"
                        style={{ 
                            height: `${h}%`,
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: `${0.8 + (i % 10) * 0.15}s`
                        }}
                    />
            ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-24 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon bg-black/40 px-4 py-1 self-start border-l-4 border-studio-neon">
                        Signal_Peak :: Top Sounds
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-10 md:h-14 w-1 bg-studio-neon shadow-[0_0_15px_#a6e22e]" />
                        <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                            TOP<span className="text-studio-neon"> SOUNDS</span>
                        </h2>
                    </div>
                </div>
                <Link href="/browse?filter=trending" className="group flex items-center gap-4 px-8 py-4 md:px-10 md:py-5 bg-black border-2 border-white/5 hover:border-studio-neon transition-all relative overflow-hidden self-start">
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest relative z-10">Scan_Popular_Archive</span>
                    <Activity className="w-4 h-4 relative z-10 group-hover:scale-y-150 transition-transform" />
                    <div className="absolute inset-0 bg-studio-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            <div className="w-full">
                {filteredSounds.length > 0 ? (
                    <Carousel className="mt-8">
                        {filteredSounds.map((sound, index) => {
                          const isUnlocked = unlockedIds.has(sound.id)
                          const cost = sound.credit_cost || 1
                          
                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, delay: index * 0.05 }}
                              key={sound.id}
                              className="studio-panel bg-studio-grey border-2 border-white/10 group shadow-2xl relative h-full flex flex-col"
                            >
                                {/* VST Header Bar */}
                                <div className="bg-[#111] px-4 py-2 flex items-center justify-between border-b border-black">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 truncate pr-10">{sound.name}</span>
                                    <div className="flex gap-1.5 opacity-40">
                                        <div className="w-2 h-2 rounded-full bg-white/20" />
                                        <div className="w-2 h-2 rounded-full bg-white/20" />
                                        <div className="w-2 h-2 rounded-full bg-white/20" />
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-black/40 hover:bg-black transition-all flex-1 h-full">
                                    <div className="aspect-square relative overflow-hidden mb-6 border border-white/5 bg-black/20">
                                        {sound.sample_packs?.cover_url ? (
                                            <Image 
                                                src={sound.sample_packs?.cover_url} 
                                                alt={sound.name} 
                                                fill 
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 25vw"
                                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 opacity-60 group-hover:opacity-100" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Music2 className="h-16 w-16 text-white/5" />
                                            </div>
                                        )}
    
                                        {/* 🧬 Play Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
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
                                        
                                        {/* 🧬 SIGNAL ANALYZE FILTER (Hover) */}
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-studio-neon scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                                    </div>
                                    
                                    <div className="flex items-center justify-between border-t border-white/5 pt-4 gap-2">
                                        <div className="flex flex-col min-w-0 flex-1">
                                            {(sound.key || sound.bpm) ? (
                                                <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-studio-neon uppercase tracking-widest mb-1 italic truncate">
                                                    {sound.bpm && <span>{sound.bpm} BPM</span>}
                                                    {sound.bpm && sound.key && <div className="w-1 h-1 rounded-full bg-studio-neon/20" />}
                                                    {sound.key && <span>{sound.key}</span>}
                                                </div>
                                            ) : null}
                                            <span className="text-sm md:text-xl font-black text-white tracking-tighter truncate leading-[0.9] italic">
                                                {sound.name}
                                            </span>
                                        </div>
                                        <div className="scale-90 md:scale-95 origin-right shrink-0">
                                            <DownloadButton 
                                                sampleId={sound.id} 
                                                isUnlockedInitial={isUnlocked} 
                                                creditCost={cost}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                          )
                        })}
                    </Carousel>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center border-4 border-dashed border-white/5 text-white/10 uppercase font-black tracking-widest italic rounded-sm bg-black/20">
                        <SlidersHorizontal className="w-16 h-16 mb-4 opacity-10" />
                        No signals found...
                    </div>
                )}
            </div>
        </div>
    </SectionReveal>
  )
}
