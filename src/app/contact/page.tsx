'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
    Mail, Send, Cpu, Zap, Disc, ArrowLeft, Loader2,
    MessageSquare, Globe, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContactPage() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [systemTime, setSystemTime] = useState('')
  const [vizHeights, setVizHeights] = useState<number[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
        setSystemTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    
    // Initialize viz heights on client
    setVizHeights([...Array(16)].map(() => Math.random() * 100))
    
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    // Simulate API call
    setTimeout(() => {
        setSuccess(true)
        setIsPending(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-mono text-left">
      {/* 🏁 SCANLINE & GRID OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 scanline-bg" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.02] pointer-events-none" />
      
      {/* DAW Interface Decoration */}
      <div className="absolute top-10 left-10 hidden xl:flex flex-col gap-6 opacity-20">
         <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em]">
            <Cpu size={14} className="text-studio-neon" />
            <span>COMM_LINK: ACTIVE</span>
            <span className="text-white/20">::</span>
            <span className="text-studio-neon animate-pulse">{systemTime}</span>
         </div>
         <div className="flex gap-1 h-32 items-end">
            {vizHeights.length > 0 && vizHeights.map((h, i) => (
                <div 
                    key={i} 
                    className="w-1 bg-studio-neon/20 h-full"
                    style={{ height: `${h}%` }}
                />
            ))}
         </div>
      </div>

      <div className="flex-1 flex items-center justify-center container mx-auto px-4 py-12 relative z-10">
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
        >
          {/* Main DAW Module Frame */}
          <div className="border-4 border-black bg-[#0a0a0a] shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
            {/* Top Bar / Handle */}
            <div className="bg-black p-4 flex justify-between items-center border-b-2 border-white/5">
                <div className="flex gap-2">
                    <Link href="/" className="hover:opacity-60 transition-opacity">
                        <ArrowLeft className="h-4 w-4 text-white/40" />
                    </Link>
                    <div className="w-2.5 h-2.5 border border-white/20 rounded-none ml-2" />
                    <div className="w-2.5 h-2.5 border border-white/20 rounded-none" />
                    <div className="w-2.5 h-2.5 border border-white/20 rounded-none" />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 italic">SUPPORT MODULE // COMMS</span>
                </div>
            </div>

            <div className="p-8 md:p-12">
                {/* Header Section */}
                <div className="mb-10 flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="absolute -inset-4 bg-studio-neon/5 blur-3xl rounded-full" />
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="w-20 h-20 bg-black border-2 border-white/10 flex items-center justify-center relative shadow-[0_0_40px_rgba(255,255,255,0.02)] transition-all duration-700 group cursor-pointer"
                        >
                           <Image 
                                src="/Logo.png" 
                                alt="Samples Wala Logo" 
                                width={40} 
                                height={40} 
                                className="group-hover:scale-110 transition-transform brightness-0 invert opacity-40 group-hover:opacity-100"
                           />
                           <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-studio-neon/30" />
                           <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-studio-neon/30" />
                        </motion.div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">DIRECT TRANSMISSION</span>
                        <div className="flex items-center gap-4">
                            <Image 
                                src="/Logo.png" 
                                alt="Logo" 
                                width={32} 
                                height={32} 
                                className="brightness-0 invert shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            />
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
                                <span className="text-studio-neon vibe-glow">CONTACT US.</span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* 🌈 CONTACT FORM */}
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12 space-y-6"
                        >
                            <div className="w-16 h-16 bg-studio-neon/10 border-2 border-studio-neon mx-auto flex items-center justify-center">
                                <Sparkles className="text-studio-neon h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight italic">SIGNAL RECEIVED.</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 leading-relaxed max-w-[200px] mx-auto">
                                    Our support agents will respond within 24 hours.
                                </p>
                            </div>
                            <button 
                                onClick={() => setSuccess(false)}
                                className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon hover:text-white transition-colors underline underline-offset-8"
                            >
                                SEND ANOTHER SIGNAL
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Return Pipeline */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">01 // NAME</label>
                                </div>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        placeholder="YOUR NAME" 
                                        className="w-full pl-6 pr-6 py-5 bg-black/40 border-2 border-white/5 rounded-none focus:border-studio-neon focus:bg-studio-neon/5 transition-all outline-none text-[12px] font-black uppercase tracking-[0.1em] placeholder:text-white/10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Return Email */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">02 // EMAIL</label>
                                </div>
                                <div className="relative group">
                                    <input 
                                        type="email" 
                                        placeholder="YOUR@EMAIL.COM" 
                                        className="w-full pl-6 pr-6 py-5 bg-black/40 border-2 border-white/5 rounded-none focus:border-studio-neon focus:bg-studio-neon/5 transition-all outline-none text-[12px] font-black uppercase tracking-[0.1em] placeholder:text-white/10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">03 // MESSAGE</label>
                                </div>
                                <div className="relative group">
                                    <textarea 
                                        rows={4}
                                        placeholder="ENTER YOUR BROADCAST..." 
                                        className="w-full pl-6 pr-6 py-5 bg-black/40 border-2 border-white/5 rounded-none focus:border-studio-neon focus:bg-studio-neon/5 transition-all outline-none text-[12px] font-black uppercase tracking-[0.1em] placeholder:text-white/10 resize-none"
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isPending}
                                className="w-full py-6 bg-studio-neon text-black font-black uppercase tracking-[0.4em] text-[13px] flex items-center justify-center gap-6 hover:bg-white hover:text-black transition-all duration-500 group relative overflow-hidden mt-8"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin text-black" />
                                        <span>SENDING...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        <span>SEND SIGNAL</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </AnimatePresence>

                {/* Direct Pipeline Info */}
                <div className="mt-12 pt-8 border-t border-white/5 space-y-6 text-center">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 block">OFFICIAL PIPELINE</span>
                        <a href="mailto:contact@sampleswala.com" className="text-xs font-black uppercase tracking-widest text-white hover:text-studio-neon transition-colors underline underline-offset-8 decoration-white/10">
                            contact@sampleswala.com
                        </a>
                    </div>
                </div>
            </div>
            
            {/* DAW Status Bar */}
            <div className="bg-black p-4 border-t-2 border-white/5 flex justify-between items-center px-8">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-studio-neon rounded-full animate-pulse shadow-[0_0_5px_#a6e22e]" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 tracking-widest">SIGNAL STABLE</span>
                </div>
                <div className="hidden md:flex gap-6 opacity-30 items-center">
                    <Globe className="w-4 h-4 text-white" />
                    <Disc className="w-4 h-4 text-white animate-spin-slow" />
                </div>
            </div>
          </div>

          {/* Exterior Info */}
          <div className="mt-8 flex justify-between items-center px-6 opacity-20 text-[9px] font-black uppercase tracking-[0.6em] italic">
             <div className="flex items-center gap-4">
                <Zap size={14} className="text-studio-neon" />
                <span>POWERED BY SAMPLES WALA</span>
             </div>
             <span>Mumbai, India</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
