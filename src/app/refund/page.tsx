import Link from 'next/link'
import { ShieldAlert, CreditCard, Mail, Globe, ArrowLeft, Zap } from 'lucide-react'

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20">
            
            {/* 🎰 THE REFUND HEADER */}
            <header className="border-b border-white/10 px-6 md:px-20 py-32 bg-black">
                <div className="max-w-4xl">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white mb-8 flex items-center gap-2 group transition-all">
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                        Protocol Home
                    </Link>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 block">Refund Protocol — धनवापसी</span>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic italic mb-12 text-red-500">Refund Policy</h1>
                    <p className="text-xl text-white/40 leading-relaxed font-medium uppercase tracking-tight">
                        A prioritized registry of the Samples Wala policy on digital audio artifacts. Transparency is our core signal.
                    </p>
                </div>
            </header>

            <main className="px-6 md:px-20 py-24">
                <div className="max-w-4xl space-y-24">
                    
                    {/* 🔌 1. THE CORE REGISTRY */}
                    <div className="space-y-12">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Digital Artifact Status — डिजिटल स्थिति</h3>
                         <div className="space-y-12 p-12 border border-white/5 bg-white/[0.01]">
                             <div className="space-y-6">
                                 <h4 className="text-2xl font-black uppercase italic tracking-tighter">Non-Refundable Policy</h4>
                                 <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed text-white/40">
                                     DUE TO THE INTANGIBLE NATURE OF DIGITAL MASTER ASSETS AND AUDIO ARTIFACTS, ALL SALES OF CREDITS AND SAMPLE PACKS ARE FINAL ONCE TRANSMITTED. UNLIKE PHYSICAL GEAR, DIGITAL COPIES CANNOT BE "RETURNED" TO THE VAULT ONCE SECURED.
                                 </p>
                             </div>
                             <div className="space-y-6">
                                 <h4 className="text-2xl font-black uppercase italic tracking-tighter">Exceptions Signal</h4>
                                 <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed text-white/40">
                                     WE WILL BROADCAST A FULL REFUND ONLY IN THE EVENT OF A GENUINE TECHNICAL ARTIFACT FAILURE (E.G., DAMAGED FILE, INCORRECT CONTENT) THAT OUR AGENTS CANNOT RECTIFY WITHIN 48 HOURS OF YOUR SIGNAL.
                                 </p>
                             </div>
                         </div>
                    </div>

                    {/* 🔌 2. THE STEPS */}
                    <div className="space-y-12">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Relinquish Signal — वापसी की प्रक्रिया</h3>
                         <div className="grid grid-cols-1 gap-4">
                             {[
                                { t: 'Broadcast Claim', d: 'SEND A DETAILED SIGNAL TO OUR AGENTS WITHIN 7 DAYS OF CAPTURE.' },
                                { t: 'Identify Artifact', d: 'PROVIDE THE TRANSACTION ID AND THE SPECIFIC SAMPLE OR PACK NAME.' },
                                { t: 'Technical Verify', d: 'OUR AGENTS WILL VERIFY THE ARTIFACT FAILURE IN OUR PRODUCTION TERMINAL.' }
                             ].map((step, i) => (
                                <div key={i} className="p-10 border border-white/10 bg-white/[0.02] flex items-center justify-between group hover:bg-white transition-all duration-700">
                                     <div className="space-y-2">
                                         <h4 className="text-xl font-black italic uppercase italic group-hover:text-black">{step.t}</h4>
                                         <p className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-black/40">{step.d}</p>
                                     </div>
                                     <div className="h-10 w-10 border border-white/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                         <Zap className="h-4 w-4" />
                                     </div>
                                </div>
                             ))}
                         </div>
                    </div>

                    {/* 🔌 3. CONTACT REDIRECT */}
                    <div className="p-16 border-t border-white/10 flex flex-col items-center text-center gap-8">
                         <div className="flex items-center gap-2 group-hover:animate-pulse">
                             <Mail className="h-8 w-8 text-white/10" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-white/20 max-w-xl">
                             IF YOU BELIEVE YOUR ACCOUNT HAS EXPERIENCED A SIGNAL ERROR, <br/> 
                             DISCONNECT FROM THE VAULT AND BROADCAST TO OUR SUPPORT AGENTS AT
                         </p>
                         <Link href="/contact" className="text-xl font-black uppercase italic tracking-tighter hover:text-emerald-400 transition-colors">
                             SUPPORT@BEATSWALA.COM
                         </Link>
                    </div>

                </div>
            </main>
        </div>
    )
}
