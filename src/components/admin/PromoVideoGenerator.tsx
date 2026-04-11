'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Zap, Play, Pause, Download, Video, Music, Layers, Disc, Trash2, Loader2, Key as KeyIcon, Activity } from 'lucide-react'
import { searchSamplesAction } from '@/app/admin/actions'
import { generatePreviewToken } from '@/app/packs/[slug]/actions'
import Image from 'next/image'

export default function PromoVideoGenerator() {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [selectedSample, setSelectedSample] = useState<any>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [recordProgress, setRecordProgress] = useState(0)
    const [isLogoLoaded, setIsLogoLoaded] = useState(false)
    const [coverImg, setCoverImg] = useState<HTMLImageElement | null>(null)
    const [dominantColor, setDominantColor] = useState('#a6e22e') // Defaults to studio neon
    const [audioStatus, setAudioStatus] = useState<'IDLE' | 'LOADING' | 'READY' | 'ERROR'>('IDLE')
    
    // Canvas & Audio Refs
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const logoRef = useRef<HTMLImageElement | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const objectUrlRef = useRef<string | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    
    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<AudioBufferSourceNode | MediaElementAudioSourceNode | null>(null)
    const animationFrameRef = useRef<number | null>(null)

    // 🛰️ SIGNAL_RESOLVER: Adopts the core player's secure proxy logic
    const resolveAudioSignal = async (sample: any) => {
        if (!sample) return;
        setAudioStatus('LOADING');
        
        try {
            // 🏷️ Generate temporary authorization token
            const token = await generatePreviewToken(sample.id);
            const proxyUrl = `/api/audio?id=${sample.id}&token=${token}`;
            
            console.log(`[SIGNAL_ROUTE] Handshaking with Proxy: ${proxyUrl}`);
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`SIGNAL_DENIED: ${response.status}`);
            
            const blob = await response.blob();
            
            // 🧼 Clean up previous signal
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            
            const newUrl = URL.createObjectURL(blob);
            objectUrlRef.current = newUrl;
            
            if (audioRef.current) {
                audioRef.current.src = newUrl;
                audioRef.current.load();
            }
            setAudioStatus('READY');
        } catch (err) {
            console.error('❌ SIGNAL_RESOLVE_FAILED ::', err);
            setAudioStatus('ERROR');
        }
    }

    // Handle Selection Change
    useEffect(() => {
        if (selectedSample) {
            resolveAudioSignal(selectedSample);
            
            // 🖼️ Load Cover Art for Canvas
            if (selectedSample.cover_url) {
                const img = new (window.Image || (window as any).Image)();
                img.crossOrigin = "anonymous";
                img.src = selectedSample.cover_url;
                img.onload = () => {
                    setCoverImg(img);
                    // 🎨 Extract color signal
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        canvas.width = 1; canvas.height = 1;
                        ctx.drawImage(img, 0, 0, 1, 1);
                        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                        setDominantColor(hex);
                    }
                };
                img.onerror = () => {
                    setCoverImg(null);
                    setDominantColor('#a6e22e');
                };
            } else {
                setCoverImg(null);
                setDominantColor('#a6e22e');
            }
        }
    }, [selectedSample])

    // Handle Search
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        setIsSearching(true)
        try {
            const results = await searchSamplesAction(searchQuery)
            setSearchResults(results)
        } catch (err) {
            console.error('SEARCH_ERROR ::', err)
        } finally {
            setIsSearching(false)
        }
    }

    // Initialize Audio Visualizer logic
    const initVisualizer = () => {
        if (!audioRef.current || !canvasRef.current) return
        
        // 🛡️ PREVENT MULTI-RENDER LOOPS
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
            analyserRef.current = audioContextRef.current.createAnalyser()
            analyserRef.current.fftSize = 256
            
            const source = audioContextRef.current.createMediaElementSource(audioRef.current)
            source.connect(analyserRef.current)
            analyserRef.current.connect(audioContextRef.current.destination)
            sourceRef.current = source
        }
        
        draw()
    }

    // 📺 HIGH_DEFINITION_INIT: Establish 1080p Base
    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = 1920;
            canvasRef.current.height = 1080;
        }
    }, [])

    const draw = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        const analyser = analyserRef.current
        
        if (!canvas || !ctx || !analyser) return

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const renderFrame = () => {
            animationFrameRef.current = requestAnimationFrame(renderFrame)
            analyser.getByteFrequencyData(dataArray)

            const width = canvas.width
            const height = canvas.height

            // 🧬 DYNAMIC_LAYOUT_CONSTANTS
            const leftX = width * 0.28 
            const infoX = width * 0.58 // Shifted further right as requested
            const centerY = height * 0.5
            const bassFreq = dataArray[0] 
            const beatIntensity = bassFreq / 255
            const artPulse = 440 + (beatIntensity * 100)
            
            // 🧺 Clear Frame
            ctx.clearRect(0, 0, width, height)
            
            // 1. Draw Background (Studio Deep + Blurred Cover)
            ctx.fillStyle = '#050505'
            ctx.fillRect(0, 0, width, height)
            
            // 🖼️ CINEMATIC_BACKGROUND_OVERLAY
            const bgImg = coverImg || logoRef.current
            if (bgImg && bgImg.naturalWidth > 0) {
                ctx.save()
                ctx.globalAlpha = 0.2 + (beatIntensity * 0.1) // Pulses with beat
                ctx.filter = 'blur(60px) brightness(0.5)'
                const scale = Math.max(width / bgImg.width, height / bgImg.height)
                const w = bgImg.width * scale
                const h = bgImg.height * scale
                ctx.drawImage(bgImg, (width - w) / 2, (height - h) / 2, w, h)
                ctx.filter = 'none'
                ctx.restore()
            }
            
            // Subtle Radial Glow (Matches Art)
            ctx.beginPath()
            const bgGlow = ctx.createRadialGradient(leftX, centerY, 0, leftX, centerY, width * 0.7)
            bgGlow.addColorStop(0, `${dominantColor}${Math.floor(beatIntensity * 60).toString(16).padStart(2, '0')}`)
            bgGlow.addColorStop(1, 'transparent')
            ctx.fillStyle = bgGlow
            ctx.fillRect(0, 0, width, height)

            // 2. Draw Visualizer (Radiating from Left)
            ctx.save()
            ctx.translate(leftX, centerY)
            const barCount = 140
            const radius = 260 + (beatIntensity * 20)
            
            for (let i = 0; i < barCount; i++) {
                const angle = (i * 2 * Math.PI) / barCount
                const barHeight = (dataArray[i % bufferLength] / 255) * 260 * (0.7 + beatIntensity)
                
                const x1 = radius * Math.cos(angle)
                const y1 = radius * Math.sin(angle)
                const x2 = (radius + barHeight) * Math.cos(angle)
                const y2 = (radius + barHeight) * Math.sin(angle)

                ctx.beginPath()
                // Synchronize bars to artwork color
                ctx.strokeStyle = dominantColor
                ctx.globalAlpha = 0.3 + (beatIntensity * 0.7)
                ctx.lineWidth = 2
                ctx.moveTo(x1, y1)
                ctx.lineTo(x2, y2)
                ctx.stroke()
            }
            ctx.globalAlpha = 1
            ctx.restore()

            // 3. Draw Cover Art (Extreme Pulse + Wobble)
            const img = coverImg || logoRef.current
            
            if (img && img.naturalWidth > 0) {
                ctx.save()
                ctx.translate(leftX, centerY)
                
                // Aggressive Tilt + Shake on beat
                ctx.rotate(Math.sin(Date.now() / 100) * 0.15 * beatIntensity)
                
                // Circular Clip
                ctx.beginPath()
                ctx.arc(0, 0, artPulse/2, 0, Math.PI * 2)
                ctx.closePath()
                ctx.clip()
                
                ctx.drawImage(img, -artPulse/2, -artPulse/2, artPulse, artPulse)
                ctx.restore()

                // Neon Ring (Matches Art)
                ctx.beginPath()
                ctx.arc(leftX, centerY, artPulse/2 + 5, 0, Math.PI * 2)
                ctx.strokeStyle = dominantColor
                ctx.lineWidth = 12
                ctx.stroke()
            }

            // 5. Draw Info Panel (High Contrast & Spaced)
            if (selectedSample) {
                // 🏷️ Track Name Setup
                const nameText = selectedSample.name.toUpperCase()
                ctx.font = `900 54px Inter, sans-serif`
                ctx.textAlign = 'left'
                ctx.fillStyle = 'white'
                ctx.letterSpacing = '-1px'
                
                // Measure for centering CTA
                const nameMetrics = ctx.measureText(nameText)
                const nameWidth = nameMetrics.width
                
                // Draw Name
                ctx.fillText(nameText, infoX, centerY)
                
                // 🏷️ BRAND_CTA_OVERLAY (Centered Below Name)
                ctx.textAlign = 'center'
                ctx.font = '900 12px Inter, sans-serif'
                ctx.fillStyle = dominantColor
                ctx.letterSpacing = '4px'
                
                // Position X = Start of name + Half of name width
                const ctaX = infoX + (nameWidth / 2)
                ctx.fillText('GET IT ON WWW.SAMPLESWALA.COM', ctaX, centerY + 50)
            }
        }

        renderFrame()
    }

    const togglePlay = () => {
        if (!audioRef.current || audioStatus === 'LOADING') return
        
        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume()
            }
            
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true)
                    initVisualizer()
                })
                .catch(e => {
                    if (e.name !== 'AbortError') console.warn('🔊 PROMO_GEN :: Play logic interrupted. Handshaking with new signal.', e);
                })
        }
    }

    const startRecording = () => {
        if (!canvasRef.current || !audioRef.current || !audioContextRef.current || !analyserRef.current) return
        
        setIsRecording(true)
        setRecordProgress(0)
        chunksRef.current = []

        const canvasStream = canvasRef.current.captureStream(60) // 60fps for smoothness
        
        // Create a destination for the recorder
        const dest = audioContextRef.current.createMediaStreamDestination()
        
        // Connect the analyser to this destination
        analyserRef.current.connect(dest)
        
        // Build the combined stream
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
        ])

        // 🧬 STUDIO_QUALITY_CALIBRATION
        const videoBitsPerSecond = 10000000; // 10Mbps for Full HD
        const mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
        
        try {
            const options = MediaRecorder.isTypeSupported(mimeType) 
                ? { mimeType, videoBitsPerSecond }
                : { mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond };

            mediaRecorderRef.current = new MediaRecorder(combinedStream, options)
        } catch (e) {
            console.warn('⚠️ MP4_ENCODER_UNAVAILABLE : Falling back to standard WebM.', e);
            mediaRecorderRef.current = new MediaRecorder(combinedStream, { videoBitsPerSecond });
        }

        mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        mediaRecorderRef.current.onstop = () => {
            const isMp4Supported = MediaRecorder.isTypeSupported(mimeType);
            const blob = new Blob(chunksRef.current, { 
                type: isMp4Supported ? 'video/mp4' : 'video/webm' 
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `SAMPLESWALA_PROMO_${selectedSample.name.replace(/\s+/g, '_')}.${isMp4Supported ? 'mp4' : 'webm'}`
            a.click()
            setIsRecording(false)
            setRecordProgress(0)
            // Disconnect dest to prevent accumulation
            analyserRef.current?.disconnect(dest)
        }

        mediaRecorderRef.current.start()
        
        // Force play
        audioRef.current.currentTime = 0
        audioRef.current.play()
        setIsPlaying(true)

        // Progress interval
        const duration = audioRef.current.duration || 15
        const start = Date.now()
        const interval = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000
            const prog = Math.min(100, (elapsed / duration) * 100)
            setRecordProgress(prog)
            if (prog >= 100 || mediaRecorderRef.current?.state === 'inactive') {
                stopRecording()
                clearInterval(interval)
            }
        }, 100)
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            audioRef.current?.pause()
            setIsPlaying(false)
        }
    }

    // 🛡️ LOGO_PRELOAD_SYSTEM
    useEffect(() => {
        const img = new (window.Image || (window as any).Image)()
        // Use a cache breaker and a clean name
        img.src = `/site-identity.png?v=${Date.now()}`
        img.onload = () => {
            console.log('✅ PROMO_GEN :: Logo signal LOCKED and ready.')
            logoRef.current = img
            setIsLogoLoaded(true)
        }
        img.onerror = () => {
            console.error('❌ PROMO_GEN :: Logo signal FAIL. Background resource unreachable.', {
                attemptedPath: img.src
            })
            setIsLogoLoaded(false)
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        }
    }, [])

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* 🧬 HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-black/40 p-10 border-l-8 border-studio-neon">
                <div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon mb-4">
                        <Video className="h-4 w-4" /> Studio_Automation :: PROMO_GEN_v1
                    </div>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Social<br/>_<span className="text-studio-neon">Video_Engine</span></h2>
                </div>
                
                <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/10 group-focus-within:text-studio-neon transition-colors" />
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SELECT_AUDIO_SIGNAL_FOR_GENERATION..." 
                        className="w-full bg-black/60 border-2 border-white/5 p-6 pl-16 font-black uppercase tracking-widest text-xs focus:border-studio-neon outline-none transition-all placeholder:text-white/5" 
                    />
                    {isSearching && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-studio-neon animate-spin" />}
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* 🎹 SEARCH RESULTS & SELECTION */}
                <div className="lg:col-span-4 space-y-6 max-h-[720px] overflow-y-auto pr-4 custom-scrollbar">
                    {searchResults.length > 0 ? (
                        searchResults.map(sample => (
                            <div 
                                key={sample.id}
                                onClick={() => setSelectedSample(sample)}
                                className={`p-8 border-2 transition-all cursor-pointer group ${selectedSample?.id === sample.id ? 'bg-studio-neon/10 border-studio-neon' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-sm ${selectedSample?.id === sample.id ? 'bg-studio-neon text-black' : 'bg-white/5 text-white/20'}`}>
                                        <Music size={16} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{sample.sample_packs?.name}</div>
                                        <div className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em] font-mono">{sample.id.slice(0, 8)}</div>
                                    </div>
                                </div>
                                <h4 className={`text-xl font-black italic tracking-tighter uppercase transition-colors ${selectedSample?.id === sample.id ? 'text-studio-neon' : 'text-white'}`}>{sample.name}</h4>
                                <div className="flex gap-4 mt-6">
                                    <span className="text-[9px] font-black uppercase bg-black px-3 py-1 border border-white/5 text-white/40">{sample.bpm} BPM</span>
                                    <span className="text-[9px] font-black uppercase bg-black px-3 py-1 border border-white/5 text-studio-neon">{sample.key}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 opacity-20 p-20 text-center">
                            <Layers size={48} className="mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Waiting for Signal</p>
                        </div>
                    )}
                </div>

                {/* 🚀 VIDEO PREVIEW & RENDERING */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="relative aspect-video bg-black border-4 border-black shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <canvas 
                            ref={canvasRef} 
                            width={1280} 
                            height={720} 
                            className="w-full h-full object-contain"
                        />
                        
                        {!selectedSample && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 pointer-events-none">
                                <Disc className="w-32 h-32 text-studio-neon mb-8 animate-spin-slow opacity-20" />
                                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20 italic">Select Signal to Calibrate Engine</div>
                            </div>
                        )}

                        {isRecording && (
                            <div className="absolute top-8 left-8 flex items-center gap-4 bg-spider-red px-6 py-2 rounded-full animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                                <div className="w-3 h-3 bg-white rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">REC :: EXPORTING_NODE</span>
                            </div>
                        )}
                        
                        {isRecording && (
                             <div className="absolute bottom-0 left-0 h-2 bg-studio-neon transition-all duration-300" style={{ width: `${recordProgress}%` }} />
                        )}
                    </div>

                    <div className="bg-studio-grey/40 border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8 w-full md:w-auto">
                            <button 
                                onClick={togglePlay}
                                disabled={!selectedSample || audioStatus === 'LOADING'}
                                className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${
                                    isPlaying ? 'bg-studio-neon text-black' : 'bg-white text-black hover:bg-studio-neon'
                                } disabled:opacity-20`}
                            >
                                {audioStatus === 'LOADING' ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : isPlaying ? (
                                    <Pause size={24} fill="currentColor" />
                                ) : (
                                    <Play size={24} fill="currentColor" className="ml-1" />
                                )}
                            </button>
                            
                            {selectedSample ? (
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1 italic">Audio Stream</span>
                                    <span className="text-lg font-black italic tracking-tighter uppercase text-white line-clamp-1">{selectedSample.name}</span>
                                </div>
                            ) : (
                                <div className="text-[10px] font-black uppercase text-white/10 tracking-[0.2em] italic">No Signal Active</div>
                            )}

                            {/* 📤 CUSTOM_COVER_UPLINK */}
                            <div className="md:ml-4 flex items-center gap-4 border-l border-white/10 pl-8">
                                <label className="flex items-center gap-3 cursor-pointer group bg-white/5 hover:bg-white/10 px-6 py-4 rounded-xl transition-all border border-dashed border-white/10">
                                    <Layers className="h-4 w-4 text-studio-neon group-hover:scale-125 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Override Cover</span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = URL.createObjectURL(file);
                                                const img = new (window.Image || (window as any).Image)();
                                                img.src = url;
                                                img.onload = () => setCoverImg(img);
                                                console.log('✅ PROMO_GEN :: Custom artwork signal injected.');
                                            }
                                        }} 
                                    />
                                </label>
                            </div>
                        </div>

                        {isRecording ? (
                            <button 
                                onClick={() => mediaRecorderRef.current?.stop()}
                                className="px-8 py-5 bg-spider-red text-white font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 hover:invert transition-all flex-1 md:flex-none animate-pulse"
                            >
                                Stop Rendering
                            </button>
                        ) : (
                            <button 
                                onClick={startRecording}
                                disabled={!selectedSample || isRecording}
                                className="flex-1 md:flex-none px-12 py-5 bg-studio-neon text-black font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 hover:invert transition-all shadow-xl disabled:opacity-20"
                            >
                                <Video className="h-4 w-4" /> 1080P FULL HD EXPORT
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 🧬 ASSETS (Hidden) */}
            <div className="hidden">
                 {selectedSample && (
                     <audio 
                        ref={audioRef} 
                        crossOrigin="anonymous" 
                        onPlay={() => console.log('🔊 PROMO_GEN :: Audio stream active.')}
                        onEnded={() => setIsPlaying(false)}
                        onError={(e) => {
                            const err = (e.target as HTMLAudioElement).error;
                            console.error('❌ PROMO_GEN :: Audio signal CRITICAL_FAILURE.', {
                                code: err?.code,
                                message: err?.message
                            });
                            setAudioStatus('ERROR');
                        }}
                     />
                 )}
            </div>
        </div>
    )
}
