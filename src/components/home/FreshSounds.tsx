'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, Sparkles } from 'lucide-react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { useAudio } from '@/components/audio/AudioProvider'

interface FreshSoundsProps {
  samples: any[]
  unlockedSampleIds: string[]
}

export function FreshSounds({ samples = [], unlockedSampleIds = [] }: FreshSoundsProps) {
  const [activeMobileId, setActiveMobileId] = useState<string | null>(null)
  const { play, activeId, isPlaying } = useAudio()

  // 🧬 SIGNAL SYNC :: Reset mobile slide-up state when audio ends globally
  useEffect(() => {
    if (!isPlaying && !activeId) {
        setActiveMobileId(null)
    }
  }, [isPlaying, activeId])

  const handleCardClick = (sample: any) => {
    const isUnlocked = unlockedSampleIds.includes(sample.id)
    const metadata = {
        id: sample.id,
        url: sample.audio_url,
        name: sample.name,
        packName: sample.sample_packs?.name,
        coverUrl: sample.sample_packs?.cover_url,
        bpm: sample.bpm,
        audioKey: sample.key,
        isUnlocked: isUnlocked,
        creditCost: sample.credit_cost
    }

    // Toggle slide-up
    setActiveMobileId(activeMobileId === sample.id ? null : sample.id)
    
    // Play signal
    play(sample.id, sample.audio_url, metadata)
  }

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

                <div className="flex items-center gap-8 bg-black/60 p-4 md:p-6 border border-white/5 backdrop-blur-md">
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

            {/* 🎚️ SOUND LIST TERMINAL */}
            <div className="flex flex-col gap-2 md:gap-3 w-full max-w-5xl mx-auto">
                {samples.slice(0, 10).map((sample, index) => {
                    const isUnlocked = unlockedSampleIds.includes(sample.id)
                    const isPlayingThis = activeId === sample.id && isPlaying
                    // Master slide-up logic: triggers if specifically playing OR if touched on mobile
                    const shouldSlideUp = isPlayingThis || (activeMobileId === sample.id && activeId === sample.id)

                    return (
                        <motion.div 
                            key={sample.id}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleCardClick(sample)}
                            className={`group relative bg-[#0a0a0a] border transition-all flex items-center px-3 py-3 md:px-8 md:py-5 gap-4 md:gap-8 overflow-hidden touch-manipulation cursor-pointer ${shouldSlideUp ? 'border-studio-neon/60 bg-[#111]' : 'border-white/5 hover:border-studio-neon/40'}`}
                        >
                            <div className={`absolute top-0 right-0 w-8 h-8 flex items-center justify-center transition-opacity z-20 ${shouldSlideUp ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}>
                                <Sparkles className="w-3 h-3 text-studio-neon animate-pulse" />
                            </div>

                            {/* Play Action - Auto-reset Slide-up */}
                            <div className={`relative shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-black border overflow-hidden transition-all ${shouldSlideUp ? 'border-studio-neon/50' : 'border-white/10 md:group-hover:border-studio-neon/50'}`}>
                                <Image
                                    src={sample.sample_packs?.cover_url || '/placeholder.png'}
                                    alt={sample.name}
                                    fill
                                    className={`object-cover transition-all duration-500 ${shouldSlideUp ? 'opacity-100 grayscale-0 scale-110' : 'opacity-50 grayscale md:group-hover:grayscale-0 md:group-hover:scale-110'}`}
                                />
                                
                                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-transform duration-500 z-10 ${shouldSlideUp ? 'translate-y-0' : 'translate-y-full md:group-hover:translate-y-0'}`}>
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
                                <h3 className={`font-black tracking-tight truncate uppercase text-xs md:text-base transition-colors leading-none italic ${shouldSlideUp ? 'text-studio-neon' : 'text-white md:group-hover:text-studio-neon'}`}>
                                    {sample.name}
                                </h3>
                                <p className="text-[8px] md:text-[10px] text-white/30 truncate font-mono uppercase tracking-widest mt-1">
                                    SRC: {sample.sample_packs?.name || 'STUDIO_ARCHIVE'}
                                </p>
                            </div>

                            <div className="hidden sm:flex items-center justify-center gap-6 w-48 text-center border-x border-white/5">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[6px] font-black text-white/20 uppercase tracking-widest">BPM</span>
                                    <span className="text-[10px] font-black text-studio-neon italic">{sample.bpm || '--'}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[6px] font-black text-white/20 uppercase tracking-widest">KEY</span>
                                    <span className="text-[10px] font-black text-studio-neon italic">{sample.key || '--'}</span>
                                </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-4 justify-end">
                                <DownloadButton 
                                    sampleId={sample.id}
                                    isUnlockedInitial={isUnlocked}
                                    creditCost={sample.credit_cost || 1}
                                />
                            </div>
                            
                            <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-700 ${shouldSlideUp ? 'w-full bg-studio-neon' : 'w-0 bg-studio-neon md:group-hover:w-full'}`} />
                        </motion.div>
                    )
                })}
            </div>
        </div>
    </SectionReveal>
  )
}
