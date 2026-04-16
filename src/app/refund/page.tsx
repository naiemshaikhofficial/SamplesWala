'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
    ShieldAlert, CreditCard, Mail, Globe, ArrowLeft, Zap,
    Cpu, Disc, Activity, Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function RefundPage() {
    const [systemTime, setSystemTime] = useState('')

    useEffect(() => {
        const timer = setInterval(() => {
            setSystemTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const refundSteps = [
        { t: '01 // REPORT_ISSUE', h: 'Broken Sound', d: 'IF A FILE YOU DOWNLOADED IS CORRUPT OR DOESN\'T WORK, SEND US A SCREENSHOT OR THE ERROR MESSAGE.' },
        { t: '02 // TEAM_REVIEW', h: 'System Check', d: 'OUR TEAM WILL CHECK OUR RECORDS TO SEE IF THE ERROR WAS CAUSED BY OUR SYSTEM.' },
        { t: '03 // FIX_OR_REFUND', h: 'Resolution', d: 'IF THE FILE IS DAMAGED, WE WILL FIX IT FOR YOU. IF WE CAN\'T FIX IT, WE WILL GIVE YOUR CREDITS BACK.' }
    ]

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-mono text-left">
            {/* 🏁 SCANLINE & GRID OVERLAY */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 scanline-bg" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.02] pointer-events-none" />
            
            {/* DAW Interface Decoration */}
            <div className="absolute top-10 left-10 hidden xl:flex flex-col gap-6 opacity-20">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em]">
                    <ShieldAlert size={14} className="text-spider-red" />
                    <span>REFUND_SYSTEM: ONLINE</span>
                    <span className="text-white/20">::</span>
                    <span className="text-spider-red animate-pulse">{systemTime}</span>
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
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 italic">MONEY RULES // REF-01</span>
                            </div>
                        </div>

                        <div className="p-8 md:p-16">
                            {/* Header Section */}
                            <div className="mb-20 flex flex-col items-center">
                                <div className="relative mb-8 text-spider-red">
                                    <ShieldAlert size={80} className="opacity-20 absolute -inset-2 blur-2xl" />
                                    <div className="w-20 h-20 bg-black border-2 border-spider-red/20 flex items-center justify-center relative group">
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
                                    REFUND <span className="text-spider-red vibe-glow-red">POLICY.</span>
                                </h1>
                            </div>

                            {/* Core Policy Registry */}
                            <div className="space-y-12 mb-20">
                                <div className="p-10 border-2 border-spider-red/10 bg-spider-red/[0.02] space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <ShieldAlert size={120} />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-4 text-spider-red">
                                        <div className="w-2 h-10 bg-spider-red/40" />
                                        SALES ARE FINAL
                                    </h3>
                                    <p className="text-xs text-white/40 font-black uppercase tracking-[0.2em] leading-loose italic max-w-3xl">
                                        BECAUSE DIGITAL SOUNDS CANNOT BE "RETURNED" ONCE THEY ARE DOWNLOADED, WE DO NOT OFFER REFUNDS ON COMPLETED TRANSACTIONS. ONCE YOU CLICK DOWNLOAD AND USE YOUR CREDITS, THE SALE IS FINAL. THIS HELPS US ENSURE THAT THE MUSICIANS WHO CREATED THE CONTENT ARE FAIRLY COMPENSATED.
                                    </p>
                                </div>
                            </div>

                            {/* Process Steps */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                                {refundSteps.map((step, i) => (
                                    <div key={i} className="p-8 bg-black border border-white/5 space-y-4 hover:border-white/20 transition-all">
                                        <div className="text-[10px] font-black text-white/10 uppercase tracking-widest">{step.t}</div>
                                        <h4 className="text-sm font-black uppercase italic tracking-widest text-white/60">{step.h}</h4>
                                        <p className="text-[9px] text-white/30 leading-relaxed uppercase tracking-wider italic">
                                            {step.d}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Contact Redirect */}
                            <div className="border-t-2 border-white/5 pt-12 text-center space-y-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 leading-relaxed max-w-lg mx-auto italic">
                                    IF YOU HAVE A PROBLEM WITH A DAMAGED FILE, PLEASE CONTACT OUR SUPPORT TEAM SO WE CAN ASSIST YOU.
                                </p>
                                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                                    <Link href="mailto:support@sampleswala.com" className="w-full md:w-auto px-16 py-6 border-2 border-white group relative hover:border-spider-red transition-all overflow-hidden bg-white text-black font-black uppercase tracking-[0.4em] text-[11px]">
                                        <div className="absolute inset-0 bg-spider-red translate-y-full group-hover:translate-y-0 transition-transform" />
                                        <span className="relative z-10 group-hover:text-white flex items-center gap-4">
                                            <Mail size={14} /> Contact Support Team
                                        </span>
                                    </Link>
                                    <Link href="/faq" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors italic underline underline-offset-8 decoration-white/10">
                                        READ THE FAQ
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        {/* Status Bar */}
                        <div className="bg-black p-4 border-t-2 border-white/5 flex justify-between items-center px-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                            <div className="flex items-center gap-4">
                                <Activity size={14} className="text-spider-red" />
                                <span>FINANCIAL PROTOCOL: SECURE</span>
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
                            <span>SAMPLES WALA REFUND DESK</span>
                         </div>
                         <span>© 2026 // SIMPLE CLEAR TERMS</span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
