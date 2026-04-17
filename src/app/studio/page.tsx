'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wand2, 
  Download, 
  Play, 
  Square, 
  RefreshCcw, 
  ChevronRight,
  Cpu,
  Zap,
  ShieldCheck,
  Disc
} from 'lucide-react'
import { AI_FORGE_PRESETS } from '@/lib/ai/prompts'
import { ForgeVisualizer, ForgeStatusBadge } from '@/components/studio/ForgeVisualizer'
import { MODELS } from '@/lib/ai/hf-studio'

export default function AIForgePage() {
  const [prompt, setPrompt] = useState('')
  const [isForging, setIsForging] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [status, setStatus] = useState('Standby')
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS.MUSIC)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleForge = async () => {
    if (!prompt) return
    
    setIsForging(true)
    setStatus('Syncing with Meta AudioCraft...')
    setGeneratedAudio(null)
    
    try {
      const response = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: selectedModel }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Forging failed')
      }

      setStatus('Decoding Neural Signal...')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setGeneratedAudio(url)
      setStatus('Success: Sample Ready')
    } catch (error: any) {
      console.error(error)
      setStatus(`Error: ${error.message}`)
    } finally {
      setIsForging(false)
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                Unlimited Edition
              </div>
              <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">
                Powered by Meta AudioCraft
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                AI <span className="text-zinc-600">FORGE</span>
            </h1>
          </div>
          <ForgeStatusBadge status={status} />
        </header>

        <div className="grid lg:grid-cols-[1fr,350px] gap-8">
          
          {/* Main Lab Area */}
          <main className="space-y-6">
            
            {/* The Visualizer */}
            <ForgeVisualizer isGenerating={isForging} />

            {/* Input Module */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-zinc-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Neural Prompt Input</span>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Dark industrial techno kick loop, distorted, 140bpm..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm focus:ring-1 focus:ring-white/20 focus:border-white/20 outline-none min-h-[120px] transition-all"
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setSelectedModel(MODELS.MUSIC)}
                        className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${selectedModel === MODELS.MUSIC ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        MusicGen
                    </button>
                    <button 
                         onClick={() => setSelectedModel(MODELS.SFX)}
                         className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${selectedModel === MODELS.SFX ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        AudioGen
                    </button>
                </div>

                <button
                  onClick={handleForge}
                  disabled={isForging || !prompt}
                  className="group relative flex items-center justify-center gap-3 bg-white text-black px-8 py-3 rounded-md font-black uppercase text-xs tracking-widest hover:bg-zinc-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isForging ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      Forging...
                    </>
                  ) : (
                    <>
                      Forge Sample
                      <Zap className="w-4 h-4 fill-black" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Result Module */}
            <AnimatePresence>
                {generatedAudio && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-xl flex items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={togglePlayback}
                                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                            >
                                {isPlaying ? <Square className="fill-white w-4 h-4" /> : <Play className="fill-white w-4 h-4 ml-1" />}
                            </button>
                            <div>
                                <div className="text-black font-black uppercase text-sm tracking-tight">Generated Signal 0x{Math.random().toString(16).slice(2, 6).toUpperCase()}</div>
                                <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">44.1kHz / 32-Bit Float</div>
                            </div>
                        </div>

                        <a 
                            href={generatedAudio} 
                            download="ai-forged-sample.wav"
                            className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold uppercase flex items-center gap-2 hover:opacity-90 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </a>

                        <audio 
                            ref={audioRef} 
                            src={generatedAudio} 
                            onEnded={() => setIsPlaying(false)} 
                            className="hidden" 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
          </main>

          {/* Sidebar / Presets Area */}
          <aside className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-4 h-4 text-zinc-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Viral Presets</span>
              </div>

              <div className="space-y-3">
                {AI_FORGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setPrompt(preset.prompt)}
                    className="w-full text-left p-3 rounded-lg border border-zinc-800 hover:border-zinc-500 bg-zinc-950 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                        <span className="text-lg">{preset.icon}</span>
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase tracking-tight group-hover:text-white transition-colors">{preset.name}</div>
                            <div className="text-[9px] text-zinc-600 line-clamp-1 font-mono uppercase">{preset.prompt}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Disc className="w-20 h-20 animate-[spin_4s_linear_infinite]" />
                </div>
                <h3 className="text-xs font-black uppercase mb-2 tracking-widest">Copyright Free</h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                    All samples generated in the AI Forge are 100% royalty-free. You can use them in your commercial projects without any license fees.
                </p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
