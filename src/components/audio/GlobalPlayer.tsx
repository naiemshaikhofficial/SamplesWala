'use client'
import React, { useEffect, useState } from 'react'
import { useAudio } from './AudioProvider'
import Image from 'next/image'
import { Play, Pause, X, Music, Activity, SkipBack, SkipForward } from 'lucide-react'

export function GlobalPlayer() {
  const { activeId, activeMetadata, isPlaying, play, pause, currentTime, duration, seek, isLoading } = useAudio()
  const [isVisible, setIsVisible] = useState(false)

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
      {/* 🎰 THE RACK HEADER */}
      <div className="flex h-24 items-center px-6 md:px-20 gap-12">
        
        {/* 📀 TRACK INFO */}
        <div className="flex items-center gap-6 min-w-[300px]">
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
          <div className="overflow-hidden">
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">
                {activeMetadata?.packName || "Previewing Artifact"}
             </span>
             <h4 className="text-xl font-black uppercase tracking-tighter truncate leading-none">
                {activeMetadata?.name || "Global Link Active"}
             </h4>
          </div>
        </div>

        {/* 🎚️ ANALOG CONTROLS */}
        <div className="flex-grow flex flex-col gap-4">
            <div className="flex items-center gap-8">
                <button onClick={() => isPlaying ? pause() : play(activeId, '')} className="h-12 w-12 bg-white text-black flex items-center justify-center hover:invert transition-all">
                    {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                </button>
                
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

                <div className="flex items-center gap-4 text-[10px] font-black tabular-nums tracking-widest">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-white/20">/</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>

        {/* 🛡️ RACK STATUS */}
        <div className="hidden xl:flex items-center gap-12 border-l border-white/10 pl-12">
            <div className="flex flex-col gap-1 items-end">
                <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-4 w-1 bg-white ${isPlaying ? 'animate-pulse' : 'opacity-20'}`} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Signal Lock</span>
            </div>
            <button onClick={() => setIsVisible(false)} className="h-10 w-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <X className="h-4 w-4" />
            </button>
        </div>
      </div>
    </div>
  )
}
