'use client'
import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { generatePreviewToken } from '@/app/packs/[slug]/actions'

type AudioContextType = {
  activeId: string | null
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  spectrum: number[]
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
  const [spectrum, setSpectrum] = useState<number[]>(new Array(40).fill(0))
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const ctxRef = useRef<any>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
    }

    const audio = audioRef.current;

    const setupAnalyzer = () => {
        if (analyzerRef.current) return;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyzer = ctx.createAnalyser();
        analyzer.fftSize = 128; // Smaller for more 'kick' sensitivity
        analyzer.smoothingTimeConstant = 0.8;
        
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyzer);
        analyzer.connect(ctx.destination);
        
        analyzerRef.current = analyzer;
        ctxRef.current = ctx;
    }

    const updateSpectrum = () => {
        if (analyzerRef.current && !audio.paused) {
            const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
            analyzerRef.current.getByteFrequencyData(dataArray);
            
            // Map to 40 bars (more responsive mapping)
            const newSpectrum = [];
            for (let i = 0; i < 40; i++) {
                // Focus on lower frequencies for better "beat" visualization
                let val = dataArray[i * 1] / 255; 
                newSpectrum.push(val);
            }
            setSpectrum(newSpectrum);
        }
        animationRef.current = requestAnimationFrame(updateSpectrum);
    };

    audio.onplay = async () => {
        setupAnalyzer();
        if (ctxRef.current?.state === 'suspended') {
            await ctxRef.current.resume();
        }
        setIsPlaying(true);
        updateSpectrum();
    };
    audio.onpause = () => {
        setIsPlaying(false);
    };
    audio.onended = () => { 
        setIsPlaying(false); 
        setActiveId(null); 
        setCurrentTime(0); 
        setSpectrum(new Array(40).fill(0));
    }
    
    audio.ontimeupdate = () => { setCurrentTime(audio.currentTime); }
    audio.onloadedmetadata = () => { setDuration(audio.duration); }
    audio.oncanplay = () => { setIsLoading(false); }
    audio.onloadstart = () => { if (audio.src) setIsLoading(true); }
    
    return () => { 
        audio.pause(); 
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [])

  const play = async (id: string, url: string) => {
    if (!audioRef.current) return
    
    // Toggle
    if (activeId === id) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(console.error);
      return
    }
    
    audioRef.current.pause();
    audioRef.current.src = "";
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setActiveId(id);

    try {
        const token = await generatePreviewToken(id);
        const finalUrl = `/api/audio?id=${id}&token=${token}`;
        
        audioRef.current.src = finalUrl;
        audioRef.current.load();
        await audioRef.current.play();
    } catch (e) {
        console.error("Playback start failed:", e);
        setIsLoading(false);
        setActiveId(null);
    }
  }

  const pause = () => { audioRef.current?.pause(); }
  const seek = (time: number) => { 
    if (audioRef.current) {
        audioRef.current.currentTime = time
        setCurrentTime(time)
    }
  }

  return (
    <AudioContext.Provider value={{ activeId, isPlaying, isLoading, currentTime, duration, spectrum, play, pause, seek }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error('useAudio must be used within AudioProvider')
  return context
}
