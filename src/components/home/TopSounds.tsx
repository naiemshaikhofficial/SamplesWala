'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, Sparkles } from 'lucide-react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { useAudio } from '@/components/audio/AudioProvider'
import { useVault } from '@/components/VaultProvider'

export function TopSounds({ 
  samples: initialSamples = []
}: { 
  samples?: any[]
}) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const { unlockedIds, isLoading } = useVault()
  const [activeMobileId, setActiveMobileId] = useState<string | null>(null)
  const { play, activeId, isPlaying } = useAudio()
  

  // 🧬 SIGNAL SYNC :: Reset mobile slide-up state when audio ends globally
  useEffect(() => {
    if (!isPlaying && !activeId) {
        setActiveMobileId(null)
    }
  }, [isPlaying, activeId])
  
  const filteredSounds = useMemo(() => {
    if (!query) return initialSamples
    return initialSamples.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.sample_packs?.name || '').toLowerCase().includes(query.toLowerCase())
    )
  }, [query, initialSamples])

  const handleCardClick = (sample: any) => {
    const cost = sample.credit_cost || 1
    const metadata = {
        id: sample.id,
        url: sample.audio_url,
        name: sample.name,
        packName: sample.sample_packs?.name,
        coverUrl: sample.sample_packs?.cover_url,
        bpm: sample.bpm,
        audioKey: sample.key,
        isUnlocked: unlockedIds.has(sample.id),
        creditCost: cost
    }

    setActiveMobileId(activeMobileId === sample.id ? null : sample.id)
    play(sample.id, sample.audio_url, metadata)
  }

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
                        TOP TRENDING SOUNDS
                </div>
            </div>

            <div className="flex flex-col gap-2 md:gap-3 w-full max-w-5xl mx-auto">
                {filteredSounds.slice(0, 20).map((sound, index) => {
                    const isUnlocked = unlockedIds.has(sound.id)
                    const cost = sound.credit_cost || 1
                    const isPlayingThis = activeId === sound.id && isPlaying
                    const shouldSlideUp = isPlayingThis || (activeMobileId === sound.id && activeId === sound.id)
                    
                    return (
                        <motion.div
                            key={sound.id}
                            initial={{ opacity: 0, x: 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.03 }}
                            onClick={() => handleCardClick(sound)}
                            className={`group relative border transition-all flex items-center px-3 py-3 md:px-8 md:py-5 gap-4 md:gap-8 overflow-hidden touch-manipulation cursor-pointer ${shouldSlideUp ? 'border-studio-yellow/60 bg-[#111]' : 'bg-[#0a0a0a]/80 backdrop-blur-sm border-white/5 hover:border-studio-yellow/40'}`}
                        >
                            {/* Play Action */}
                            <div className={`relative shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-black border overflow-hidden transition-all ${shouldSlideUp ? 'border-studio-yellow/50' : 'border-white/10 md:group-hover:border-studio-yellow/50'}`}>
                                <Image 
                                    src={sound.sample_packs?.cover_url || '/placeholder.png'} 
                                    alt={`${sound.name} - ${sound.sample_packs?.name || 'Trending'} Sample | SamplesWala`} 
                                    fill 
                                    sizes="64px"
                                    className={`object-cover transition-all duration-500 ${shouldSlideUp ? 'opacity-100 grayscale-0 scale-110' : 'opacity-50 grayscale md:group-hover:grayscale-0 md:group-hover:scale-110'}`} 
                                />
                                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-transform duration-500 z-10 ${shouldSlideUp ? 'translate-y-0' : 'translate-y-full md:group-hover:translate-y-0'}`}>
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
                                <h3 className={`font-black tracking-tight truncate uppercase text-xs md:text-base transition-colors leading-none italic mb-1 ${shouldSlideUp ? 'text-studio-yellow' : 'text-white md:group-hover:text-studio-yellow'}`}>
                                    {sound.name}
                                </h3>
                                    PACK: {sound.sample_packs?.name || 'TRENDING'}
                            </div>

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

                            <div className="shrink-0 flex items-center gap-4 justify-end">
                                <DownloadButton 
                                    sampleId={sound.id} 
                                    creditCost={cost}
                                />
                            </div>

                            <div className={`absolute bottom-0 right-0 h-[2px] transition-all duration-700 ${shouldSlideUp ? 'w-full bg-studio-yellow' : 'w-0 bg-studio-yellow md:group-hover:w-full'}`} />
                        </motion.div>
                    )
                })}
            </div>
        </div>
    </SectionReveal>
  )
}
