'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, Play, Download, Lock, Check, ShoppingCart, Music2, Search, SlidersHorizontal } from 'lucide-react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { useAudio } from '@/components/audio/AudioProvider'
import { useNotify } from '@/components/ui/NotificationProvider'
import { unlockSample } from '@/app/packs/[slug]/actions'
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
    <SectionReveal className="relative py-24 bg-transparent overflow-hidden">
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

        <div className="relative z-10 container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-24 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon bg-black/40 px-4 py-1 self-start border-l-4 border-studio-neon">
                        Best Sellers :: Premium Sounds
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-10 md:h-14 w-1 bg-studio-neon shadow-[0_0_15px_#a6e22e]" />
                        <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                            TOP<span className="text-studio-neon"> SOUNDS</span>
                        </h2>
                    </div>
                </div>
                <Link href="/browse?mode=samples" className="group flex items-center gap-4 px-8 py-4 md:px-10 md:py-5 bg-black border-2 border-white/5 hover:border-studio-neon transition-all relative overflow-hidden self-start">
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest relative z-10">Browse All Sounds</span>
                    <Activity className="w-4 h-4 relative z-10 group-hover:scale-y-150 transition-transform" />
                    <div className="absolute inset-0 bg-studio-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredSounds.length > 0 ? (
                    filteredSounds.map((sound, index) => {
                      const isUnlocked = unlockedIds.has(sound.id)
                      const isCurrent = activeId === sound.id
                      const cost = sound.credit_cost || 1
                      
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          key={sound.id}
                          className="studio-panel bg-studio-grey border-2 border-white/10 group shadow-2xl relative"
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
                            
                            <div className="p-4 bg-black/40 hover:bg-black transition-all">
                                <div className="aspect-square relative overflow-hidden mb-6 border border-white/5 bg-black/20">
                                    {sound.sample_packs?.cover_url ? (
                                        <Image 
                                            src={sound.sample_packs?.cover_url} 
                                            alt={sound.name} 
                                            fill 
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
                                            <span className="text-[8px] md:text-[10px] font-black text-studio-neon uppercase tracking-widest mb-0.5 truncate">
                                                {sound.key} {sound.bpm && `${sound.bpm} BPM`}
                                            </span>
                                        ) : null}
                                        <span className="text-sm md:text-lg font-black text-white tracking-tighter truncate leading-tight">
                                            {sound.name}
                                        </span>
                                    </div>
                                    <div className="scale-90 md:scale-75 origin-right shrink-0">
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
                    })
                ) : (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center border-4 border-dashed border-white/5 text-white/10 uppercase font-black tracking-widest italic">
                        <SlidersHorizontal className="w-16 h-16 mb-4 opacity-10" />
                        No sounds found...
                    </div>
                )}
              </AnimatePresence>
            </div>
        </div>
    </SectionReveal>
  )
}
