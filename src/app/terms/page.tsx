import Link from 'next/link'
import { FileText, ShieldCheck, Scale, Globe, ArrowLeft, Mail, Gavel } from 'lucide-react'

export default function TermsPage() {
    const sections = [
        {
            t: 'Artifact Access — पहुँच',
            d: 'BY ENTERING THE VAULT, YOU AGREE THAT ALL CREDITS CAPTURED ARE FINAL. ACCESS TO UNLOCKED ARTIFACTS IS PERPETUAL SO LONG AS THE ACCOUNT REMAINS ACTIVE AND IN GOOD STANDING.'
        },
        {
            t: 'Currency Exchange — मुद्रा विनिमय',
            d: 'SAMPLES WALA CREDITS ARE A DIGITAL ARTIFACT CURRENCY WITH NO PHYSICAL VALUE. THEY CANNOT BE EXCHANGED FOR CURRENCY OUTSIDE THE BEATSWALA.COM ECOSYSTEM.'
        },
        {
            t: 'Signal Integrity — सिग्नल अखंडता',
            d: 'YOU MAY NOT DECOMPILE, REVERSE ENGINEER, OR ATTEMPT TO CAPTURE RAW ARTIFACTS FROM OUR SERVERS WITHOUT DIRECT AUTHORIZATION THROUGH CREDIT EXCHANGE.'
        }
    ]

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20">
            
            {/* 🎰 THE TERMS HEADER */}
            <header className="border-b border-white/10 px-6 md:px-20 py-32 bg-black">
                <div className="max-w-4xl">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white mb-8 flex items-center gap-2 group transition-all">
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                        Protocol Home
                    </Link>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 block">Terms of Ops — नियम</span>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic italic mb-12">Registry Rules</h1>
                    <p className="text-xl text-white/40 leading-relaxed font-medium uppercase tracking-tight">
                        The Master Protocol defining the relationship between the Samples Wala Signal Provider and the Production Agent.
                    </p>
                </div>
            </header>

            <main className="px-6 md:px-20 py-24">
                <div className="max-w-4xl space-y-24">
                    
                    {/* 🔌 1. CORE SECTIONS */}
                    <div className="space-y-12">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Operation Rules — संचालन नियम</h3>
                         <div className="grid grid-cols-1 gap-8">
                             {sections.map((section, i) => (
                                <div key={i} className="p-12 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all space-y-6">
                                     <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">{section.t}</h4>
                                     <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed text-white/40 max-w-3xl">
                                         {section.d}
                                     </p>
                                </div>
                             ))}
                         </div>
                    </div>

                    {/* 🔌 2. THE LEGAL GAVEL */}
                    <div className="p-16 border border-white/10 bg-white/[0.02] flex flex-col md:flex-row items-center gap-12 group">
                         <div className="h-20 w-20 flex-shrink-0 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                             <Gavel className="h-8 w-8" />
                         </div>
                         <div className="space-y-4">
                             <h2 className="text-3xl font-black uppercase tracking-tighter italic italic underline underline-offset-8">Master Compliance</h2>
                             <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-white/40">
                                BY SECURING AN ACCOUNT, YOU AGREE TO ABIDE BY THESE OPERATIONS REGISTRIES. FAILURE TO COMPLY WITH SIGNAL INTEGRITY MAY RESULT IN PERMANENT ACCOUNT DISCONNECT WITHOUT REFUND.
                             </p>
                         </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between pt-12 items-end">
                         <div className="space-y-4">
                             <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Protocol Updated 05.04.2026 — MUMBAI TRANSMISSION</span>
                             <p className="text-xl font-black uppercase italic tracking-tighter">SAMPLES WALA REGISTRY</p>
                         </div>
                         <Link href="/contact" className="h-20 w-20 bg-white text-black flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-[0.9]">
                            <Mail className="h-6 w-6" />
                         </Link>
                    </div>

                </div>
            </main>
        </div>
    )
}
