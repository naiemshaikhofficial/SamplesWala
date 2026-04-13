'use client'
import { Play, Pause, Loader2 } from 'lucide-react'
import { useAudio } from './AudioProvider'

export function PlayButton({ 
  id, 
  url, 
  name = "Unknown", 
  packName = "Vault Artifact", 
  coverUrl = null,
  bpm = null,
  audioKey = null,
  isUnlocked = false,
  creditCost = null,
  lightMode = false,
  size = "md"
}: { 
  id: string, 
  url?: string, 
  name?: string, 
  packName?: string, 
  coverUrl?: string | null,
  bpm?: number | null,
  audioKey?: string | null,
  audio_url?: string | null,
  isUnlocked?: boolean,
  creditCost?: number | null,
  lightMode?: boolean,
  size?: "md" | "lg" | "xl"
}) {
  const { activeId, isPlaying, isLoading, play } = useAudio()
  const isActive = activeId === id
  const currentlyPlaying = isActive && isPlaying

  const sizeClasses = {
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24 md:h-32 md:w-32"
  }

  const iconClasses = {
    md: "h-4 w-4",
    lg: "h-6 w-6",
    xl: "h-10 w-10 md:h-12 md:w-12"
  }

  return (
    <button 
      onClick={(e) => { e.preventDefault(); play(id, url, { id, url, name, packName, coverUrl, bpm, audioKey, isUnlocked, creditCost }); }}
      className={`
        ${sizeClasses[size]} flex items-center justify-center rounded-full bg-white text-black transition-all hover:scale-110 active:scale-95 shadow-xl
        ${isActive && isPlaying ? 'ring-8 ring-white/10' : ''}
      `}
    >
      {isActive && isLoading ? (
          <Loader2 className={`${iconClasses[size]} animate-spin text-black`} />
      ) : currentlyPlaying ? (
          <Pause className={`${iconClasses[size]} fill-current`} />
      ) : (
          <Play className={`${iconClasses[size]} fill-current ${size === 'xl' ? 'ml-2' : 'ml-0.5'}`} />
      )}
    </button>
  )
}
