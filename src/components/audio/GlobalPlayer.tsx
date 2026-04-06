'use client'
import React, { useEffect, useState } from 'react'
import { useAudio } from './AudioProvider'
import Image from 'next/image'
import { Play, Pause, X, Music, Activity, Repeat, Volume2, VolumeX, Volume1, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DAWVisualizer } from '@/components/ui/DAWVisualizer'

import { useSidebar } from '../layout/SidebarContext'

export function GlobalPlayer() {
  const { activeId, activeMetadata, isPlaying, play, pause, currentTime, duration, seek, isLoading, spectrum, isLooping, toggleLoop, volume, setVolume } = useAudio()
  const { isOpen } = useSidebar()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (activeId) setIsVisible(true)
  }, [activeId])

  if (!isVisible || !activeId) return null

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`fixed bottom-[74px] lg:bottom-0 left-0 right-0 z-[100] bg-black border-t-2 border-white/20 lg:border-white transition-all duration-300 animate-in slide-in-from-bottom duration-500 backdrop-blur-xl ${isOpen ? 'lg:pl-80' : 'lg:pl-20'}`}>
      
      {/* 🔮 ANTI-PIRACY SECURITY BANNER (Hidden on mobile for space) */}
      {!activeMetadata?.isUnlocked && (
          <div className="hidden md:flex bg-white text-black h-8 items-center justify-between px-6 md:px-20 overflow-hidden relative group/banner">
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                       <Activity size={10} className="animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">[ PREVIEW_MODE_ACTIVE ]</span>
                  </div>
                  <span className="hidden md:inline text-[8px] font-bold uppercase tracking-widest text-black/60">
                      LOW QUALITY AUDIO WITH WATERMARK. UNLOCK TO DOWNLOAD FULL HIGH-QUALITY WAV.
                  </span>
              </div>
          </div>
      )}

      {/* 🎰 THE RACK HEADER */}
      <div className="flex flex-col lg:flex-row h-auto lg:h-24 items-center px-4 md:px-20 py-3 lg:py-0 gap-4 lg:gap-12 w-full">
        
        {/* 📀 TRACK INFO (Primary on Mobile) */}
        <div className="flex items-center justify-between lg:justify-start gap-4 lg:gap-6 w-full lg:w-auto lg:min-w-[350px] relative group">
          <div className="flex items-center gap-4 flex-1">
              <div className="h-12 w-12 md:h-16 md:w-16 bg-white/5 flex items-center justify-center shrink-0 border border-white/10 relative overflow-hidden rounded-sm">
                {activeMetadata?.coverUrl ? (
                    <Image src={activeMetadata.coverUrl} alt={activeMetadata.name} fill className="object-cover" />
                ) : (
                    <Music className="h-6 w-6 text-white/10" />
                )}
              </div>
              <div className="overflow-hidden flex-1">
                 <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40 block mb-0.5 truncate italic">
                    {activeMetadata?.packName || "Previewing Artifact"}
                 </span>
                 <h4 className="text-[14px] md:text-xl font-black uppercase tracking-tighter truncate leading-none text-white/90">
                    {activeMetadata?.name || "Global Link Active"}
                 </h4>
                 
                 {/* 🧊 REACTIVE SPECTRUM (GLOBAL VISUALIZER) - Heavy DAW Animation */}
                 <div className="hidden md:flex items-end gap-[1px] h-4 mt-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    {isPlaying ? (
                        <DAWVisualizer color="#a6e22e" bars={30} height={16} />
                    ) : (
                        <div className="h-[2px] w-full bg-white/10 animate-pulse mt-2" />
                    )}
                 </div>
              </div>
          </div>

          {/* 🕹️ COMPACT TRANSPORT (Mobile Only Right Side) */}
          <div className="flex lg:hidden items-center gap-3">
               <button onClick={() => isPlaying ? pause() : play(activeId, '')} className="h-10 w-10 bg-white text-black flex items-center justify-center rounded-full">
                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
               </button>
               <button onClick={() => setIsVisible(false)} className="h-10 w-10 flex items-center justify-center text-white/20">
                    <X className="h-5 w-5" />
               </button>
          </div>
        </div>

        {/* 🎚️ ANALOG CONTROLS (Mainly Hidden on Small Viewports) */}
        <div className="hidden lg:flex flex-grow flex flex-col gap-4">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <button onClick={() => isPlaying ? pause() : play(activeId, '')} className="h-12 w-12 bg-white text-black flex items-center justify-center hover:invert transition-all shrink-0">
                        {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                    </button>
                    <button onClick={toggleLoop} className={`h-12 w-12 flex items-center justify-center transition-all ${isLooping ? 'bg-studio-yellow text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                        <Repeat className={`h-5 w-5 ${isLooping ? 'animate-pulse' : ''}`} />
                    </button>
                </div>
                
                <div className="flex-grow group relative h-8 flex items-center">
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        step="0.1"
                        value={currentTime}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        className="w-full accent-white bg-white/10 h-[2px] appearance-none cursor-pointer group-hover:h-1"
                    />
                </div>

                <div className="flex items-center gap-6 border-l border-white/10 pl-6 h-8 shrink-0">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none">Key</span>
                      <span className="text-[14px] font-black uppercase text-white leading-none mt-1 italic tracking-tighter">{activeMetadata?.audioKey || "—"}</span>
                   </div>
                   <div className="flex flex-col border-l border-white/10 pl-6">
                      <span className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none">BPM</span>
                      <span className="text-[14px] font-black uppercase text-white leading-none mt-1 italic tracking-tighter">{activeMetadata?.bpm || "—"}</span>
                   </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-black tabular-nums tracking-widest border-l border-white/10 pl-6 h-8 shrink-0">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-white/20">/</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>

        {/* 🛡️ MOBILE PROGRESS (Shown on Mobile) */}
        <div className="lg:hidden w-full px-2">
             <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full accent-studio-neon bg-white/10 h-1 md:h-1.5 appearance-none rounded-full"
            />
        </div>

        {/* 🛡️ RACK STATUS & VOLUME (Desktop Only) */}
        <div className="hidden xxl:flex items-center gap-8 border-l border-white/10 pl-12 h-12">
            <div className="relative group/vol flex items-center gap-4">
                <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="h-10 w-10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="w-24 h-8 flex items-center">
                    <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 accent-white appearance-none cursor-crosshair group-hover/vol:h-2 transition-all"
                    />
                </div>
            </div>
            <button onClick={() => setIsVisible(false)} className="h-10 w-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <X className="h-4 w-4" />
            </button>
        </div>
      </div>
    </div>
  )
}
