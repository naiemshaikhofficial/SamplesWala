'use client'
import React, { useEffect, useState } from 'react'
import { useAudio } from './AudioProvider'

export function Waveform({ id, active }: { id: string; active?: boolean }) {
  const { activeId, isPlaying, spectrum, currentTime, duration } = useAudio()
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

  return (
    <div className="relative h-14 w-full flex items-center justify-center gap-[4px] overflow-hidden select-none group cursor-pointer transition-all duration-700">
      
      {/* Subtle Glow Aura behind active bars */}
      {isActive && isPlaying && (
          <div 
            className="absolute inset-y-0 left-0 bg-white/[0.03] blur-3xl pointer-events-none transition-all duration-500"
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
              // Color Logic: Bright white for past, Dim gray for upcoming
              backgroundColor: isPast 
                ? (isActive ? '#fff' : 'rgba(255,255,255,0.7)') 
                : 'rgba(255,255,255,0.15)',
              // Add a soft glow to the leading edge bar
              boxShadow: (isActive && isPlaying && isPast && Math.abs(barPos - progress) < 3) 
                ? '0 0 15px rgba(255,255,255,1)' 
                : 'none',
              transform: isActive && isPlaying ? `scaleY(${1 + energyValue * 0.3})` : 'scaleY(1)',
              opacity: isPast ? 1 : 0.4
            }}
          />
        )
      })}
      
      {/* NO MORE DANDA/STICK HERE */}
    </div>
  )
}
