'use client'
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { generatePreviewToken } from '@/app/packs/[slug]/actions'
import { getCachedAudio, cacheAudio } from '@/lib/audio/cache'
import { getVibeSuggestions } from '@/app/api/vibe/actions'

type AudioMetadata = { 
    id: string, 
    url?: string,
    name: string, 
    packName: string, 
    coverUrl?: string | null, 
    bpm?: number | null, 
    audioKey?: string | null, 
    isUnlocked?: boolean,
    creditCost?: number | null
}

type AudioContextType = {
  activeId: string | null
  activeMetadata: AudioMetadata | null
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  spectrum: number[]
  isLooping: boolean
  volume: number
  playlist: AudioMetadata[]
  play: (id: string, url?: string, metadata?: AudioMetadata) => void
  pause: () => void
  seek: (time: number) => void
  setVolume: (val: number) => void
  toggleLoop: () => void
  setIsLoading: (val: boolean) => void
  stop: () => void
  setPlaylist: (list: AudioMetadata[]) => void
  updateMetadataUnlocked: (id: string) => void
  vibeSuggestions: any[]
  next: () => void
  prev: () => void
  user: any | null
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeMetadata, setActiveMetadata] = useState<AudioMetadata | null>(null)
  const [vibeSuggestions, setVibeSuggestions] = useState<any[]>([])

  useEffect(() => {
    if (activeId) {
        getVibeSuggestions(activeId).then(setVibeSuggestions)
    }
  }, [activeId])

  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [spectrum, setSpectrum] = useState<number[]>(new Array(40).fill(0))
  const [isLooping, setIsLooping] = useState(false)
  const [volume, setVolumeState] = useState(1.0)
  const [playlist, setPlaylist] = useState<AudioMetadata[]>([])
  const [user, setUser] = useState<any>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const ctxRef = useRef<any>(null)
  const animationRef = useRef<number | null>(null)
  const watermarkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const userVolumeRef = useRef(1.0)
  const userRef = useRef<any>(null)
  const playlistRef = useRef<AudioMetadata[]>([])

  const setPlaylist = useCallback((list: AudioMetadata[] | ((prev: AudioMetadata[]) => AudioMetadata[])) => {
      setPlaylistState(prev => {
          const next = typeof list === 'function' ? list(prev) : list;
          playlistRef.current = next;
          return next;
      });
  }, []);

  // Sync ref for immediate access in event handlers
  useEffect(() => {
    playlistRef.current = playlist
  }, [playlist])

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { createClient } = require('@/lib/supabase/client');
    const supabase = createClient();
    
    supabase.auth.getSession().then(({ data }: { data: any }) => {
        setUser(data.session?.user || null);
        userRef.current = data.session?.user || null;
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        userRef.current = currentUser;

        if (event === 'SIGNED_OUT') {
            stop();
            setPlaylist([]);
            window.location.reload(); 
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    }
  }, []);

  const pause = useCallback(() => { audioRef.current?.pause(); }, []);

  const next = useCallback(() => {
    const currentPlaylist = playlistRef.current
    if (currentPlaylist.length === 0) return
    const currentIndex = currentPlaylist.findIndex(s => s.id === activeId)
    const nextIndex = (currentIndex + 1) % currentPlaylist.length
    const nextSample = currentPlaylist[nextIndex]
    play(nextSample.id, nextSample.url, nextSample)
  }, [activeId]);

  const prev = useCallback(() => {
    const currentPlaylist = playlistRef.current
    if (currentPlaylist.length === 0) return
    const currentIndex = currentPlaylist.findIndex(s => s.id === activeId)
    const prevIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length
    const prevSample = currentPlaylist[prevIndex]
    play(prevSample.id, prevSample.url, prevSample)
  }, [activeId]);

  // 🎹 GLOBAL_STUDIO_SHORTCUTS
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
         const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
         if (isInput) return;

         switch (e.code) {
             case 'Space':
                 e.preventDefault(); 
                 if (isPlaying) pause();
                 else if (activeId) audioRef.current?.play();
                 break;
             case 'ArrowRight':
                 next();
                 break;
             case 'ArrowLeft':
                 prev();
                 break;
         }
     }

     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, activeId, next, prev, pause]);

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
            console.warn("Analyzer setup failed:", e);
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
  }, [activeMetadata]);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val)
    userVolumeRef.current = val
    if (audioRef.current) audioRef.current.volume = val
  }, []);

  const resolveDriveSignal = useCallback((url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
        const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
            return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
        }
    }
    return url;
  }, []);

  const play = useCallback(async (id: string, url?: string, metadata?: AudioMetadata) => {
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
    if (metadata) setActiveMetadata(metadata);

    try {
        const cachedBlob = await getCachedAudio(id);
        let blob: Blob;

        const isAdminSignal = id.endsWith('_lq') || id.endsWith('_hq');

        if (cachedBlob && !isAdminSignal) {
            blob = cachedBlob;
        } else {
            const cleanId = id.replace('_lq', '').replace('_hq', '');
            const token = await generatePreviewToken(cleanId);
            const finalUrl = `/api/audio?id=${id}&token=${token}`;
            
            const response = await fetch(finalUrl);
            if (!response.ok) throw new Error(`Proxy Fetch Failed: ${response.status}`);
            blob = await response.blob();

            if (!metadata?.isUnlocked && !isAdminSignal) {
                await cacheAudio(id, blob);
            }
        }

        const objectUrl = URL.createObjectURL(blob);
        
        const revokeListener = () => {
            URL.revokeObjectURL(objectUrl);
            audioRef.current?.removeEventListener('loadedmetadata', revokeListener);
        };
        audioRef.current.addEventListener('loadedmetadata', revokeListener);

        audioRef.current.src = objectUrl;
        audioRef.current.volume = userVolumeRef.current;
        audioRef.current.load();
        
        const mainPlayPromise = audioRef.current.play();
        if (mainPlayPromise !== undefined) {
            mainPlayPromise.catch((error) => {
                if (error.name !== 'AbortError') console.error("SIGNAL_REJECTED:", error);
            });
        }
        setIsLoading(false);
    } catch (e) {
        console.error("Playback failed:", e);
        setIsLoading(false);
        setActiveId(null);
        setActiveMetadata(null);
    }
  }, [activeId, isPlaying]);

  const seek = useCallback((time: number) => { 
    if (audioRef.current) {
        audioRef.current.currentTime = time
        setCurrentTime(time)
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
    }
    setActiveId(null);
    setActiveMetadata(null);
    setCurrentTime(0);
    setSpectrum(new Array(40).fill(0));
    if (watermarkIntervalRef.current) clearInterval(watermarkIntervalRef.current);
  }, []);

  const toggleLoop = useCallback(() => {
    if (audioRef.current) {
        const nxt = !isLooping;
        audioRef.current.loop = nxt;
        setIsLooping(nxt);
    }
  }, [isLooping]);

  const updateMetadataUnlocked = useCallback((id: string) => {
    if (activeId === id && activeMetadata) {
        setActiveMetadata({ ...activeMetadata, isUnlocked: true })
    }
    setPlaylist(prev => prev.map(item => item.id === id ? { ...item, isUnlocked: true } : item))
  }, [activeId, activeMetadata, setPlaylist]);

  // Rename setter to allow custom callback version
  const [playlist, setPlaylistState] = useState<AudioMetadata[]>([])

  return (
    <AudioContext.Provider value={{ 
        activeId, activeMetadata, isPlaying, isLoading, currentTime, duration, spectrum, 
        isLooping, volume, playlist, vibeSuggestions, play, pause, seek, setVolume, toggleLoop, 
        setIsLoading, stop, setPlaylist, updateMetadataUnlocked, next, prev, user
    }}>
        {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error('useAudio must be used within AudioProvider')
  return context
}
