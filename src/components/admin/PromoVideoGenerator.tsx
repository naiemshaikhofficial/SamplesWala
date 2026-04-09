'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Zap, Play, Pause, Download, Video, Music, Layers, Disc, Trash2, Loader2, Key as KeyIcon, Activity } from 'lucide-react'
import { searchSamplesAction } from '@/app/admin/actions'
import Image from 'next/image'

export default function PromoVideoGenerator() {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [selectedSample, setSelectedSample] = useState<any>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [recordProgress, setRecordProgress] = useState(0)
    
    // Canvas & Audio Refs
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    
    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<AudioBufferSourceNode | MediaElementAudioSourceNode | null>(null)
    const animationFrameRef = useRef<number | null>(null)

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

            // 1. Draw Background
            const gradient = ctx.createLinearGradient(0, 0, 0, height)
            gradient.addColorStop(0, '#0a0a0a')
            gradient.addColorStop(1, '#000000')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, width, height)

            // Dynamic background particles or glow
            const averageFreq = dataArray.reduce((prev, curr) => prev + curr) / bufferLength
            const bassFreq = dataArray[0] // Crude bass detection

            ctx.beginPath()
            const bgGlow = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8)
            bgGlow.addColorStop(0, `rgba(166, 226, 46, ${averageFreq / 500})`)
            bgGlow.addColorStop(1, 'transparent')
            ctx.fillStyle = bgGlow
            ctx.fillRect(0, 0, width, height)

            // 2. Draw Visualizer (Circular Bars)
            ctx.save()
            ctx.translate(width/2, height/2)
            
            const radius = 200 + (bassFreq / 5)
            const barCount = 64
            
            for (let i = 0; i < barCount; i++) {
                const angle = (i * 2 * Math.PI) / barCount
                const barHeight = (dataArray[i % bufferLength] / 255) * 150
                
                const x1 = radius * Math.cos(angle)
                const y1 = radius * Math.sin(angle)
                const x2 = (radius + barHeight) * Math.cos(angle)
                const y2 = (radius + barHeight) * Math.sin(angle)

                ctx.beginPath()
                ctx.strokeStyle = `hsla(${120 + i}, 80%, 60%, 0.8)`
                ctx.lineWidth = 4
                ctx.lineCap = 'round'
                ctx.moveTo(x1, y1)
                ctx.lineTo(x2, y2)
                ctx.stroke()
                
                // Outer glow per bar
                ctx.shadowBlur = 15
                ctx.shadowColor = `hsla(${120 + i}, 80%, 60%, 0.4)`
            }
            ctx.restore()

            // 3. Draw Logo (Pulsing)
            const logoSize = 180 + (bassFreq / 10)
            const logo = document.getElementById('promo-gen-logo') as HTMLImageElement
            if (logo && logo.complete) {
                ctx.save()
                ctx.translate(width/2, height/2)
                // ctx.rotate(Math.sin(Date.now() / 1000) * 0.05) // Subtle rotation
                ctx.drawImage(logo, -logoSize/2, -logoSize/2, logoSize, logoSize)
                ctx.restore()
            }

            // 4. Draw Text Overlays
            if (selectedSample) {
                ctx.textAlign = 'center'
                ctx.fillStyle = 'white'
                ctx.font = '900 64px Inter, sans-serif'
                ctx.fillText(selectedSample.name.toUpperCase(), width/2, height - 150)
                
                ctx.font = '900 24px Inter, sans-serif'
                ctx.fillStyle = '#a6e22e'
                ctx.letterSpacing = '10px'
                ctx.fillText(`${selectedSample.bpm || '--'} BPM // ${selectedSample.key || 'N/A'}`.toUpperCase(), width/2, height - 100)
                
                ctx.font = '400 16px monospace'
                ctx.fillStyle = 'rgba(255,255,255,0.4)'
                ctx.letterSpacing = '20px'
                ctx.fillText('SAMPLES WALA // EXCLUSIVE SIGNAL', width/2, height - 60)
            }
        }

        renderFrame()
    }

    const togglePlay = () => {
        if (!audioRef.current) return
        
        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume()
            }
            audioRef.current.play()
            setIsPlaying(true)
            initVisualizer()
        }
    }

    const startRecording = () => {
        if (!canvasRef.current || !audioRef.current || !audioContextRef.current || !analyserRef.current) return
        
        setIsRecording(true)
        setRecordProgress(0)
        chunksRef.current = []

        const canvasStream = canvasRef.current.captureStream(60)
        
        // Create a destination for the recorder
        const dest = audioContextRef.current.createMediaStreamDestination()
        
        // Connect the analyser to this destination
        analyserRef.current.connect(dest)
        
        // Build the combined stream
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
        ])

        const options = { mimeType: 'video/webm;codecs=vp9,opus' }
        mediaRecorderRef.current = new MediaRecorder(combinedStream, options)

        mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `PROMO_${selectedSample.name.replace(/\s+/g, '_')}.webm`
            a.click()
            setIsRecording(false)
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

    useEffect(() => {
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
                        <div className="flex items-center gap-8">
                            <button 
                                onClick={togglePlay}
                                disabled={!selectedSample}
                                className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-studio-neon text-black' : 'bg-white text-black hover:bg-studio-neon'} disabled:opacity-20`}
                            >
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>
                            
                            {selectedSample && (
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1 italic">Audio Stream</span>
                                    <span className="text-lg font-black italic tracking-tighter uppercase text-white">{selectedSample.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                            <button 
                                onClick={startRecording}
                                disabled={!selectedSample || isRecording}
                                className="flex-1 md:flex-none px-12 py-5 bg-studio-neon text-black font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 hover:invert transition-all shadow-xl disabled:opacity-20"
                            >
                                <Video className="h-4 w-4" /> Start Rendering
                            </button>
                            {isRecording && (
                                <button 
                                    onClick={stopRecording}
                                    className="px-8 py-5 bg-spider-red text-white font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 hover:invert transition-all"
                                >
                                    Stop
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 🧬 ASSETS (Hidden) */}
            <div className="hidden">
                 <img id="promo-gen-logo" src="/Logo.png" alt="Logo" crossOrigin="anonymous" />
                 {selectedSample && (
                     <audio 
                        ref={audioRef} 
                        src={selectedSample.audio_url} 
                        crossOrigin="anonymous" 
                        onEnded={() => setIsPlaying(false)}
                     />
                 )}
            </div>
        </div>
    )
}
