'use client'
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { generatePreviewToken } from '@/app/packs/[slug]/actions'
import { getCachedAudio, cacheAudio } from '@/lib/audio/cache'
import { getVibeSuggestions } from '@/app/api/vibe/actions'
import { useAuth } from '@/components/providers/AuthProvider'
import { User } from '@supabase/supabase-js'

type AudioMetadata = { 
    id: string, 
    url?: string,
    name: string, 
    packName: string, 
    coverUrl?: string | null, 
    bpm?: number | null, 
    audioKey?: string | null, 
    isUnlocked?: boolean,
    creditCost?: number | null,
    signal?: string | null
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
  user: User | null
  registerSignals: (signals: Record<string, string>) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeMetadata, setActiveMetadata] = useState<AudioMetadata | null>(null)
  const [vibeSuggestions, setVibeSuggestions] = useState<any[]>([])

  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [spectrum, setSpectrum] = useState<number[]>(new Array(40).fill(0))
  const [isLooping, setIsLooping] = useState(false)
  const [volume, setVolumeState] = useState(1.0)
  const [user, setUser] = useState<User | null>(null)
  
  // 🎵 PLAYLIST_STATE :: Managed via ref-sync for instant navigation access
  const [playlist, setPlaylistState] = useState<AudioMetadata[]>([])
  const [signalRegistry, setSignalRegistry] = useState<Record<string, string>>({})
  const signalRegistryRef = useRef<Record<string, string>>({})

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const ctxRef = useRef<any>(null)
  const animationRef = useRef<number | null>(null)
  const watermarkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const userVolumeRef = useRef(1.0)
  const userRef = useRef<User | null>(null)
  const playlistRef = useRef<AudioMetadata[]>([])
  const activeMetadataRef = useRef<AudioMetadata | null>(null)
  const currentObjectUrlRef = useRef<string | null>(null)
  const loadingTargetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (activeId) {
        getVibeSuggestions(activeId).then(setVibeSuggestions)
    }
  }, [activeId])

  // Sync ref for immediate access in event handlers
  useEffect(() => {
    playlistRef.current = playlist
  }, [playlist])

  const setPlaylist = useCallback((list: AudioMetadata[] | ((prev: AudioMetadata[]) => AudioMetadata[])) => {
      setPlaylistState(prev => {
          const next = typeof list === 'function' ? list(prev) : list;
          playlistRef.current = next;
          
          // 🛰️ AUTO_SIGNAL_DISCOVERY: Merge any newly received signals into global registry
          const newSignals: Record<string, string> = {};
          next.forEach(item => {
              if (item.signal) newSignals[item.id] = item.signal;
          });
          if (Object.keys(newSignals).length > 0) {
              registerSignals(newSignals);
          }
          
          return next;
      });
  }, []);

  const registerSignals = useCallback((newSignals: Record<string, string>) => {
      setSignalRegistry(prev => {
          const next = { ...prev, ...newSignals };
          signalRegistryRef.current = next;
          return next;
      });
  }, []);

  const { user: authUser } = useAuth();

  useEffect(() => {
    setUser(authUser);
    userRef.current = authUser;
  }, [authUser]);

  const pause = useCallback(() => { audioRef.current?.pause(); }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load(); // Force clear buffer
    }
    if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
        currentObjectUrlRef.current = null;
    }
    setActiveId(null);
    setActiveMetadata(null);
    activeMetadataRef.current = null;
    loadingTargetIdRef.current = null;
    setCurrentTime(0);
    setSpectrum(new Array(40).fill(0));
    if (watermarkIntervalRef.current) clearInterval(watermarkIntervalRef.current);
  }, []);

  // 🎹 GLOBAL_STUDIO_SHORTCUTS
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
         const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
         if (isInput) return;

         switch (e.code) {
             case 'Space':
                 e.preventDefault(); 
                 if (isPlaying) pause();
                 else if (activeId) audioRef.current?.play().catch(() => {});
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
  }, [isPlaying, activeId]);

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
            
            // 🛑 STOP_IF_UNLOCKED :: Kill watermark if user just purchased/unlocked the sample
            if (activeMetadataRef.current?.isUnlocked) {
                stopWatermark();
                audio.volume = userVolumeRef.current;
                return;
            }

            const currentVol = userVolumeRef.current;
            audio.volume = currentVol * 0.2;
            setTimeout(() => { 
                if (audio.src && !activeMetadataRef.current?.isUnlocked) {
                    audio.volume = userVolumeRef.current;
                } 
            }, 400);
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
        if (!activeMetadataRef.current?.isUnlocked) {
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
        activeMetadataRef.current = null;
        setCurrentTime(0); 
        setSpectrum(new Array(40).fill(0));
        stopWatermark();
    }
    
    audio.ontimeupdate = () => { setCurrentTime(audio.currentTime); }
    audio.onloadedmetadata = () => { setDuration(audio.duration); }
    audio.oncanplay = () => { setIsLoading(false); }
    audio.onloadstart = () => { if (audio.src) setIsLoading(true); }
    
    return () => { 
        // Note: Don't pause on effect cleanup because this effect should only run once
        // Only cleanup if we are really destroying things
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        stopWatermark();
        if (currentObjectUrlRef.current) {
            URL.revokeObjectURL(currentObjectUrlRef.current);
        }
    }
  }, []); // Run only once

  // Sync metadata ref
  useEffect(() => {
    activeMetadataRef.current = activeMetadata;
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
        audioRef.current.play().catch(() => {});
      }
      return
    }
    
    audioRef.current.pause();
    audioRef.current.src = "";
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setActiveId(id);
    loadingTargetIdRef.current = id; // Set target for race condition check
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
            
            // 🛰️ SIGNAL_OPTIMIZATION_GATE :: Use registry fallback if metadata signal is missing
            const activeSignal = metadata?.signal || signalRegistryRef.current[id] || signalRegistryRef.current[id.replace('_lq', '').replace('_hq', '')];
            const signalParam = activeSignal ? `&signal=${encodeURIComponent(activeSignal)}` : '';
            const finalUrl = `/api/audio?id=${id}&token=${token}${signalParam}`;
            
            const response = await fetch(finalUrl);
            if (!response.ok) throw new Error(`Proxy Fetch Failed: ${response.status}`);
            blob = await response.blob();

            if (!metadata?.isUnlocked && !isAdminSignal) {
                await cacheAudio(id, blob);
            }
        }

        const objectUrl = URL.createObjectURL(blob);
        
        // 🏁 RACE_CONDITION_CHECK :: Ensure we still want to play this specific ID
        if (loadingTargetIdRef.current !== id) {
            URL.revokeObjectURL(objectUrl);
            return;
        }

        // Revoke previous URL if any
        if (currentObjectUrlRef.current) {
            URL.revokeObjectURL(currentObjectUrlRef.current);
        }
        currentObjectUrlRef.current = objectUrl;

        audioRef.current.src = objectUrl;
        audioRef.current.volume = userVolumeRef.current;
        audioRef.current.load();
        
        audioRef.current.play().catch(() => {});
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

  const next = useCallback(() => {
    const currentPlaylist = playlistRef.current
    if (currentPlaylist.length === 0) return
    const currentIndex = currentPlaylist.findIndex(s => s.id === activeId)
    const nextIndex = (currentIndex + 1) % currentPlaylist.length
    const nextSample = currentPlaylist[nextIndex]
    play(nextSample.id, nextSample.url, nextSample)
  }, [activeId, play]);

  const prev = useCallback(() => {
    const currentPlaylist = playlistRef.current
    if (currentPlaylist.length === 0) return
    const currentIndex = currentPlaylist.findIndex(s => s.id === activeId)
    const prevIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length
    const prevSample = currentPlaylist[prevIndex]
    play(prevSample.id, prevSample.url, prevSample)
  }, [activeId, play]);

  return (
    <AudioContext.Provider value={{ 
        activeId, activeMetadata, isPlaying, isLoading, currentTime, duration, spectrum, 
        isLooping, volume, playlist, vibeSuggestions, play, pause, seek, setVolume, toggleLoop, 
        setIsLoading, stop, setPlaylist, updateMetadataUnlocked, next, prev, user, registerSignals
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
