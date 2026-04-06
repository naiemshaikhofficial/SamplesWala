'use client'
import React, { useEffect, useState } from 'react'
import { useAudio } from './AudioProvider'
import Image from 'next/image'
import { Play, Pause, X, Music, Activity, Repeat, Volume2, VolumeX, Volume1 } from 'lucide-react'

export function GlobalPlayer() {
  const { activeId, activeMetadata, isPlaying, play, pause, currentTime, duration, seek, isLoading, spectrum, isLooping, toggleLoop, volume, setVolume } = useAudio()
  const [isVisible, setIsVisible] = useState(false)
  const [showVolume, setShowVolume] = useState(false)

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
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black border-t-2 border-white lg:pl-20 animate-in slide-in-from-bottom duration-500">
      {/* 🔮 ANTI-PIRACY SECURITY BANNER */}
      {!activeMetadata?.isUnlocked && (
          <div className="bg-white text-black h-8 flex items-center justify-between px-6 md:px-20 overflow-hidden relative group/banner">
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                       <Activity size={10} className="animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">[ PREVIEW_MODE_ACTIVE ]</span>
                  </div>
                  <span className="hidden md:inline text-[8px] font-bold uppercase tracking-widest text-black/60">
                      LOW QUALITY AUDIO WITH WATERMARK. UNLOCK TO DOWNLOAD FULL HIGH-QUALITY WAV.
                  </span>
              </div>
              <div className="flex items-center gap-1 opacity-20 group-hover/banner:opacity-100 transition-opacity">
                  {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-1 w-4 bg-black" />
                  ))}
              </div>
          </div>
      )}
      {/* 🎰 THE RACK HEADER */}
      <div className="flex h-24 items-center px-6 md:px-20 gap-12">
        
        {/* 📀 TRACK INFO */}
        <div className="flex items-center gap-6 min-w-[300px] relative group">
          <div className="h-16 w-16 bg-white/5 flex items-center justify-center shrink-0 border border-white/10 relative overflow-hidden">
            {activeMetadata?.coverUrl ? (
                <Image 
                    src={activeMetadata.coverUrl} 
                    alt={activeMetadata.name} 
                    fill 
                    className="object-cover" 
                />
            ) : (
                <Music className="h-8 w-8 text-white/10" />
            )}
          </div>
          <div className="overflow-hidden flex-1">
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1 italic">
                {activeMetadata?.packName || "Previewing Artifact"}
             </span>
             <h4 className="text-xl font-black uppercase tracking-tighter truncate leading-none">
                {activeMetadata?.name || "Global Link Active"}
             </h4>
             
             {/* 🧊 REACTIVE SPECTRUM (GLOBAL VISUALIZER) */}
             <div className="flex items-end gap-[1px] h-4 mt-2 opacity-40 group-hover:opacity-100 transition-opacity">
                {spectrum && spectrum.length > 0 ? (
                    spectrum.slice(0, 48).map((v, i) => (
                        <div 
                            key={i} 
                            className="w-[2px] bg-white rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(10, v * 300)}%` }}
                        />
                    ))
                ) : (
                    <div className="h-px w-full bg-white/10 animate-pulse" />
                )}
             </div>
          </div>
        </div>

        {/* 🎚️ ANALOG CONTROLS */}
        <div className="flex-grow flex flex-col gap-4">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <button onClick={() => isPlaying ? pause() : play(activeId, '')} className="h-12 w-12 bg-white text-black flex items-center justify-center hover:invert transition-all shrink-0">
                        {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                    </button>
                    <button 
                        onClick={toggleLoop} 
                        className={`h-12 w-12 flex items-center justify-center transition-all ${isLooping ? 'bg-studio-yellow text-black ring-4 ring-studio-yellow/20' : 'bg-white/5 text-white hover:bg-white/10'}`}
                        title="Toggle Loop"
                    >
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
                        className="w-full transition-all accent-white bg-white/10 h-[2px] appearance-none cursor-none group-hover:h-1"
                    />
                </div>

                <div className="flex items-center gap-6 border-l border-white/10 pl-6 h-8 shrink-0">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none">Key</span>
                      <span className="text-[14px] font-black uppercase text-white leading-none mt-1 italic tracking-tighter">
                        {activeMetadata?.audioKey || "—"}
                      </span>
                   </div>
                   <div className="flex flex-col border-l border-white/10 pl-6">
                      <span className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none">BPM</span>
                      <span className="text-[14px] font-black uppercase text-white leading-none mt-1 italic tracking-tighter">
                        {activeMetadata?.bpm || "—"}
                      </span>
                   </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-black tabular-nums tracking-widest border-l border-white/10 pl-6 h-8 shrink-0">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-white/20">/</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>

        {/* 🛡️ RACK STATUS & VOLUME */}
        <div className="hidden xl:flex items-center gap-8 border-l border-white/10 pl-12 h-12">
            
            {/* 🔊 GAIN CONTROL (Volume) */}
            <div className="relative group/vol flex items-center gap-4">
                <button 
                   onClick={() => setVolume(volume === 0 ? 1 : 0)} 
                   className="h-10 w-10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                    {volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
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

            <div className="flex flex-col gap-1 items-end ml-4">
                <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-4 w-1 bg-white ${isPlaying ? 'animate-pulse' : 'opacity-20'}`} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-spidey-red">Signal Lock</span>
            </div>
            
            <button onClick={() => setIsVisible(false)} className="h-10 w-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <X className="h-4 w-4" />
            </button>
        </div>
      </div>
    </div>
  )
}
