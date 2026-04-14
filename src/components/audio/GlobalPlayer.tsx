'use client'
import React, { useEffect, useState } from 'react'
import { useAudio } from './AudioProvider'
import Image from 'next/image'
import { Play, Pause, X, Music, Activity, Repeat, Volume2, VolumeX, Volume1, ChevronUp, Loader2, SkipBack, SkipForward, Download, Sparkles, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DAWVisualizer } from '@/components/ui/DAWVisualizer'
import { DownloadButton } from './DownloadButton'

import { useSidebar } from '../layout/SidebarContext'

export function GlobalPlayer() {
  const { activeId, activeMetadata, isPlaying, play, pause, currentTime, duration, seek, isLoading, spectrum, isLooping, toggleLoop, volume, setVolume, stop, next, prev, playlist, vibeSuggestions } = useAudio()
  const { isOpen } = useSidebar()
  const [showVibes, setShowVibes] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // 🧬 SYNC VISIBILITY WITH SIGNAL
  useEffect(() => {
    if (activeId) {
        setIsVisible(true)
    } else {
        const timer = setTimeout(() => setIsVisible(false), 500)
        return () => clearTimeout(timer)
    }
  }, [activeId])

  if (!isVisible) return null

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {activeId && (
        <motion.div 
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className={`fixed bottom-[96px] md:bottom-0 left-0 right-0 z-[500] bg-black/95 border-t-2 border-white/5 font-mono select-none overflow-hidden backdrop-blur-3xl ${isOpen ? 'lg:pl-80' : 'lg:pl-20'}`}
        >
          {/* ⚡ DOS SCANLINE OVERLAY */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-10 scanline-bg" />
          
          {/* Header Strip - HIDDEN ON MOBILE TO SAVE HEIGHT */}
          <div className="hidden md:flex bg-white/5 border-b border-white/5 px-4 md:px-6 py-2 justify-between items-center text-[8px] md:text-[9px] font-black tracking-widest uppercase relative z-20">
             <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <span className="hidden xs:inline shrink-0 text-white/20">Ready</span>
                {isLoading ? (
                    <span className="text-studio-neon animate-pulse">Loading Audio...</span>
                ) : activeMetadata?.isUnlocked ? (
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-studio-neon animate-pulse shadow-[0_0_8px_#a6e22e]" />
                        <span className="text-studio-neon font-black">Full Quality (WAV)</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 overflow-hidden bg-studio-yellow/10 px-3 py-1 rounded-sm border border-studio-yellow/20">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-studio-yellow animate-pulse" />
                            <span className="text-studio-yellow font-black">PREVIEW ONLY</span>
                        </div>
                        <span className="text-white/60 italic lowercase">preview only :: unlock for full quality</span>
                    </div>
                )}
             </div>
             <div className="flex items-center gap-4 shrink-0 text-white/20 font-black">
                <span className="text-studio-neon">Volume: {(volume * 100).toFixed(0)}%</span>
             </div>
          </div>

          <div className="flex items-center h-16 md:h-20 px-4 md:px-10 w-full relative z-20">
            
            {/* 🎙️ COMPACT AUDIO CONTROL CLUSTER (Grid For Precision Middle) */}
            <div className="grid grid-cols-12 items-center w-full">
                
                {/* 💿 ALBUM & METADATA SECTION */}
                <div className="col-span-4 md:col-span-3 flex items-center gap-2 md:gap-4 min-w-0">
                    <div className="h-10 w-10 bg-black border border-white/10 relative group overflow-hidden shrink-0 hidden sm:block">
                        {activeMetadata?.coverUrl ? (
                            <Image src={activeMetadata.coverUrl} alt={activeMetadata.name} fill sizes="40px" className="object-cover opacity-60" />
                        ) : (
                            <Music className="h-4 w-4 text-white/20 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 whitespace-nowrap min-w-0">
                            <span className="text-[7px] font-black text-studio-neon tracking-widest truncate uppercase italic">
                                {activeMetadata?.packName || "Sample Pack"}
                            </span>
                        </div>
                        <h4 className="text-[11px] md:text-lg font-black tracking-tight truncate leading-none text-white uppercase max-w-[80px] xs:max-w-[120px] md:max-w-none">
                            {activeMetadata?.name || "SOUND"}
                        </h4>
                    </div>
                </div>

                {/* 🕹️ CENTERED TRANSPORT (Surgical Center) */}
                <div className="col-span-4 md:col-span-6 flex items-center justify-center min-w-0">
                    {/* PC TRANSPORT */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-sm">
                            <button onClick={prev} className="h-10 w-10 flex items-center justify-center hover:bg-white/10 text-white/30 disabled:opacity-20"><SkipBack size={16} fill="currentColor" /></button>
                            <button 
                                onClick={() => isPlaying ? pause() : play(activeId!, '')} 
                                className="h-11 w-16 bg-white text-black hover:bg-studio-neon flex items-center justify-center transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_#a6e22e]"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                            </button>
                            <button onClick={next} className="h-10 w-10 flex items-center justify-center hover:bg-white/10 text-white/30 disabled:opacity-20"><SkipForward size={16} fill="currentColor" /></button>
                        </div>

                        {/* DESKTOP INFO ONLY */}
                        <div className="hidden xl:flex items-center gap-1">
                            {activeMetadata?.bpm && (
                                <div className="flex flex-col items-center justify-center h-10 w-16 bg-black/60 border border-white/5 rounded-sm">
                                    <span className="text-[10px] font-black italic text-studio-neon">{activeMetadata.bpm}</span>
                                    <span className="text-[6px] font-black text-white/20 mt-0.5 uppercase">BPM</span>
                                </div>
                            )}
                            {activeMetadata?.audioKey && (
                                <div className="flex flex-col items-center justify-center h-10 w-16 bg-black/60 border border-white/5 rounded-sm">
                                    <span className="text-[10px] font-black italic text-white">{activeMetadata.audioKey}</span>
                                    <span className="text-[6px] font-black text-white/20 mt-0.5 uppercase">KEY</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MOBILE TRANSPORT CORE (Truly Centered) */}
                    <div className="flex md:hidden flex-col items-center gap-1">
                         <button 
                            onClick={() => isPlaying ? pause() : play(activeId!, '')}
                            className="h-11 w-11 bg-white text-black flex items-center justify-center rounded-full shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                        </button>
                        {(activeMetadata?.bpm || activeMetadata?.audioKey) && (
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap">
                                {activeMetadata?.bpm && `${activeMetadata.bpm}BPM`} {activeMetadata?.audioKey && `// ${activeMetadata.audioKey}`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Volume & Download */}
                <div className="col-span-4 md:col-span-3 flex items-center gap-3 md:gap-10 justify-end min-w-0">
                    
                    {/* Volume Control */}
                    <div className="hidden xl:flex items-center gap-4 group/vol px-4 border-l border-white/5">
                        <div className="flex items-center gap-2 text-white/20 group-hover/vol:text-studio-neon transition-colors">
                            {volume === 0 ? <VolumeX size={14} /> : volume < 0.5 ? <Volume1 size={14} /> : <Volume2 size={14} />}
                            <span className="text-[10px] font-black w-8">{(volume * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.01" value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-24 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-studio-neon hover:bg-white/20 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 border-l border-white/5 pl-6">
                        <button 
                            onClick={() => setShowVibes(!showVibes)}
                            className={`p-3 rounded-sm transition-all ${showVibes ? 'bg-studio-neon text-black shadow-[0_0_15px_rgba(166,226,46,0.3)]' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                            title="Find Similar Sounds"
                        >
                            <Sparkles size={18} />
                        </button>

                        {activeId && (
                            <div className="scale-110 md:scale-100">
                                <DownloadButton 
                                    sampleId={activeId} 
                                    creditCost={activeMetadata?.creditCost || 1} 
                                />
                            </div>
                        )}
                    </div>

                    <button onClick={() => stop()} className="h-10 w-10 flex items-center justify-center group-hover:rotate-90 transition-transform">
                        <X size={20} className="text-white/20 hover:text-studio-yellow transition-colors" />
                    </button>
                </div>
            </div>

            {/* 📊 GLOBAL PROGRESS BAR (Absolute Bottom - Ultra Thin) */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 z-30 group/seek">
                <input
                    type="range" min="0" max={duration || 100} step="0.1" value={currentTime}
                    onChange={(e) => seek(parseFloat(e.target.value))}
                    className="w-full h-full opacity-0 absolute inset-0 z-40 cursor-pointer"
                />
                <div className="absolute top-0 left-0 h-full bg-studio-neon transition-all duration-100 shadow-[0_0_10px_#a6e22e]" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
            </div>
          </div>

          <AnimatePresence>
            {showVibes && vibeSuggestions && vibeSuggestions.length > 0 && (
                <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="bg-black border-b border-white/5 overflow-hidden"
                >
                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <Sparkles className="w-4 h-4 text-studio-neon animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">SIMILAR SOUNDS</span>
                            </div>
                            <button onClick={() => setShowVibes(false)} className="text-white/20 hover:text-white"><X size={16} /></button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {vibeSuggestions.map((s, i) => (
                                <motion.div 
                                    key={s.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => play(s.id, s.url, { 
                                        id: s.id, 
                                        name: s.name, 
                                        packName: s.sample_packs?.name, 
                                        coverUrl: s.sample_packs?.cover_url, 
                                        bpm: s.bpm, 
                                        audioKey: s.key,
                                        isUnlocked: false // Reset for new sound
                                    })}
                                    className="group relative bg-white/5 p-4 border border-white/5 hover:border-studio-neon transition-all cursor-pointer overflow-hidden"
                                >
                                     <div className="flex flex-col gap-3">
                                         <div className="relative aspect-square overflow-hidden bg-black/40">
                                            <Image 
                                                src={s.sample_packs?.cover_url || '/placeholder.png'} 
                                                alt={s.name} 
                                                fill 
                                                className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Play size={20} fill="#a6e22e" className="text-studio-neon" />
                                            </div>
                                         </div>
                                         <div className="min-w-0">
                                            <h4 className="text-[10px] font-black text-white truncate uppercase mb-1">{s.name}</h4>
                                             <div className="flex items-center gap-2 text-[8px] font-black text-white/30 uppercase tracking-widest italic">
                                                {s.bpm && <span>{s.bpm} BPM</span>}
                                                {s.bpm && s.key && <div className="w-1 h-1 rounded-full bg-white/10" />}
                                                {s.key && <span>{s.key}</span>}
                                                {!s.bpm && !s.key && <span>-</span>}
                                             </div>
                                         </div>
                                     </div>
                                     <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Plus size={12} className="text-studio-neon" />
                                     </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
