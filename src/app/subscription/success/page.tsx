'use client'

import React, { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, Package, Zap, Sparkles, Music, Star, Download } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const mode = searchParams.get('mode') || 'subscription'
    const itemId = searchParams.get('itemId')
    const cycle = searchParams.get('cycle') || 'MONTHLY'

    // In a real app, we might fetch the item name from an API or pass it in params
    // For now, let's make it look great with placeholders that feel real
    
    return (
        <div className="min-h-[80vh] flex items-center justify-center py-20 px-4">
            <div className="max-w-2xl w-full relative">
                {/* 🌈 AMBIENT BACKGROUND GLOWS */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-studio-neon/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-studio-yellow/5 rounded-full blur-[100px] animate-pulse delay-700" />

                <div className="relative bg-studio-grey/40 border border-white/5 backdrop-blur-3xl p-10 md:p-16 rounded-[40px] shadow-2xl text-center space-y-10 overflow-hidden">
                    {/* 🎭 DECORATIVE STRIPES */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-studio-neon to-transparent opacity-50" />
                    
                    {/* ✅ SUCCESS ICON */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-studio-neon blur-2xl opacity-20 animate-pulse" />
                            <div className="relative h-24 w-24 bg-studio-neon rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(166,226,46,0.3)]">
                                <CheckCircle2 className="h-12 w-12 text-black" strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    {/* 📝 THANK YOU MESSAGE */}
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                            You're All Set!
                        </h1>
                        <p className="text-studio-neon font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">
                            Payment Received • Account Updated
                        </p>
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* 📦 ORDER DETAILS CARD */}
                    <div className="bg-black/40 border border-white/10 p-8 rounded-3xl space-y-6 text-left relative group">
                        <div className="absolute top-4 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Package size={40} />
                        </div>
                        
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Your Purchase</span>
                            <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
                                {mode === 'subscription' ? 'Premium Plan' : mode === 'pack' ? 'Credit Pack' : 'Sample Pack'}
                                <Zap size={16} className="text-studio-yellow" />
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-studio-neon rounded-full animate-pulse" />
                                    <span className="text-xs font-bold text-white uppercase tracking-widest">Ready to use</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Access</span>
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Instant</span>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-3 text-[11px] font-bold text-white/50 bg-white/5 p-4 rounded-xl italic">
                            <Sparkles size={14} className="text-studio-neon" />
                            Your account is now upgraded. You can start downloading and using your samples right away.
                        </div>
                    </div>

                    {/* 🎮 ACTION BUTTONS */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        <Link 
                            href="/browse"
                            className="w-full md:w-auto bg-studio-neon text-black px-10 py-5 rounded-full font-black uppercase tracking-widest text-[11px] hover:shadow-[0_0_30px_rgba(166,226,46,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-3 group"
                        >
                            <span>Browse All Samples</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <Link 
                            href="/library"
                            className="w-full md:w-auto bg-white/5 border border-white/10 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                        >
                            <Music size={16} />
                            <span>My Vault</span>
                        </Link>
                    </div>

                    {/* 🌟 FOOTER NOTE */}
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                        Need help? Contact support@sampleswala.com
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function SubscriptionSuccessPage() {
    return (
        <div className="min-h-screen bg-studio-black relative overflow-hidden">
            {/* 🌌 STARS BACKGROUND */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-white rounded-full h-px w-px animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            <Suspense fallback={
                <div className="h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-studio-neon"></div>
                </div>
            }>
                <SuccessContent />
            </Suspense>
        </div>
    )
}
