'use client'
import React, { useEffect, useState } from 'react'
import { useAudio } from './AudioProvider'
import Image from 'next/image'
import { Play, Pause, X, Music, Activity, Repeat, Volume2, VolumeX, Volume1, ChevronUp, Loader2, SkipBack, SkipForward } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DAWVisualizer } from '@/components/ui/DAWVisualizer'
import { DownloadButton } from './DownloadButton'

import { useSidebar } from '../layout/SidebarContext'

export function GlobalPlayer() {
  const { activeId, activeMetadata, isPlaying, play, pause, currentTime, duration, seek, isLoading, spectrum, isLooping, toggleLoop, volume, setVolume, stop, next, prev, playlist } = useAudio()
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
          
          {/* Header Strip - CLARIFIED WARNINGS */}
          <div className="bg-white/5 border-b border-white/5 px-4 md:px-6 py-2 flex justify-between items-center text-[8px] md:text-[9px] font-black tracking-widest uppercase">
             <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <span className="hidden xs:inline shrink-0 text-white/20">System Active</span>
                {isLoading ? (
                    <span className="text-studio-neon animate-pulse">Loading Audio...</span>
                ) : activeMetadata?.isUnlocked ? (
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-studio-neon animate-pulse shadow-[0_0_8px_#a6e22e]" />
                        <span className="text-studio-neon font-black">Playing: Original Quality (Lossless)</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 overflow-hidden bg-studio-yellow/10 px-3 py-1 rounded-sm border border-studio-yellow/20">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-studio-yellow animate-pulse" />
                            <span className="text-studio-yellow font-black">Preview Mode</span>
                        </div>
                        <div className="h-3 w-px bg-white/10" />
                        <span className="text-white/60 italic lowercase">watermark active // unlock for high quality</span>
                    </div>
                )}
             </div>
             <div className="flex items-center gap-4 shrink-0 text-white/20 font-black">
                <span className="hidden md:inline">Buffer: 100%</span>
                <span className="text-studio-neon">Volume: {(volume * 100).toFixed(0)}%</span>
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
                            {activeMetadata?.packName || "Sample Pack"}
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

            {/* 🕹️ CENTERED CONTROL CORE */}
            <div className="hidden md:flex flex-1 items-center justify-center gap-6">
                <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-sm">
                    <button 
                        onClick={prev}
                        className="h-10 w-10 flex items-center justify-center hover:bg-white/10 transition-all text-white/30 hover:text-white"
                        disabled={playlist.length <= 1}
                    >
                        <SkipBack size={16} fill="currentColor" />
                    </button>
                    <button 
                        onClick={() => isPlaying ? pause() : play(activeId!, '')} 
                        className="h-10 w-14 flex items-center justify-center bg-white text-black hover:bg-studio-neon transition-all"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin text-black" /> : isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                    </button>
                    <button 
                        onClick={next}
                        className="h-10 w-10 flex items-center justify-center hover:bg-white/10 transition-all text-white/30 hover:text-white"
                        disabled={playlist.length <= 1}
                    >
                        <SkipForward size={16} fill="currentColor" />
                    </button>
                </div>

                {/* Metadata & Timestamp Group */}
                <div className="flex items-center gap-1">
                    {activeMetadata?.bpm && (
                        <div className="flex flex-col items-center justify-center h-12 w-20 bg-black/60 border border-white/5 rounded-sm">
                            <span className="text-[12px] font-black italic text-studio-neon leading-none">{activeMetadata.bpm}</span>
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest mt-1">BPM</span>
                        </div>
                    )}
                    {activeMetadata?.audioKey && (
                        <div className="flex flex-col items-center justify-center h-12 w-20 bg-black/60 border border-white/5 rounded-sm">
                            <span className="text-[12px] font-black italic text-white leading-none">{activeMetadata.audioKey}</span>
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest mt-1">KEY</span>
                        </div>
                    )}
                    <div className="flex flex-col items-center justify-center h-12 w-24 bg-black/60 border border-white/5 rounded-sm">
                        <span className="text-[12px] font-black italic text-white leading-none tabular-nums">{formatTime(currentTime)}</span>
                        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest mt-1">TIME</span>
                    </div>
                </div>

                <button 
                    onClick={toggleLoop} 
                    className={`h-12 w-12 flex items-center justify-center transition-all border border-white/10 rounded-sm ${isLooping ? 'bg-studio-neon text-black font-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                    <Repeat size={14} className={isLooping ? 'animate-pulse' : ''} />
                </button>
            </div>

            {/* 🎚️ MASTER_IO (Balanced w-96 for symmetry) */}
            <div className="flex items-center gap-4 md:gap-6 shrink-0 transition-all border-l border-white/5 pl-6 md:w-96 justify-end">
                {/* 🔊 VOLUME_SIGNAL_BUS */}
                <div className="hidden md:flex items-center gap-3 w-28 group relative">
                    <Volume2 size={12} className="text-white/20 group-hover:text-studio-neon transition-colors" />
                    <input 
                        type="range" min="0" max="1" step="0.01" 
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 appearance-none rounded-full cursor-pointer accent-studio-neon"
                    />
                </div>

                {activeId && (
                    <div className="flex items-center gap-2">
                        <DownloadButton 
                            sampleId={activeId} 
                            isUnlockedInitial={activeMetadata?.isUnlocked || false}
                            creditCost={activeMetadata?.creditCost || 1} 
                        />
                    </div>
                )}
                <button onClick={() => stop()} className="h-10 w-10 border border-white/10 hover:bg-studio-neon hover:text-black transition-all group flex items-center justify-center">
                    <X size={14} className="opacity-40 group-hover:opacity-100" />
                </button>
            </div>
            {/* 📊 GLOBAL PROGRESS BAR (Absolute Bottom of Player) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-30">
                <input
                    type="range" min="0" max={duration || 100} step="0.1" value={currentTime}
                    onChange={(e) => seek(parseFloat(e.target.value))}
                    className="w-full h-full opacity-0 absolute inset-0 z-40 cursor-pointer"
                />
                <div className="absolute top-0 left-0 h-full bg-studio-neon transition-all duration-100 shadow-[0_0_10px_#a6e22e]" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
