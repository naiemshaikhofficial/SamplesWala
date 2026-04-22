import Link from 'next/link'
import { Disc, ArrowLeft, Search, Zap, Layers } from 'lucide-react'
import { MasterLight, ScanlineOverlay } from '@/components/ui/MasterLight'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-mono p-6">
            <MasterLight />
            <ScanlineOverlay />
            
            {/* Background 404 Artifact */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                <span className="text-[30rem] font-black italic tracking-tighter">404</span>
            </div>

            <div className="relative z-10 text-center space-y-12 max-w-2xl">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-studio-neon/10 border border-studio-neon/20 text-studio-neon text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                        <Zap size={12} /> ERROR : SIGNAL LOST
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">
                        VOID <span className="text-white/20">FOUND</span>
                    </h1>
                    <p className="text-sm md:text-xl text-white/40 font-black uppercase tracking-widest leading-relaxed italic">
                        The sonic artifact you are searching for does not exist in our current signal archive. <br className="hidden md:block"/>
                        Redirecting to safe broadcast...
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/browse" className="h-16 flex items-center justify-center bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-studio-neon transition-all gap-3 shadow-xl">
                        <Search size={16} /> SEARCH LIBRARY
                    </Link>
                    <Link href="/packs" className="h-16 flex items-center justify-center bg-black border-2 border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:border-studio-neon transition-all gap-3 shadow-xl">
                        <Layers size={16} /> VIEW ALL PACKS
                    </Link>
                </div>

                <div className="pt-12">
                    <Link href="/" className="inline-flex items-center gap-4 text-white/20 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" /> BACK TO ROOT TERMINAL
                    </Link>
                </div>
            </div>

            {/* Cinematic Footer Decor */}
            <div className="absolute bottom-12 inset-x-0 flex flex-col items-center gap-4 opacity-10">
                <div className="flex gap-1">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-1 h-8 bg-white animate-peak" style={{ animationDelay: `${i*0.1}s` }} />
                    ))}
                </div>
                <span className="text-[8px] font-black tracking-[0.5em] uppercase">SAMPLES WALA :: SIGNAL RECOVERY ACTIVE</span>
            </div>
        </div>
    )
}
