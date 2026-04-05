'use client'
import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { generatePreviewToken } from '@/app/packs/[slug]/actions'

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
    
    // Debugging listener for "No supported source found" errors
    audio.onerror = (e) => {
        console.error("AUDIO PLAYER ERROR:", {
            code: audio.error?.code,
            message: audio.error?.message,
            src: audio.src
        });
        setIsPlaying(false);
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
    
    // 🚀 USE SECURE STEALTH PROXY
    // Fetch a 60-second temporal token before playing
    let finalUrl = url;
    if (id) {
        try {
            const token = await generatePreviewToken(id);
            finalUrl = `/api/audio?id=${id}&token=${token}`;
        } catch (e) {
            console.error("Token generation failed:", e);
            alert("Security check failed. Please refresh.");
            return;
        }
    }

    if (!finalUrl) {
        console.warn("NO AUDIO SOURCE FOR ID:", id);
        return;
    }

    audioRef.current.pause()
    audioRef.current.src = finalUrl
    audioRef.current.load()
    
    audioRef.current.play()
      .then(() => {
          setActiveId(id)
          setIsPlaying(true)
      })
      .catch(err => {
          console.error("Playback failed for URL:", finalUrl, err);
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
