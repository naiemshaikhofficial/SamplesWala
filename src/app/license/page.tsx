import Link from 'next/link'
import { ShieldCheck, Scale, Music, Globe, FileText, ArrowLeft, Download } from 'lucide-react'

export default function LicensePage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20 px-6 md:px-20 py-32">
            
            {/* 🎰 THE LEGAL HEADER */}
            <div className="max-w-4xl mb-24">
                <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white mb-8 flex items-center gap-2 group transition-all">
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    Protocol Home
                </Link>
                <div className="flex items-center gap-4 text-emerald-400 mb-6">
                    <ShieldCheck className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Master Registry — कानूनी</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic italic mb-12">Artifact Licensing</h1>
                <p className="text-xl text-white/40 leading-relaxed font-medium">
                    Every sound secured on the Samples Wala platform is accompanied by a non-exclusive, worldwide, royalty-free commercial license. You are here to create history, and we are here to clear your path.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                
                {/* 🛡️ 1. THE PERMISSIONS */}
                <div className="space-y-16">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Permissions — अनुमति</h3>
                        <div className="grid grid-cols-1 gap-4">
                             {[
                                'Commercial Release in any medium (Streaming, TV, Film)',
                                'Synchronization with Video Content (YouTube, TikTok, Instagram)',
                                'Live Performance and Public Broadcast',
                                'Modification and Transformation of Audio Artifacts'
                             ].map((p, i) => (
                                <div key={i} className="p-6 border border-white/5 bg-white/[0.02] flex items-center gap-6 group hover:border-emerald-500/20 transition-all">
                                    <div className="h-8 w-8 flex items-center justify-center bg-white/5 text-emerald-400">
                                        <Music className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest leading-none">{p}</span>
                                </div>
                             ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Restrictions — प्रतिबंध</h3>
                        <div className="grid grid-cols-1 gap-4">
                             {[
                                'Reselling or Redistributing raw artifacts as separate files',
                                'Using artifacts to create competing sample or loop libraries',
                                'Registering Content ID or Copyright on the raw artifact itself',
                                'Using the "Samples Wala" name in your song titles or credits without permission'
                             ].map((r, i) => (
                                <div key={i} className="p-6 border border-white/5 bg-white/[0.02] flex items-center gap-6 text-white/20 hover:text-white transition-all">
                                    <div className="h-8 w-8 flex items-center justify-center bg-white/5">
                                        <Scale className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest leading-none">{r}</span>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* 📜 2. THE LEGAL TEXT */}
                <div className="space-y-16">
                    <div className="p-12 border border-white/10 bg-white/[0.01] space-y-12">
                        <div className="flex items-center justify-between border-b border-white/5 pb-8">
                             <div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Gold Standard License</h2>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Version 1.2 — Security Protocol</span>
                             </div>
                             <button className="h-12 w-12 flex items-center justify-center bg-white text-black hover:bg-emerald-400 transition-all">
                                <Download className="h-4 w-4" />
                             </button>
                        </div>
                        
                        <div className="space-y-6 text-[11px] font-medium leading-relaxed text-white/40 uppercase tracking-widest">
                            <p>
                                Samples Wala grants you a perpetual, non-exclusive, non-transferable, worldwide license to use any audio artifact secured with your credits.
                            </p>
                            <p>
                                You may use the samples in combination with other sounds in music productions (which include soundtracks of such as films, video productions, radio/TV programs or commercials, computer games and multimedia presentations, library music), public performances, and other reasonable musical purposes within musical compositions.
                            </p>
                            <p>
                                The license is granted solely to the original purchaser (the "Agent") and is not transferable. You may not resell, lease, sublicense or distribute the original audio artifacts in any form.
                            </p>
                            <div className="pt-8 flex items-center gap-4 text-emerald-400">
                                <Globe className="h-4 w-4" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Cleared for Global Broadcast</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Link href="/terms" className="p-10 border border-white/10 hover:bg-white hover:text-black transition-all flex flex-col justify-between h-48 group">
                            <FileText className="h-6 w-6 text-white/20 group-hover:text-black" />
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-black/40 block mb-2">Detailed Protocol</span>
                                <h4 className="text-xl font-black italic uppercase italic">Terms of Ops</h4>
                            </div>
                         </Link>
                         <Link href="/contact" className="p-10 border border-white/10 hover:bg-white hover:text-black transition-all flex flex-col justify-between h-48 group">
                            <Scale className="h-6 w-6 text-white/20 group-hover:text-black" />
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-black/40 block mb-2">Legal Signal</span>
                                <h4 className="text-xl font-black italic uppercase italic">Contact Support</h4>
                            </div>
                         </Link>
                    </div>
                </div>

            </div>

        </div>
    )
}
