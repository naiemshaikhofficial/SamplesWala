import Link from 'next/link'
import { Globe, Zap, ShieldCheck, Music4, Disc, Target, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'About Samples Wala | The Ultimate Music Production Hub',
    description: 'Learn more about Samples Wala, the industry gold standard for music production tools, VST plugins, and royalty-free samples based in Mumbai, India.',
    alternates: {
        canonical: 'https://sampleswala.com/about'
    }
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20">
            
            {/* 🎰 THE MANIFESTO HEADER */}
            <header className="border-b border-white/10 px-6 md:px-20 py-48 bg-black">
                <div className="max-w-5xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-8 block font-mono">ESTABLISHED 2024 / MUMBAI PORTAL ACTIVE</span>
                    <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] italic italic mb-16">The Signal Provider.</h1>
                    <p className="text-2xl md:text-3xl text-white/40 leading-relaxed font-bold uppercase tracking-tight">
                        Samples Wala is a high-performance audio artifact marketplace designed for the modern production agent. We don't sell sounds. We provide the hit-making signal.
                    </p>
                </div>
            </header>

            <main className="px-6 md:px-20 py-24">
                
                {/* 🔌 1. THE VISION RACK */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-48">
                    <div className="p-12 border border-white/10 bg-white/[0.02] space-y-8 group hover:bg-white transition-all duration-700">
                        <Target className="h-8 w-8 text-white group-hover:text-black" />
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-black">The Mission</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-white/30 group-hover:text-black/40">
                            TO DEMOCRATIZE THE ACCESS TO HIGH-END PRODUCTION ARTIFACTS, ENSURING EVERY PRODUCER IN THE GLOBAL SIGNAL HAS THE GEAR TO CREATE HISTORY.
                        </p>
                    </div>
                    <div className="p-12 border border-white/10 bg-white/[0.02] space-y-8 group hover:bg-white transition-all duration-700">
                        <Zap className="h-8 w-8 text-white group-hover:text-black" />
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-black">The Speed</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-white/30 group-hover:text-black/40">
                            ELIMINATING FRICTION IN THE CREATIVE PIPELINE. INSTANT UNLOCKS. SECURE DOWNLOADS. NO BULLSH*T. JUST THE ART OF PRODUCTION.
                        </p>
                    </div>
                    <div className="p-12 border border-white/10 bg-white/[0.02] space-y-8 group hover:bg-white transition-all duration-700">
                        <ShieldCheck className="h-8 w-8 text-white group-hover:text-black" />
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-black">The Security</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-white/30 group-hover:text-black/40">
                            ALL ARTIFACTS IN YOUR VAULT ARE BACKED BY A MASTER-CERTIFIED ROYALTY-FREE LICENSE. WORLDWIDE CLEARANCE ACTIVE.
                        </p>
                    </div>
                </div>

                {/* 📜 2. THE STORY TERMINAL */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-12">
                         <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none italic italic">From Mumbai <br/> To The World.</h2>
                         <div className="space-y-8 text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed text-white/40">
                             <p>
                                Samples Wala was forged in the high-density creative hubs of Mumbai, designed to serve a global community of producers who demand precision and soul in their audio gear.
                             </p>
                             <p>
                                Every artifact in our vault is curated by our internal signal agents—producers and engineers who live in the studio, ensuring that what you download isn't just a file, but a functional production tool.
                             </p>
                         </div>
                         <div className="flex items-center gap-6">
                             <div className="h-px flex-1 bg-white/10" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Signal Origin: India</span>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-64 border border-white/5 bg-white/[0.02] flex items-center justify-center">
                             <div className="text-center">
                                 <h4 className="text-4xl font-black italic tracking-tighter">10K+</h4>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Artifacts</span>
                             </div>
                        </div>
                        <div className="h-64 border border-white/5 bg-white/[0.02] flex items-center justify-center">
                             <div className="text-center">
                                 <h4 className="text-4xl font-black italic tracking-tighter">50+</h4>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Collections</span>
                             </div>
                        </div>
                        <div className="h-64 border border-white/5 bg-white/[0.02] flex items-center justify-center">
                             <div className="text-center">
                                 <h4 className="text-4xl font-black italic tracking-tighter">0</h4>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Royalty Fees</span>
                             </div>
                        </div>
                        <Link href="/subscription" className="h-64 bg-white text-black flex flex-col items-center justify-center gap-4 hover:bg-emerald-400 transition-all group">
                             <Zap className="h-8 w-8 group-hover:scale-125 transition-transform" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Join Signal</span>
                        </Link>
                    </div>
                </div>

                {/* 🔌 3. THE CALL TO BROADCAST */}
                <div className="mt-48 py-32 border-y border-white/10 text-center space-y-12">
                     <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic italic">Ready To Transmit?</h3>
                     <Link href="/browse" className="inline-flex items-center gap-6 bg-white text-black px-12 py-6 text-xs font-black uppercase tracking-[0.4em] hover:bg-emerald-400 transition-all active:scale-[0.98]">
                         ENTER THE VAULT <ArrowRight className="h-4 w-4" />
                     </Link>
                </div>

            </main>
        </div>
    )
}
