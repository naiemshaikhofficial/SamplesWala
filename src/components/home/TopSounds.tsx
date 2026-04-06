'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, Play, Download, Heart, ArrowRight, BarChart3, Lock, Plus, Check, ShoppingCart, Music2, ShieldAlert, Zap } from 'lucide-react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { createClient } from '@/lib/supabase/client'
import { useAudio } from '@/components/audio/AudioProvider'
import { useNotify } from '@/components/ui/NotificationProvider'
import { unlockSample } from '@/app/packs/[slug]/actions'

export function TopSounds() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [sounds, setSounds] = useState<any[]>([])
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isUnlocking, setIsUnlocking] = useState<string | null>(null)
  
  const supabase = createClient()
  const { play, activeId, isPlaying } = useAudio()
  const { showToast, showConfirm, showAuthGate } = useNotify()

  useEffect(() => {
    async function init() {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      let { data: soundData, error: soundError } = await supabase
        .from('samples')
        .select(`
          *,
          sample_packs (
            id,
            name,
            slug,
            cover_url,
            is_featured,
            bundle_credit_cost
          )
        `)
        .order('created_at', { ascending: false })
        .limit(12)
      
      if (!soundError && soundData) {
        setSounds(soundData)
        
        if (authUser) {
            const { data: unlockData } = await supabase
                .from('unlocked_samples')
                .select('sample_id')
                .eq('user_id', authUser.id)
            
            if (unlockData) {
                setUnlockedIds(new Set(unlockData.map((d: any) => d.sample_id)))
            }
        }
      }
      setLoading(false)
    }
    init()
  }, [supabase])

  const filteredSounds = useMemo(() => {
    if (!query) return sounds
    return sounds.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.sample_packs?.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, sounds])

  const handleUnlock = async (sound: any) => {
    if (!user) {
        showAuthGate()
        return
    }

    const cost = sound.credit_cost || 1
    const confirmed = await showConfirm(`CONFIRM TRANSACTION: UNLOCK ${sound.name.toUpperCase()} FOR ${cost} SCR?`)
    if (!confirmed) return
    
    setIsUnlocking(sound.id)
    try {
        const res = await unlockSample(sound.id)

        if (res.success) {
            setUnlockedIds(prev => new Set([...prev, sound.id]))
            showToast(`ARTIFACT UNLOCKED. ${cost} SCR DEDUCTED.`, 'success')
            window.dispatchEvent(new Event('refresh-credits'))
        }
    } catch (e: any) {
        showToast(e.message || 'TRANSMISSION FAILED. INSUFFICIENT CREDITS?', 'error')
    } finally {
        setIsUnlocking(null)
    }
  }

  const handlePlay = (sound: any) => {
    const isUnlocked = unlockedIds.has(sound.id)
    play(sound.id, sound.audio_url, {
        name: sound.name,
        packName: sound.sample_packs?.name,
        coverUrl: sound.sample_packs?.cover_url,
        bpm: sound.bpm,
        audioKey: sound.key,
        isUnlocked
    })
  }

  return (
    <SectionReveal className="relative py-24 md:py-48 bg-black overflow-hidden">
        {/* 🧬 BACKGROUND SIGNAL METER */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-end justify-around gap-1 px-4">
            {[...Array(64)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-full bg-white animate-meter"
                        style={{ 
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: `${0.8 + (i % 10) * 0.15}s`
                        }}
                    />
            ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-32 gap-8 relative z-10 px-4 md:px-20 container mx-auto">
            <div className="max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 md:mb-8 block italic">ध्वनि ग्रिड</span>
                <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-4 italic">TOP<br />SOUNDS</h2>
            </div>
            <Link href="/browse?mode=samples" className="text-[10px] md:text-xs font-black uppercase tracking-widest border-b-2 border-white pb-2 md:pb-4 hover:opacity-50 transition-all self-start md:self-auto uppercase">
                View All Samples
            </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-white/5 relative z-10 border border-white/5">
          <AnimatePresence mode="popLayout">
            {loading ? (
                [...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white/[0.02] animate-pulse flex items-center justify-center border border-white/[0.05]">
                        <Activity className="text-white/5 h-8 w-8 animate-bounce" />
                    </div>
                ))
            ) : (
                filteredSounds.map((sound, index) => {
                  const isUnlocked = unlockedIds.has(sound.id)
                  const isCurrent = activeId === sound.id
                  const cost = sound.credit_cost || 1
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -30 }}
                      transition={{ 
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      key={sound.id}
                      className="group relative bg-[#050505] aspect-square overflow-hidden cursor-crosshair border border-white/[0.03] hover:border-white/20 transition-colors duration-500"
                    >
                      <Image 
                        src={sound.sample_packs?.cover_url || 'https://images.unsplash.com/photo-1514525253361-bee87380cf40?q=80&w=300&h=300&auto=format&fit=crop'}
                        alt={sound.name}
                        fill
                        className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 z-10" />
                      
                      <div className="absolute top-6 left-6 right-6 z-20 flex items-start justify-between">
                          <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-white text-black text-[8px] font-black uppercase tracking-widest self-start">
                                      {sound.key || 'C#'}
                                  </span>
                                  <span className="px-2 py-1 bg-white/10 text-white text-[8px] font-black uppercase tracking-widest self-start backdrop-blur-sm">
                                      {sound.bpm || '120'} BPM
                                  </span>
                              </div>
                              {sound.sample_packs?.is_featured && (
                                  <span className="text-[7px] text-emerald-400 uppercase font-black tracking-widest animate-pulse">FEATURED DROP</span>
                              )}
                          </div>
                          
                          <Link 
                            href={`/packs/${sound.sample_packs?.slug}`}
                            className="bg-black/80 p-2 border border-white/10 hover:bg-white hover:text-black transition-all group/packlink"
                            title="Open Full Pack"
                          >
                             <ShoppingCart size={14} className="group-hover/packlink:scale-110" />
                          </Link>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-30 scale-90 group-hover:scale-100 pointer-events-none">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handlePlay(sound); }}
                            className={`h-16 w-16 rounded-full flex items-center justify-center transition-all shadow-[0_0_50px_rgba(255,255,255,0.4)] ${isCurrent && isPlaying ? 'bg-emerald-500' : 'bg-white text-black'} pointer-events-auto`}
                          >
                              {isCurrent && isPlaying ? (
                                  <div className="flex gap-1 items-end h-4">
                                      <div className="w-1 bg-black animate-meter [animation-duration:0.4s]" />
                                      <div className="w-1 bg-black animate-meter [animation-duration:0.6s]" />
                                      <div className="w-1 bg-black animate-meter [animation-duration:0.3s]" />
                                  </div>
                              ) : (
                                  <Play size={32} fill="currentColor" className="ml-1" />
                              )}
                          </button>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-6 z-50 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="text-xl font-black uppercase tracking-tighter leading-tight mb-1 group-hover:text-emerald-400 transition-colors">
                              {sound.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-black tracking-widest leading-none">
                            <span className="truncate">{sound.sample_packs?.name}</span>
                            <span className="text-white/10">•</span>
                            <span className="text-white/40 italic font-black">
                                {sound.bpm && sound.key ? 'MELODY' : (sound.bpm ? 'LOOP' : 'ONE-SHOT')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-6 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 relative z-40">
                              {isUnlocked ? (
                                <button className="flex h-10 items-center gap-2 bg-emerald-500 text-black px-6 hover:bg-white transition-all group/btn pointer-events-auto">
                                    <Check size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic">In Library</span>
                                </button>
                              ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleUnlock(sound); }}
                                    disabled={isUnlocking === sound.id}
                                    className="flex h-10 items-center justify-center bg-white text-black px-6 hover:bg-emerald-500 hover:text-white transition-all group/unlock min-w-[140px] pointer-events-auto relative z-50"
                                >
                                    {isUnlocking === sound.id ? (
                                        <Activity className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Lock size={12} className="group-hover/unlock:scale-120 transition-transform" />
                                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Unlock ({cost} SCR)</span>
                                        </div>
                                    )}
                                </button>
                              )}
                              
                              <button className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white hover:text-black transition-all ml-auto group/heart">
                                  <Heart size={14} className="group-hover/heart:scale-125 transition-transform" />
                              </button>
                          </div>

                          <div className={`absolute bottom-6 left-6 flex items-end gap-[1px] h-6 transition-all duration-500 delay-100 ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              {[...Array(8)].map((_, i) => (
                                  <div 
                                      key={i} 
                                      className="w-[2px] bg-white animate-meter"
                                      style={{ 
                                          opacity: 0.1 + (i * 0.1),
                                          animationDelay: `${i * 0.05}s`,
                                          animationDuration: isCurrent && isPlaying ? '0.3s' : '1.2s'
                                      }}
                                  />
                              ))}
                          </div>
                      </div>
                    </motion.div>
                  )
                })
            )}
          </AnimatePresence>
        </div>

        <div className="mt-16 md:mt-24 p-6 md:p-12 bg-[#050505]/80 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 px-4 md:px-20 container mx-auto">
            <div className="flex items-center gap-4 md:gap-8">
                <div className="h-16 w-16 border border-white/10 flex items-center justify-center bg-white/5">
                    <Music2 className="h-8 w-8 text-emerald-400 animate-pulse" />
                </div>
                <div>
                    <h4 className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-none mb-2 italic underline decoration-white/10 decoration-4">Studio Signal Sync</h4>
                    <p className="text-white/30 text-[10px] md:text-xs font-black uppercase tracking-widest text-left mt-4 opacity-50">Transmitting premium artifacts from global production hubs every 24 hours.</p>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <Link href="/browse?mode=packs" className="text-center px-10 py-5 bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black border border-white/10 transition-all">
                    View Packs
                </Link>
                <Link href="/browse?mode=samples" className="text-center px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-transparent hover:text-white border border-white transition-all whitespace-nowrap">
                    View All
                </Link>
            </div>
        </div>
    </SectionReveal>
  )
}
