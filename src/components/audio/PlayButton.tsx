'use client'
import { Play, Pause, Loader2 } from 'lucide-react'
import { useAudio } from './AudioProvider'

export function PlayButton({ id, url }: { id: string, url: string }) {
  const { activeId, isPlaying, isLoading, play } = useAudio()
  const isActive = activeId === id
  const currentlyPlaying = isActive && isPlaying

  return (
    <button 
      onClick={(e) => { e.preventDefault(); play(id, url); }}
      className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-black transition-all hover:scale-105 active:scale-95"
    >
      {isActive && isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
      ) : currentlyPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
      ) : (
          <Play className="h-4 w-4 fill-current" />
      )}
    </button>
  )
}
