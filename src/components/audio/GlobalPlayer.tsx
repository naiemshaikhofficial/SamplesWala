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
          className={`fixed bottom-[74px] lg:bottom-0 left-0 right-0 z-[100] bg-black border-t-2 border-white/20 font-mono select-none overflow-hidden ${isOpen ? 'lg:pl-80' : 'lg:pl-20'}`}
        >
          {/* ⚡ DOS SCANLINE OVERLAY */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          
          {/* Header Strip */}
          <div className="bg-white/5 border-b border-white/5 px-6 py-1 flex justify-between items-center text-[8px] font-bold tracking-[0.3em] uppercase opacity-40">
             <div className="flex items-center gap-4">
                <span>[ MASTER_BUS_LIVE ]</span>
                {isLoading ? (
                    <span className="text-studio-neon animate-pulse">[ BUFFER_LOADING ]</span>
                ) : (
                    <span className="text-studio-neon animate-pulse">● AUDIO_ENCODED</span>
                )}
             </div>
             <div className="flex items-center gap-4">
                <span>BUFFER_OK :: 128_SAMPLES</span>
                <span>VOL_GAIN: {(volume * 100).toFixed(0)}%</span>
             </div>
          </div>

          <div className="flex flex-col lg:flex-row h-auto lg:h-20 items-center px-4 md:px-10 py-3 lg:py-0 gap-4 lg:gap-8 w-full relative z-20">
            
            {/* 📟 DOS TRACK DISPLAY */}
            <div className="flex items-center gap-4 w-full lg:w-96">
                <div className="h-12 w-12 bg-black border border-white/20 relative group overflow-hidden shrink-0">
                    {activeMetadata?.coverUrl ? (
                        <Image src={activeMetadata.coverUrl} alt={activeMetadata.name} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <Music className="h-4 w-4 text-white/20 absolute center" />
                    )}
                    {/* Retro Grid on Cover */}
                    <div className="absolute inset-0 step-grid opacity-20 pointer-events-none" />
                </div>
                
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 bg-studio-neon rounded-full animate-pulse shadow-[0_0_10px_#a6e22e]" />
                        <span className="text-[10px] font-black text-studio-neon tracking-widest truncate uppercase italic">
                            {activeMetadata?.packName || "EXTERNAL_ARTIFACT"}
                        </span>
                    </div>
                    <h4 className="text-[14px] md:text-lg font-black tracking-tighter truncate leading-none text-white selection:bg-studio-neon selection:text-black uppercase">
                        {activeMetadata?.name || "SIGNAL_UNNAMED"}
                    </h4>
                </div>
            </div>

            {/* 🕹️ TRANSPORT & MIXER (TERMINAL STYLE) */}
            <div className="flex-grow flex items-center gap-6">
                <div className="flex items-center p-1 bg-white/5 border border-white/10">
                    <button 
                        onClick={() => isPlaying ? pause() : play(activeId, '')} 
                        className="h-10 w-10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                        disabled={isLoading}
                        title={isLoading ? "BUFFERING" : isPlaying ? "PAUSE" : "EXECUTE_PLAY"}
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin text-studio-neon" />
                        ) : isPlaying ? (
                            <Pause size={18} fill="currentColor" />
                        ) : (
                            <Play size={18} fill="currentColor" className="ml-1" />
                        )}
                    </button>
                    <button 
                        onClick={toggleLoop} 
                        className={`h-10 w-10 flex items-center justify-center transition-all ${isLooping ? 'bg-studio-neon text-black font-black' : 'hover:bg-white/10'}`}
                    >
                        <Repeat size={14} className={isLooping ? 'animate-pulse' : ''} />
                    </button>
                </div>

                {/* 📊 CORE PROGRESS :: ANALYSER_GRID */}
                <div className="flex-grow flex flex-col gap-1">
                    <div className="flex justify-between items-end text-[7px] font-black tracking-[0.2em] text-white/20 uppercase mb-1">
                        <span>L_CH :: ANALYTICS</span>
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                        <span>R_CH :: ANALYTICS</span>
                    </div>
                    <div className="relative h-6 group">
                        <div className="absolute inset-0 bg-white/5 border border-white/5 flex items-center">
                            {/* Static Visualizer Bars */}
                            <div className="flex items-end gap-[1px] h-full w-full opacity-20 absolute inset-0 pointer-events-none">
                                <DAWVisualizer color="#a6e22e" bars={60} height={20} />
                            </div>
                            
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                step="0.1"
                                value={currentTime}
                                onChange={(e) => seek(parseFloat(e.target.value))}
                                className="w-full h-full opacity-0 cursor-crosshair relative z-20"
                            />
                            {/* Custom Tracker Bar */}
                            <div 
                                className="absolute top-0 left-0 h-full bg-studio-neon/30 border-r-2 border-studio-neon pointer-events-none transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(166,226,46,0.2)]"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* 🏷️ METADATA_TAGS HUD */}
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
            </div>

            {/* 🎚️ MASTER_IO_CTRL */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                         <Volume2 size={12} className="text-white/20" />
                         <div className="w-24 h-1.5 bg-black border border-white/20 relative overflow-hidden group/vol">
                            <input 
                                type="range" min="0" max="1" step="0.01" value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="absolute top-0 left-0 h-full bg-white transition-all ease-out" style={{ width: `${volume * 100}%` }} />
                         </div>
                    </div>
                    <span className="text-[6px] font-black text-white/10 tracking-[0.5em] uppercase">MASTER_BUS_VOL</span>
                </div>
                
                <button onClick={() => stop()} className="h-10 w-10 border border-white/10 hover:bg-studio-neon hover:text-black transition-all group">
                    <X size={14} className="opacity-40 group-hover:opacity-100" />
                </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
