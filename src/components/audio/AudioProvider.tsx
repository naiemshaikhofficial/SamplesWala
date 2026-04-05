'use client'
import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { generatePreviewToken } from '@/app/packs/[slug]/actions'

type AudioContextType = {
  activeId: string | null
  activeMetadata: { name: string, packName: string, coverUrl?: string | null } | null
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  spectrum: number[]
  play: (id: string, url: string, metadata?: { name: string, packName: string, coverUrl?: string | null }) => void
  pause: () => void
  seek: (time: number) => void
  setIsLoading: (val: boolean) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeMetadata, setActiveMetadata] = useState<{ name: string, packName: string } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [spectrum, setSpectrum] = useState<number[]>(new Array(40).fill(0))
  const [user, setUser] = useState<any>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const ctxRef = useRef<any>(null)
  const animationRef = useRef<number | null>(null)
  const watermarkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const userRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { createClient } = require('@/lib/supabase/client');
    const supabase = createClient();
    
    supabase.auth.getUser().then(({ data }: { data: any }) => {
        setUser(data.user);
        userRef.current = data.user;
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setUser(session?.user ?? null);
        userRef.current = session?.user ?? null;
    });

    return () => {
        authListener.subscription.unsubscribe();
    }
  }, []);

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
        analyzer.fftSize = 128;
        analyzer.smoothingTimeConstant = 0.8;
        
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyzer);
        analyzer.connect(ctx.destination);
        
        analyzerRef.current = analyzer;
        ctxRef.current = ctx;
    }

    const startWatermark = () => {
        // ALWAYS WATERMARK PREVIEWS (Regardless of Login)
        stopWatermark();
        watermarkIntervalRef.current = setInterval(() => {
            if (audio.paused) return;
            audio.volume = 0.2;
            setTimeout(() => { if (audio.src) audio.volume = 1.0; }, 400);
        }, 8000);
    }

    const stopWatermark = () => {
        if (watermarkIntervalRef.current) clearInterval(watermarkIntervalRef.current);
    }

    const updateSpectrum = () => {
        if (analyzerRef.current && !audio.paused) {
            const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
            analyzerRef.current.getByteFrequencyData(dataArray);
            const newSpectrum = [];
            for (let i = 0; i < 40; i++) {
                let val = dataArray[i * 1] / 255; 
                newSpectrum.push(val);
            }
            setSpectrum(newSpectrum);
        }
        animationRef.current = requestAnimationFrame(updateSpectrum);
    };

    audio.onplay = async () => {
        setupAnalyzer();
        if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume();
        setIsPlaying(true);
        updateSpectrum();
        startWatermark();
    };
    audio.onpause = () => {
        setIsPlaying(false);
        stopWatermark();
    };
    audio.onended = () => { 
        setIsPlaying(false); 
        setActiveId(null); 
        setActiveMetadata(null);
        setCurrentTime(0); 
        setSpectrum(new Array(40).fill(0));
        stopWatermark();
    }
    
    audio.ontimeupdate = () => { setCurrentTime(audio.currentTime); }
    audio.onloadedmetadata = () => { setDuration(audio.duration); }
    audio.oncanplay = () => { setIsLoading(false); }
    audio.onloadstart = () => { if (audio.src) setIsLoading(true); }
    
    return () => { 
        audio.pause(); 
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        stopWatermark();
    }
  }, [])

  const play = async (id: string, url: string, metadata?: { name: string, packName: string, coverUrl?: string | null }) => {
    if (!audioRef.current) return
    
    if (activeId === id) {
      if (isPlaying) audioRef.current.pause();
      else {
        audioRef.current.play().catch(e => {
            if (e.name !== 'AbortError') console.error("Toggle play failed:", e);
        });
      }
      return
    }
    
    audioRef.current.pause();
    audioRef.current.src = "";
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setActiveId(id);
    if (metadata) setActiveMetadata(metadata as any);

    try {
        const token = await generatePreviewToken(id);
        const finalUrl = `/api/audio?id=${id}&token=${token}`;
        
        audioRef.current.src = finalUrl;
        audioRef.current.load();
        
        // 🔥 FIX: Handle the play promise to prevent AbortError
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                if (error.name === 'AbortError') {
                    // Ignore abort errors caused by rapid play/pause
                    console.log("Audio playback interrupted (expected).");
                } else {
                    console.error("Playback failed:", error);
                }
            });
        }
    } catch (e) {
        console.error("Token generation or setup failed:", e);
        setIsLoading(false);
        setActiveId(null);
        setActiveMetadata(null);
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
    <AudioContext.Provider value={{ activeId, activeMetadata, isPlaying, isLoading, currentTime, duration, spectrum, play, pause, seek, setIsLoading }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error('useAudio must be used within AudioProvider')
  return context
}
