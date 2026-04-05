'use client'
import { useRef } from 'react'
import { useAudio } from './AudioProvider'

export function Waveform({ id, active }: { id: string, active: boolean }) {
  const { currentTime, duration, seek, isPlaying } = useAudio()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const progress = active ? (currentTime / duration) * 100 : 0

  const handleClick = (e: React.MouseEvent) => {
    if (!active || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newProgress = x / rect.width
    seek(newProgress * duration)
  }

  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full h-8 flex items-center gap-[2px] cursor-pointer group transition-all"
    >
      {[...Array(30)].map((_, i) => {
        const barProgress = (i / 30) * 100
        const isPlayed = progress > barProgress
        return (
          <div 
            key={i} 
            className={`flex-1 rounded-full transition-all ${isPlayed ? 'bg-white' : 'bg-white/20 group-hover:bg-white/30'}`} 
            style={{ height: (30 + (Math.sin(i * 0.5) * 50 + 50) * 0.4) + '%' }}
          ></div>
        )
      })}
      
      {active && (
        <div 
            className="absolute top-0 bottom-0 w-[1px] bg-white shadow-[0_0_10px_white] transition-transform duration-75"
            style={{ left: progress + '%' }}
        />
      )}
    </div>
  )
}
