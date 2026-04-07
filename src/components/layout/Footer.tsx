'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Music, Disc, ShieldCheck, Mail, ArrowUpRight, Zap, Volume2, Settings2, Database, Key, Radio, Activity, Play } from 'lucide-react'

export function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="px-6 md:px-20 py-20 md:py-32 bg-studio-charcoal border-t-[32px] border-black relative overflow-hidden font-mono shadow-[inset_0_20px_50px_rgba(0,0,0,0.8)]">
        {/* 🧬 STUDIO DECOR (Faint Console Background) */}
        <div className="absolute top-0 right-0 p-12 md:p-24 opacity-[0.02] transform rotate-12 pointer-events-none">
            <div className="flex flex-col gap-16 md:gap-32">
                <Settings2 className="h-[300px] w-[300px] md:h-[600px] md:w-[600px] animate-spin-slow" />
                <Disc className="h-[300px] w-[300px] md:h-[600px] md:w-[600px] animate-reverse-spin" />
            </div>
        </div>

        <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row justify-between items-start gap-16 md:gap-32 relative z-10">
            <div className="space-y-12 md:space-y-16 w-full md:w-auto">
                <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-10 group cursor-default text-center sm:text-left">
                    <div className="h-20 w-20 md:h-28 md:w-28 bg-studio-neon rounded-full flex items-center justify-center p-4 md:p-6 shadow-[0_0_50px_rgba(166,226,46,0.2)] group-hover:shadow-[0_0_80px_rgba(166,226,46,0.4)] transition-all duration-1000 rotate-12 group-hover:rotate-0">
                        <Music className="h-full w-full text-black" />
                    </div>
                    <div className="flex flex-col items-center sm:items-start">
                        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-widest italic leading-[0.8] text-white">
                            SAMPLES<br /><span className="text-studio-neon underline decoration-studio-yellow decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8">WALA</span>
                        </h2>
                        <div className="flex gap-1 md:gap-2 h-3 md:h-4 mt-4 opacity-20">
                            {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 bg-studio-neon animate-meter" style={{ animationDelay: `${i * 0.1}s` }} />)}
                        </div>
                    </div>
                </div>
                
                <div className="space-y-8 md:space-y-10">
                    <p className="text-white/30 text-sm md:text-base font-black uppercase tracking-[0.3em] md:tracking-[0.5em] leading-loose max-w-lg border-l-[8px] md:border-l-[16px] border-spider-red pl-6 md:pl-10 italic bg-black/30 p-6 md:p-10 shadow-inner">
                        Standardized production artifacts for the modern DAW ecosystem. Optimized for V5.0 workflows. Established Mumbai 2024.
                    </p>
                    
                    <div className="flex gap-4 md:gap-8 items-center justify-center sm:justify-start px-2 sm:px-10">
                        <Link href="#" className="h-12 w-12 md:h-14 md:w-14 studio-panel border-2 border-white/5 hover:border-studio-neon hover:bg-black transition-all flex items-center justify-center group/social">
                            <Activity className="h-5 w-5 md:h-6 md:w-6 group-hover:text-studio-neon group-hover:scale-110 transition-all" />
                        </Link>
                        <Link href="#" className="h-12 w-12 md:h-14 md:w-14 studio-panel border-2 border-white/5 hover:border-studio-neon hover:bg-black transition-all flex items-center justify-center group/social">
                            <Radio className="h-5 w-5 md:h-6 md:w-6 group-hover:text-studio-neon group-hover:scale-110 transition-all" />
                        </Link>
                        <Link href="#" className="h-12 w-12 md:h-14 md:w-14 studio-panel border-2 border-white/5 hover:border-studio-neon hover:bg-black transition-all flex items-center justify-center group/social">
                            <Play className="h-5 w-5 md:h-6 md:w-6 group-hover:text-studio-neon group-hover:scale-110 transition-all" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-32 w-full md:w-auto">
                <div className="space-y-10 md:space-y-12">
                   <div className="flex items-center gap-4 bg-black px-4 py-2 border-r-8 border-spider-red self-start">
                        <Volume2 className="h-4 w-4 text-spider-red" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Record Store</span>
                   </div>
                   <ul className="space-y-6 md:space-y-8 text-base md:text-lg font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-white/30">
                       <li><Link href="/browse" className="hover:text-studio-neon transition-all hover:translate-x-4 md:hover:translate-x-6 flex items-center gap-4 group/item">
                           <span className="text-[9px] text-white/5 group-hover/item:text-studio-neon transition-colors">01</span> All Sounds
                       </Link></li>
                       <li><Link href="/browse?mode=packs" className="hover:text-studio-neon transition-all hover:translate-x-4 md:hover:translate-x-6 flex items-center gap-4 group/item">
                           <span className="text-[9px] text-white/5 group-hover/item:text-studio-neon transition-colors">02</span> Sound Packs
                       </Link></li>
                       <li><Link href="/pricing" className="hover:text-studio-neon transition-all hover:translate-x-4 md:hover:translate-x-6 flex items-center gap-4 group/item">
                           <span className="text-[9px] text-white/5 group-hover/item:text-studio-neon transition-colors">03</span> Pricing
                       </Link></li>
                   </ul>
                </div>

                <div className="space-y-10 md:space-y-12">
                   <div className="flex items-center gap-4 bg-black px-4 py-2 border-r-8 border-studio-yellow self-start">
                        <Settings2 className="h-4 w-4 text-studio-yellow" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Producer Hub</span>
                   </div>
                   <ul className="space-y-6 md:space-y-8 text-base md:text-lg font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-white/30">
                       <li><Link href="/profile/library" className="hover:text-spider-red transition-all hover:translate-x-4 md:hover:translate-x-6 flex items-center gap-4 group/item">
                           <span className="text-[9px] text-white/5 group-hover/item:text-spider-red transition-colors">04</span> My Library
                       </Link></li>
                       <li><Link href="/profile" className="hover:text-spider-red transition-all hover:translate-x-4 md:hover:translate-x-6 flex items-center gap-4 group/item">
                           <span className="text-[9px] text-white/5 group-hover/item:text-spider-red transition-colors">05</span> Profile Node
                       </Link></li>
                       <li><Link href="/license" className="hover:text-spider-red transition-all hover:translate-x-4 md:hover:translate-x-6 flex items-center gap-4 group/item">
                           <span className="text-[9px] text-white/5 group-hover/item:text-spider-red transition-colors">06</span> License Log
                       </Link></li>
                   </ul>
                </div>

                <div className="space-y-10 md:space-y-12 md:col-span-2 lg:col-span-1 hidden sm:block">
                   <div className="flex items-center gap-4 bg-black px-4 py-2 border-r-8 border-studio-neon self-start">
                        <Database className="h-4 w-4 text-studio-neon" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Cloud Rack</span>
                   </div>
                   <div className="studio-panel bg-black p-8 md:p-12 space-y-6 md:space-y-8 shadow-inner border-2 border-white/5">
                       <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] leading-relaxed italic">
                           Secure storage for all your production artifacts. Optimized for V5 redundancy protocols.
                       </p>
                       <Link href="/pricing" className="h-12 md:h-16 w-full flex items-center justify-center bg-studio-neon text-black text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all transform -skew-x-12 shadow-[0_0_50px_#a6e22e33]">
                           Upgrade Rack
                       </Link>
                   </div>
                </div>
            </div>
        </div>

        <div className="mt-24 md:mt-64 pt-16 md:pt-24 border-t-8 border-black flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-16 opacity-30 group/footer">
           <div className="flex flex-col gap-2 items-center lg:items-start text-center lg:text-left">
                <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] md:tracking-[1em] group-hover/footer:text-studio-neon transition-all duration-1000 cursor-default">
                    SAMPLES_WALA.v5
                </span>
                <span className="text-[9px] font-black text-white/10 tracking-[0.3em] md:tracking-[0.5em] italic leading-loose">Mumbai :: Gear_Architecture</span>
           </div>
           <div className="flex items-center gap-8 md:gap-16 text-[9px] md:text-[11px] font-black uppercase tracking-widest">
               <Link href="/terms" className="hover:text-white border-b border-white/5">Rules Terminal</Link>
               <Link href="/privacy" className="hover:text-white border-b border-white/5">Signal Safe</Link>
           </div>
        </div>
    </footer>
  )
}
