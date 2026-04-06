'use client'
import React, { useEffect, useState } from 'react'
import { useAudio } from './AudioProvider'

export function Waveform({ id, active }: { id: string; active?: boolean }) {
  const { activeId, isPlaying, spectrum, currentTime, duration, seek } = useAudio()
  const isActive = activeId === id
  const progress = isActive ? (currentTime / duration) * 100 : 0
  
  // 🧬 Deterministic Seed for Hydration Safety:
  // We use the ID to generate the SAME random bars on server & client
  const [staticBars] = useState<number[]>(() => {
    // Basic hash from ID string
    let seed = 0;
    for (let j = 0; j < id.length; j++) seed += id.charCodeAt(j);
    
    // Seeded random helper
    const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    return Array.from({ length: 50 }).map((_, i) => {
        const mid = 25;
        const dist = Math.abs(i - mid);
        const base = Math.max(10, 60 - dist * 2); 
        return base + seededRandom() * 20;
    })
  })

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  }

  return (
    <div 
      onClick={handleSeek}
      className="relative h-14 w-full flex items-center justify-center gap-[4px] overflow-hidden select-none group cursor-pointer transition-all duration-700"
    >
      
      {/* Subtle Analog Aura (No Glow) */}
      {isActive && isPlaying && (
          <div 
            className="absolute inset-y-0 left-0 bg-white/[0.05] pointer-events-none transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
      )}

      {staticBars.map((baseHeight, i) => {
        const barPos = (i / staticBars.length) * 100;
        const isPast = barPos < progress;
        
        let realTimeHeight = baseHeight;
        let energyValue = 0;
        
        if (isActive && isPlaying && spectrum) {
             // Map frequencies to the bars
             energyValue = spectrum[Math.floor(i % 40)] || 0;
             realTimeHeight = Math.max(baseHeight, energyValue * 220); 
        }

        return (
          <div 
            key={i}
            className="w-[2px] rounded-full transition-all duration-100"
            style={{ 
              height: `${realTimeHeight}%`,
              // Color Logic: Sharp white for past, Clinical dark gray for upcoming
              backgroundColor: isPast 
                ? (isActive ? '#fff' : 'rgba(255,255,255,0.7)') 
                : 'rgba(255,255,255,0.1)',
              transform: isActive && isPlaying ? `scaleY(${1 + energyValue * 0.4})` : 'scaleY(1)',
              opacity: isPast ? 1 : 0.4
            }}
          />
        )
      })}
      
      {/* NO MORE DANDA/STICK HERE */}
    </div>
  )
}
