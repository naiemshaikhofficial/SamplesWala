'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
    ShieldCheck, Eye, Lock, Globe, ArrowLeft, Mail, Database,
    Activity, Disc, Zap, ShieldAlert
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrivacyClient() {
    const [systemTime, setSystemTime] = useState('')

    useEffect(() => {
        const timer = setInterval(() => {
            setSystemTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const dataSections = [
        { t: '01 // YOUR_INFO', h: 'What we collect', d: 'WE ONLY COLLECT YOUR NAME AND EMAIL TO MAKE SURE YOU CAN ACCESS YOUR DOWNLOADS. WE DON\'T ASK FOR ANYTHING WE DON\'T NEED.' },
        { t: '02 // PAYMENTS', h: 'Safe Payments', d: 'WE NEVER SEE OR STORE YOUR CREDIT CARD DETAILS. ALL PAYMENTS ARE HANDLED SECURELY BY RAZORPAY OR PAYPAL.' },
        { t: '03 // ACTIVITY', h: 'Why we collect it', d: 'WE LOOK AT WHAT SOUNDS ARE POPULAR SO WE CAN RECOMMEND BETTER PACKS TO YOU. YOUR DATA IS NEVER SOLD TO ANYONE.' },
        { t: '04 // SECURITY', h: 'Data Protection', d: 'YOUR ACCOUNT IS PROTECTED WITH INDUSTRY-STANDARD ENCRYPTION. WE KEEP YOUR FILES AND SUBSCRIPTION DETAILS SECURE 24/7.' }
    ]

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-mono text-left">
            {/* 🏁 SCANLINE & GRID OVERLAY */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 scanline-bg" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.02] pointer-events-none" />
            
            {/* DAW Interface Decoration */}
            <div className="absolute top-10 left-10 hidden xl:flex flex-col gap-6 opacity-20">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em]">
                    <ShieldCheck size={14} className="text-studio-neon" />
                    <span>PRIVACY_VAULT: PROTECTED</span>
                    <span className="text-white/20">::</span>
                    <span className="text-studio-neon animate-pulse">{systemTime}</span>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center container mx-auto px-4 py-24 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-4xl"
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
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 italic">DATA SAFETY PROTOCOL // v1.0</span>
                            </div>
                        </div>

                        <div className="p-8 md:p-16">
                            {/* Header Section */}
                            <div className="mb-20 flex flex-col items-center">
                                <div className="relative mb-8 text-studio-neon">
                                    <div className="w-20 h-20 bg-black border-2 border-white/10 flex items-center justify-center relative group">
                                        <Image 
                                            src="/Logo.png" 
                                            alt="Logo" 
                                            width={40} 
                                            height={40} 
                                            className="brightness-0 invert opacity-40 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                </div>
                                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-none text-center">
                                    DATA <span className="text-studio-neon vibe-glow">PRIVACY.</span>
                                </h1>
                            </div>

                            {/* Core Info Registry */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                                {dataSections.map((section, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={i} 
                                        className="p-10 border border-white/5 bg-white/[0.01] space-y-6 hover:border-studio-neon/20 transition-all"
                                    >
                                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{section.t}</div>
                                        <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white/60">{section.h}</h4>
                                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] leading-relaxed italic">
                                            {section.d}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Safety Banner */}
                            <div className="p-12 border-2 border-studio-neon/10 bg-studio-neon/[0.02] flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
                                <div className="h-16 w-16 flex-shrink-0 border-2 border-studio-neon flex items-center justify-center relative z-10 text-studio-neon">
                                    <Lock className="h-8 w-8" />
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">YOUR DATA IS SECURE</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed opacity-60 italic">
                                        WE USE WORLD-CLASS SECURITY TO MAKE SURE YOUR ACCOUNT AND PAYMENTS ARE ALWAYS SAFE. WE RESPECT YOUR PRIVACY AS MUCH AS YOUR SOUNDS.
                                    </p>
                                </div>
                            </div>

                            {/* Contact Redirect */}
                            <div className="mt-20 border-t-2 border-white/5 pt-12 text-center space-y-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 leading-relaxed max-w-lg mx-auto italic">
                                    IF YOU WANT TO DELETE YOUR ACCOUNT OR HAVE QUESTIONS ABOUT YOUR DATA, SEND US A MESSAGE.
                                </p>
                                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                                    <Link href="mailto:privacy@sampleswala.com" className="w-full md:w-auto px-16 py-6 border-2 border-white group relative hover:border-studio-neon transition-all overflow-hidden bg-white text-black font-black uppercase tracking-[0.4em] text-[11px]">
                                        <div className="absolute inset-0 bg-studio-neon translate-y-full group-hover:translate-y-0 transition-transform" />
                                        <span className="relative z-10 group-hover:text-white flex items-center gap-4">
                                            <Mail size={14} /> Contact Privacy Team
                                        </span>
                                    </Link>
                                    <Link href="/contact" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors italic underline underline-offset-8 decoration-white/10">
                                        GENERAL SUPPORT
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        {/* Status Bar */}
                        <div className="bg-black p-4 border-t-2 border-white/5 flex justify-between items-center px-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                            <div className="flex items-center gap-4">
                                <Activity size={14} className="text-studio-neon" />
                                <span>SSL ENCRYPTION: ACTIVE // AES-256</span>
                            </div>
                            <div className="hidden md:flex gap-6 opacity-30 items-center">
                                <Disc className="w-4 h-4 text-white animate-spin-slow" />
                            </div>
                        </div>
                    </div>

                    {/* Exterior Info */}
                    <div className="mt-8 flex justify-between items-center px-6 opacity-20 text-[9px] font-black uppercase tracking-[0.6em] italic">
                         <div className="flex items-center gap-4">
                            <Zap size={14} className="text-studio-neon" />
                            <span>SAMPLES WALA PRIVACY TERMINAL</span>
                         </div>
                         <span>© 2026 // INDIA-GLOBAL</span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
