'use client'
import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { generatePreviewToken } from '@/app/packs/[slug]/actions'

type AudioContextType = {
  activeId: string | null
  isPlaying: boolean
  isLoading: boolean
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
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio()
    const audio = audioRef.current

    audio.onended = () => { setIsPlaying(false); setActiveId(null); }
    audio.ontimeupdate = () => { setCurrentTime(audio.currentTime); }
    audio.onloadedmetadata = () => { setDuration(audio.duration); }
    
    // When the audio is ready to play, stop loading
    audio.oncanplay = () => { setIsLoading(false); }
    audio.onloadstart = () => { setIsLoading(true); }
    
    // Debugging listener
    audio.onerror = (e) => {
        console.error("AUDIO PLAYER ERROR:", {
            code: audio.error?.code,
            message: audio.error?.message,
            src: audio.src
        });
        setIsPlaying(false);
        setIsLoading(false);
    }
    
    return () => { 
        audio.pause(); 
        audio.src = "";
        audioRef.current = null; 
    }
  }, [])

  const play = async (id: string, url: string) => {
    if (!audioRef.current) return
    if (activeId === id) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
      else { audioRef.current.play(); setIsPlaying(true); }
      return
    }
    
    setIsLoading(true);
    setActiveId(id);

    // 🚀 USE SECURE STEALTH PROXY
    let finalUrl = url;
    if (id) {
        try {
            const token = await generatePreviewToken(id);
            finalUrl = `/api/audio?id=${id}&token=${token}`;
        } catch (e) {
            console.error("Token generation failed:", e);
            alert("Security check failed. Please refresh.");
            setIsLoading(false);
            return;
        }
    }

    if (!finalUrl) {
        console.warn("NO AUDIO SOURCE FOR ID:", id);
        setIsLoading(false);
        return;
    }

    audioRef.current.pause()
    audioRef.current.src = finalUrl
    audioRef.current.load()
    
    audioRef.current.play()
      .then(() => {
          setIsPlaying(true)
      })
      .catch(err => {
          console.error("Playback failed for URL:", finalUrl, err);
          setIsLoading(false);
      })
  }

  const pause = () => { audioRef.current?.pause(); setIsPlaying(false); }
  const seek = (time: number) => { 
    if (audioRef.current) {
        audioRef.current.currentTime = time
        setCurrentTime(time)
    }
  }

  return (
    <AudioContext.Provider value={{ activeId, isPlaying, isLoading, currentTime, duration, play, pause, seek }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error('useAudio must be used within AudioProvider')
  return context
}
