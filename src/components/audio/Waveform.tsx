
'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useAudio } from './AudioProvider'

export function Waveform({ id, active }: { id: string; active?: boolean }) {
  const { activeId, isPlaying, spectrum, currentTime, duration, seek } = useAudio()
  const isActive = activeId === id
  
  // 🧬 Master DAW Seed for Realistic Bar Distribution
  const [staticBars] = useState<number[]>(() => {
    let seed = 0;
    for (let j = 0; j < id.length; j++) seed += id.charCodeAt(j);
    
    const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    // 🎹 REALISTIC WAVE DENSITY: 80 narrow bars
    return Array.from({ length: 80 }).map((_, i) => {
        const mid = 40;
        const dist = Math.abs(i - mid);
        const curve = Math.cos((i / 80) * Math.PI) * 0.5 + 0.5;
        const randomFactor = seededRandom() * 30;
        return 15 + curve * 45 + randomFactor;
    })
  })

  // 🚀 PERFORMANCE_SHIELD: Prevent non-active waveforms from doing anything during playback
  const progress = isActive ? (currentTime / duration) * 100 : 0

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  }

  // 🔥 VIRTUALIZATION_HINT: If not active, render a static simplified version
  if (!isActive) {
      return (
          <div className="relative h-14 w-full flex items-center justify-center gap-[2px] overflow-hidden select-none bg-black/40 border border-white/[0.03] rounded-sm group px-4">
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] scanline-bg z-20" />
              <div className="flex items-center justify-center gap-[2px] w-full h-full opacity-30 grayscale group-hover:grayscale-0 transition-all duration-500">
                  {staticBars.map((baseHeight, i) => i % 4 === 0 && (
                      <div 
                        key={i}
                        className="w-[2px] bg-white/20 rounded-full"
                        style={{ height: `${baseHeight}%` }}
                      />
                  ))}
              </div>
          </div>
      )
  }

  return (
    <div 
      onClick={handleSeek}
      className={`relative h-14 w-full flex items-center justify-center gap-[2px] overflow-hidden select-none group cursor-pointer transition-all duration-700 rounded-sm bg-black/40 border border-white/[0.03] active:bg-black/60`}
    >
      {/* 🧬 SCANLINE OVERLAY: Professional Studio Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] scanline-bg z-20" />
      
      {/* 🔋 ACTIVE GLOW AURA */}
      {isPlaying && (
          <div 
            className="absolute inset-y-0 left-0 bg-[#a6e22e]/[0.05] blur-xl pointer-events-none transition-all duration-300"
            style={{ width: `${progress.toFixed(2)}%` }}
          />
      )}

      {/* 🎧 SOUND_CLOUD: Optimized Bar Rendering */}
      <div className="relative z-10 flex items-center justify-center gap-[2px] w-full h-full px-4">
        {staticBars.map((baseHeight, i) => {
            const barPos = (i / staticBars.length) * 100;
            const isPast = barPos < progress;
            
            let realTimeHeight = baseHeight;
            let pulseFactor = 1;
            
            if (isPlaying && spectrum) {
                const energy = spectrum[i % 40] || 0;
                realTimeHeight = Math.max(baseHeight, energy * 250); 
                pulseFactor = 1 + energy * 0.5;
            }

            return (
              <div 
                key={i}
                className={`w-[2px] rounded-full transition-all duration-75`}
                style={{ 
                  height: `${realTimeHeight.toFixed(2)}%`,
                  backgroundColor: isPast 
                    ? '#a6e22e' 
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: (isPast && isPlaying) ? '0 0 10px rgba(166,226,46,0.3)' : 'none',
                  transform: `scaleY(${pulseFactor.toFixed(2)})`,
                  opacity: isPast ? 1 : 0.3,
                  pointerEvents: 'none'
                }}
              />
            )
        })}
      </div>

      {/* 🔭 PROGRESS MARKER: Surgical precision line */}
      <div 
        className="absolute top-0 bottom-0 w-[1px] bg-[#a6e22e] z-30 shadow-[0_0_10px_#a6e22e]"
        style={{ left: `${progress.toFixed(2)}%` }}
      />
    </div>
  )
}
