
'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useAudio } from './AudioProvider'

export function Waveform({ id, active }: { id: string; active?: boolean }) {
  const { activeId, isPlaying, spectrum, currentTime, duration, seek } = useAudio()
  const isActive = activeId === id
  const progress = isActive ? (currentTime / duration) * 100 : 0
  
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

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  }

  return (
    <div 
      ref={containerRef}
      onClick={handleSeek}
      className={`relative h-14 w-full flex items-center justify-center gap-[2px] overflow-hidden select-none group cursor-pointer transition-all duration-700 rounded-sm bg-black/40 border border-white/[0.03] active:bg-black/60`}
    >
      {/* 🧬 SCANLINE OVERLAY: Professional Studio Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20" />
      
      {/* 🔋 ACTIVE GLOW AURA */}
      {isActive && isPlaying && (
          <div 
            className="absolute inset-y-0 left-0 bg-[#a6e22e]/[0.05] blur-xl pointer-events-none transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
      )}

      {/* 🎧 SOUND_CLOUD: 80 Precise Bars */}
      <div className="relative z-10 flex items-center justify-center gap-[2px] w-full h-full px-4">
        {staticBars.map((baseHeight, i) => {
            const barPos = (i / staticBars.length) * 100;
            const isPast = barPos < progress;
            
            let realTimeHeight = baseHeight;
            let pulseFactor = 1;
            
            if (isActive && isPlaying && spectrum) {
                const energy = spectrum[i % 40] || 0;
                realTimeHeight = Math.max(baseHeight, energy * 250); 
                pulseFactor = 1 + energy * 0.5;
            }

            return (
              <div 
                key={i}
                className={`w-[2px] rounded-full transition-all duration-75`}
                style={{ 
                  height: `${realTimeHeight}%`,
                  backgroundColor: isPast 
                    ? '#a6e22e' 
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: (isPast && isActive && isPlaying) ? '0 0 10px rgba(166,226,46,0.3)' : 'none',
                  transform: `scaleY(${pulseFactor})`,
                  opacity: isPast ? 1 : 0.3
                }}
              />
            )
        })}
      </div>

      {/* 🔭 PROGRESS MARKER: Surgical precision line */}
      {isActive && (
          <div 
            className="absolute top-0 bottom-0 w-[1px] bg-[#a6e22e] z-30 shadow-[0_0_10px_#a6e22e]"
            style={{ left: `${progress}%` }}
          />
      )}
    </div>
  )
}
