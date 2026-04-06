'use client'
import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { generatePreviewToken } from '@/app/packs/[slug]/actions'

type AudioContextType = {
  activeId: string | null
  activeMetadata: { name: string, packName: string, coverUrl?: string | null, bpm?: number | null, audioKey?: string | null, isUnlocked?: boolean } | null
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  spectrum: number[]
  isLooping: boolean
  volume: number
  play: (id: string, url: string, metadata?: { name: string, packName: string, coverUrl?: string | null, bpm?: number | null, audioKey?: string | null, isUnlocked?: boolean }) => void
  pause: () => void
  seek: (time: number) => void
  setVolume: (val: number) => void
  toggleLoop: () => void
  setIsLoading: (val: boolean) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeMetadata, setActiveMetadata] = useState<{ name: string, packName: string, coverUrl?: string | null, bpm?: number | null, audioKey?: string | null, isUnlocked?: boolean } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [spectrum, setSpectrum] = useState<number[]>(new Array(40).fill(0))
  const [isLooping, setIsLooping] = useState(false)
  const [volume, setVolumeState] = useState(1.0)
  const [user, setUser] = useState<any>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const ctxRef = useRef<any>(null)
  const animationRef = useRef<number | null>(null)
  const watermarkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const userVolumeRef = useRef(1.0)
  const userRef = useRef<any>(null)

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
        
        try {
            const source = ctx.createMediaElementSource(audio);
            source.connect(analyzer);
            analyzer.connect(ctx.destination);
            analyzerRef.current = analyzer;
            ctxRef.current = ctx;
        } catch (e) {
            console.warn("Analyzer setup failed (likely already connected):", e);
        }
    }

    const startWatermark = () => {
        stopWatermark();
        watermarkIntervalRef.current = setInterval(() => {
            if (audio.paused) return;
            const currentVol = userVolumeRef.current;
            audio.volume = currentVol * 0.2;
            setTimeout(() => { if (audio.src) audio.volume = userVolumeRef.current; }, 400);
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
        if (!activeMetadata?.isUnlocked) {
            startWatermark();
        }
    };
    audio.onpause = () => {
        setIsPlaying(false);
        stopWatermark();
    };
    audio.onended = () => { 
        if (audio.loop) return;
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

  const setVolume = (val: number) => {
    setVolumeState(val)
    userVolumeRef.current = val
    if (audioRef.current) audioRef.current.volume = val
  }

  const play = async (id: string, url: string, metadata?: { name: string, packName: string, coverUrl?: string | null, bpm?: number | null, audioKey?: string | null, isUnlocked?: boolean }) => {
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
        audioRef.current.volume = userVolumeRef.current;
        audioRef.current.load();
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                if (error.name !== 'AbortError') console.error("Playback failed:", error);
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

  const toggleLoop = () => {
    if (audioRef.current) {
        const next = !isLooping;
        audioRef.current.loop = next;
        setIsLooping(next);
    }
  }

  return (
    <AudioContext.Provider value={{ activeId, activeMetadata, isPlaying, isLoading, currentTime, duration, spectrum, isLooping, volume, play, pause, seek, setVolume, toggleLoop, setIsLoading }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error('useAudio must be used within AudioProvider')
  return context
}
