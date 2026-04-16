'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
    FileText, ShieldCheck, Scale, Globe, ArrowLeft, Mail, Gavel,
    Cpu, Zap, Disc, Activity
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function TermsPage() {
    const [systemTime, setSystemTime] = useState('')

    useEffect(() => {
        const timer = setInterval(() => {
            setSystemTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const registrySections = [
        {
            t: '01 // PAYMENTS_&_BILLING',
            title: 'Membership & Payments',
            d: 'BY SIGNING UP FOR A SUBSCRIPTION, YOU AGREE TO LET SAMPLES WALA CHARGE YOUR PAYMENT METHOD AUTOMATICALLY EVERY MONTH (OR YEAR). YOUR PLAN WILL RENEW UNLESS YOU CANCEL AT LEAST 24 HOURS BEFORE THE NEXT BILLING DATE. CREDITS HAVE NO CASH VALUE AND CAN ONLY BE USED ON OUR SITE.'
        },
        {
            t: '02 // YOUR_RIGHTS',
            title: 'Sound Ownership',
            desc: 'ALL SOUNDS, DESIGNS, AND CODE ON THIS WEBSITE BELONG TO SAMPLES WALA. WHEN YOU SPEND CREDITS, WE GIVE YOU A PERMANENT LICENSE TO USE THOSE SOUNDS IN YOUR OWN MUSIC PROJECTS. YOU CANNOT RESELL THE INDIVIDUAL SOUNDS OR PACKS AS YOUR OWN WORK.'
        },
        {
            t: '03 // ACCOUNT_RULES',
            title: 'Account Rules',
            desc: 'WE RESERVE THE RIGHT TO CLOSE YOUR ACCOUNT IF YOU TRY TO HACK OUR SYSTEM, BYPASS SECURITY, OR DISTRIBUTE OUR SOUNDS ILLEGALLY. BE RESPECTFUL AND USE THE PLATFORM AS INTENDED.'
        },
        {
            t: '04 // OUR_RESPONSIBILITY',
            title: 'Limitation of Liability',
            desc: 'SAMPLES WALA IS NOT RESPONSIBLE IF OUR SOUNDS CAUSE ANY ISSUES WITH YOUR COMPUTER OR PROJECTS. YOU USE OUR SERVICE AT YOUR OWN RISK. WE DO OUR BEST TO PROVIDE TOP-QUALITY SIGNALS, BUT WE CANNOT GUARANTEE 100% UPTIME.'
        }
    ]

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-mono text-left">
            {/* 🏁 SCANLINE & GRID OVERLAY */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 scanline-bg" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.02] pointer-events-none" />
            
            {/* DAW Interface Decoration */}
            <div className="absolute top-10 left-10 hidden xl:flex flex-col gap-6 opacity-20">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em]">
                    <Activity size={14} className="text-studio-neon" />
                    <span>LEGAL_VAULT: TERMS</span>
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
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 italic">LEGAL RULES // v2.6</span>
                            </div>
                        </div>

                        <div className="p-8 md:p-16">
                            {/* Header Section */}
                            <div className="mb-20 flex flex-col items-center">
                                <div className="relative mb-8">
                                    <div className="w-20 h-20 bg-black border-2 border-white/10 flex items-center justify-center relative shadow-[0_0_40px_rgba(255,255,255,0.02)] group">
                                        <Image 
                                            src="/Logo.png" 
                                            alt="Logo" 
                                            width={40} 
                                            height={40} 
                                            className="brightness-0 invert opacity-40 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-studio-neon/30" />
                                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-studio-neon/30" />
                                    </div>
                                </div>
                                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-none text-center">
                                    OUR <span className="text-studio-neon vibe-glow">RULES.</span>
                                </h1>
                            </div>

                            {/* Registry Content */}
                            <div className="grid grid-cols-1 gap-12">
                                {registrySections.map((section, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={i} 
                                        className="p-10 bg-white/[0.01] border border-white/10 relative group hover:border-studio-neon/40 transition-all"
                                    >
                                        <div className="absolute top-4 right-6 text-[10px] font-black text-white/20 uppercase tracking-widest">{section.t}</div>
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                                                <div className="w-2 h-8 bg-studio-neon/40" />
                                                {section.title}
                                            </h3>
                                            <p className="text-xs text-white/30 font-black uppercase tracking-[0.2em] leading-relaxed max-w-2xl italic">
                                                {section.d || section.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Compliance Section */}
                            <div className="mt-20 p-12 bg-studio-neon text-black flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
                                <div className="absolute right-0 bottom-0 opacity-10 rotate-12 scale-150 pointer-events-none">
                                    <Gavel size={200} />
                                </div>
                                <div className="h-20 w-20 flex-shrink-0 border-2 border-black flex items-center justify-center relative z-10">
                                    <ShieldCheck className="h-10 w-10" />
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">AGREEMENT</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed opacity-60 italic">
                                        BY USING OUR SERVICE AND DOWNLOADING SOUNDS, YOU AGREE TO FOLLOW THESE SIMPLE RULES. BREAKING THEM MAY LEAD TO ACCOUNT CLOSURE.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* DAW Status Bar */}
                        <div className="bg-black p-4 border-t-2 border-white/5 flex justify-between items-center px-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                            <div className="flex items-center gap-4">
                                <Scale size={14} className="text-studio-neon" />
                                <span>LEGAL LOCATION: MUMBAI, INDIA</span>
                            </div>
                            <div className="hidden md:flex gap-6 opacity-30 items-center">
                                <span>UPDATED: 16 APR 2026</span>
                                <Disc className="w-4 h-4 text-white animate-spin-slow" />
                            </div>
                        </div>
                    </div>

                    {/* Exterior Info */}
                    <div className="mt-8 flex justify-between items-center px-6 opacity-20 text-[9px] font-black uppercase tracking-[0.6em] italic">
                         <div className="flex items-center gap-4">
                            <Zap size={14} className="text-studio-neon" />
                            <span>SAMPLES WALA RULES PANEL</span>
                         </div>
                         <a href="mailto:legal@sampleswala.com" className="hover:text-white transition-colors">LEGAL@SAMPLESWALA.COM</a>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
