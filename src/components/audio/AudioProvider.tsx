'use client'
import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

type AudioContextType = {
  activeId: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  play: (id: string, url: string) => void
  pause: () => void
  seek: (time: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio()
    const audio = audioRef.current

    audio.onended = () => { setIsPlaying(false); setActiveId(null); }
    audio.ontimeupdate = () => { setCurrentTime(audio.currentTime); }
    audio.onloadedmetadata = () => { setDuration(audio.duration); }
    
    return () => { audio.pause(); audioRef.current = null; }
  }, [])

  const play = (id: string, url: string) => {
    if (!audioRef.current) return
    if (activeId === id) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
      else { audioRef.current.play(); setIsPlaying(true); }
      return
    }
    audioRef.current.pause()
    audioRef.current.src = url
    audioRef.current.play()
    setActiveId(id)
    setIsPlaying(true)
  }

  const pause = () => { audioRef.current?.pause(); setIsPlaying(false); }
  const seek = (time: number) => { 
    if (audioRef.current) {
        audioRef.current.currentTime = time
        setCurrentTime(time)
    }
  }

  return (
    <AudioContext.Provider value={{ activeId, isPlaying, currentTime, duration, play, pause, seek }}>
      {children}
    </AudioContext.Provider>
  )
}
export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error('useAudio must be used within AudioProvider')
  return context
}
