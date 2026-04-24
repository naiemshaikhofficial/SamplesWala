'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Music, Zap, Sparkles } from 'lucide-react'

export default function VerifySuccessPage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center py-20 px-4 relative overflow-hidden">
            {/* 🌈 AMBIENT BACKGROUND GLOWS */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-studio-neon/5 blur-[200px] rounded-full animate-pulse" />
            
            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl p-10 md:p-12 rounded-[40px] shadow-2xl text-center space-y-8 overflow-hidden">
                    {/* ✅ SUCCESS ICON */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-studio-neon blur-2xl opacity-20 animate-pulse" />
                            <div className="relative h-20 w-20 bg-studio-neon rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(166,226,46,0.3)]">
                                <CheckCircle2 className="h-10 w-10 text-black" strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    {/* 📝 MESSAGE */}
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
                            Verified!
                        </h1>
                        <p className="text-white/40 text-sm font-bold leading-relaxed">
                            Your account is now active. <br/>
                            You can login and start exploring samples.
                        </p>
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* 🎮 ACTION BUTTON */}
                    <div className="flex flex-col gap-4">
                        <Link 
                            href="/auth/login"
                            className="w-full bg-studio-neon text-black px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(166,226,46,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-3 group"
                        >
                            <span>Login Now</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* 🌟 FOOTER NOTE */}
                    <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">
                        Welcome to the community
                    </p>
                </div>
            </div>
        </div>
    )
}
