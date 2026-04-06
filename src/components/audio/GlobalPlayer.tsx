'use client'
import React, { useEffect, useState } from 'react'
import { useAudio } from './AudioProvider'
import Image from 'next/image'
import { Play, Pause, X, Music, Activity, Repeat, Volume2, VolumeX, Volume1, ChevronUp, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DAWVisualizer } from '@/components/ui/DAWVisualizer'

import { useSidebar } from '../layout/SidebarContext'

export function GlobalPlayer() {
  const { activeId, activeMetadata, isPlaying, play, pause, currentTime, duration, seek, isLoading, spectrum, isLooping, toggleLoop, volume, setVolume, stop } = useAudio()
  const { isOpen } = useSidebar()
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
          className={`fixed bottom-[60px] md:bottom-0 left-0 right-0 z-[100] bg-black/90 border-t border-white/10 font-mono select-none overflow-hidden backdrop-blur-2xl ${isOpen ? 'lg:pl-80' : 'lg:pl-20'}`}
        >
          {/* ⚡ DOS SCANLINE OVERLAY */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          
          {/* Header Strip - COMPACT ON MOBILE */}
          <div className="bg-white/5 border-b border-white/5 px-4 md:px-6 py-1 flex justify-between items-center text-[7px] md:text-[8px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-40">
             <div className="flex items-center gap-2 md:gap-4">
                <span className="hidden xs:inline">[ MASTER_BUS_LIVE ]</span>
                {isLoading ? (
                    <span className="text-studio-neon animate-pulse">[ BUFFERING ]</span>
                ) : (
                    <span className="text-studio-neon animate-pulse">● SIGNAL_ACTIVE</span>
                )}
             </div>
             <div className="flex items-center gap-4">
                <span className="hidden md:inline">BUFFER_OK :: 128_SAMPLES</span>
                <span>VOL: {(volume * 100).toFixed(0)}%</span>
             </div>
          </div>

          <div className="flex flex-col md:flex-row h-auto md:h-20 items-center px-4 md:px-10 py-2 md:py-0 w-full relative z-20">
            
            {/* 📟 MOBILE DISPLAY & TRANSPORT (COMBINED) */}
            <div className="flex items-center justify-between w-full md:w-96 mb-2 md:mb-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-10 bg-black border border-white/10 relative group overflow-hidden shrink-0">
                        {activeMetadata?.coverUrl ? (
                            <Image src={activeMetadata.coverUrl} alt={activeMetadata.name} fill className="object-cover opacity-60" />
                        ) : (
                            <Music className="h-4 w-4 text-white/20 absolute center" />
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <span className="text-[7px] font-black text-studio-neon tracking-widest truncate uppercase italic block">
                            {activeMetadata?.packName || "EXTERNAL"}
                        </span>
                        <h4 className="text-[12px] md:text-lg font-black tracking-tight truncate leading-none text-white uppercase">
                            {activeMetadata?.name || "UNNAMED"}
                        </h4>
                    </div>
                </div>

                {/* COMPACT MOBILE ACTIONS */}
                <div className="flex items-center gap-1 md:hidden">
                    <button 
                        onClick={() => isPlaying ? pause() : play(activeId!, '')}
                        className="h-10 w-10 bg-white text-black flex items-center justify-center rounded-sm"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </button>
                    <button onClick={() => stop()} className="h-10 w-10 flex items-center justify-center text-white/20">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* 🕹️ DESKTOP TRANSPORT (HIDDEN ON MOBILE) */}
            <div className="hidden md:flex flex-grow items-center gap-6">
                <div className="flex items-center p-0.5 bg-white/5 border border-white/10">
                    <button 
                        onClick={() => isPlaying ? pause() : play(activeId!, '')} 
                        className="h-10 w-10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin text-studio-neon" /> : isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                    </button>
                    <button 
                        onClick={toggleLoop} 
                        className={`h-10 w-10 flex items-center justify-center transition-all ${isLooping ? 'bg-studio-neon text-black font-black' : 'hover:bg-white/10'}`}
                    >
                        <Repeat size={14} className={isLooping ? 'animate-pulse' : ''} />
                    </button>
                </div>

                {/* 📊 ANALYSER_GRID (Desktop & Tablet) */}
                <div className="flex-grow flex flex-col gap-1">
                    <div className="relative h-6 group">
                        <div className="absolute inset-0 bg-white/5 border border-white/5 flex items-center">
                            <div className="flex items-end gap-[1px] h-full w-full opacity-10 absolute inset-0 pointer-events-none">
                                <DAWVisualizer color="#a6e22e" bars={60} height={20} />
                            </div>
                            <input
                                type="range" min="0" max={duration || 100} step="0.1" value={currentTime}
                                onChange={(e) => seek(parseFloat(e.target.value))}
                                className="w-full h-full opacity-0 cursor-crosshair relative z-20"
                            />
                            <div className="absolute top-0 left-0 h-full bg-studio-neon/30 border-r-2 border-studio-neon shadow-[0_0_15px_#a6e22e33]" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 📊 MOBILE PROGRESS BAR (FULL WIDTH) */}
            <div className="md:hidden w-full relative h-[3px] bg-white/10 mb-2">
                <div className="absolute inset-0 pointer-events-none">
                    <input
                        type="range" min="0" max={duration || 100} step="0.1" value={currentTime}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        className="w-full h-full opacity-0 absolute inset-0 z-20"
                    />
                    <div className="absolute top-0 left-0 h-full bg-studio-neon transition-all duration-100" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                </div>
            </div>

            {/* 🏷️ METADATA_TAGS (Desktop Only) */}
            <div className="hidden xl:flex items-center gap-6 px-6 border-l border-white/5 h-10">
                {activeMetadata?.bpm && (
                    <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">TEMPO</span>
                        <span className="text-[14px] font-black italic text-studio-yellow leading-none">{activeMetadata.bpm}</span>
                    </div>
                )}
                {activeMetadata?.audioKey && (
                    <div className={`flex flex-col items-center border-white/10 pl-6 ${activeMetadata?.bpm ? 'border-l' : ''}`}>
                        <span className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">KEY</span>
                        <span className="text-[14px] font-black italic text-white leading-none">{activeMetadata.audioKey}</span>
                    </div>
                )}
                <div className="flex flex-col items-center border-l border-white/10 pl-6">
                    <span className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">TIMESTAMP</span>
                    <span className="text-[14px] font-black italic text-white leading-none tabular-nums">{formatTime(currentTime)}</span>
                </div>
            </div>

            {/* 🎚️ MASTER_IO (Desktop Only) */}
            <div className="hidden md:flex items-center gap-4 shrink-0">
                <button onClick={() => stop()} className="h-10 w-10 border border-white/10 hover:bg-studio-neon hover:text-black transition-all group flex items-center justify-center">
                    <X size={14} className="opacity-40 group-hover:opacity-100" />
                </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
