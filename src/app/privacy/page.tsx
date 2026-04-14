import Link from 'next/link'
import { ShieldCheck, Eye, Lock, Globe, ArrowLeft, Mail, Database } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20">
            
            {/* 🎰 THE PRIVACY HEADER */}
            <header className="border-b border-white/10 px-6 md:px-20 py-32 bg-black">
                <div className="max-w-4xl">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white mb-8 flex items-center gap-2 group transition-all">
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                        Return Home
                    </Link>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 block">Privacy Pipeline — गोपनीयता</span>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic italic mb-12 text-emerald-400">Data Security</h1>
                    <p className="text-xl text-white/40 leading-relaxed font-medium uppercase tracking-tight">
                        A prioritized registry of how Samples Wala collects, protects, and broadcasts producer data. Signal integrity is absolute.
                    </p>
                </div>
            </header>

            <main className="px-6 md:px-20 py-24">
                <div className="max-w-4xl space-y-24">
                    
                    {/* 🔌 1. DATA COLLECTION */}
                    <div className="space-y-12">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Signal Capture — डेटा संग्रह</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {[
                                { t: 'Agent Identity', d: 'WE COLLECT YOUR EMAIL AND NAME TO SECURE YOUR ARTIFACT VAULT ACCESS.', icon: <Database /> },
                                { t: 'Transaction Data', d: 'RAZORPAY AND STRIPE HANDLE YOUR PAYMENT SECRETS; WE ONLY RECEIVE THE STATUS SIGNAL.', icon: <Lock /> },
                                { t: 'Usage Metrics', d: 'WE TRACK WHICH ARTIFACTS YOU VIEW TO OPTIMIZE THE DISCOVERY ENGINE.', icon: <Eye /> },
                                { t: 'Access Logs', d: 'WE LOG YOUR IP TO ENSURE THE SECURITY OF YOUR UNLOCKED WAV TRANSFERS.', icon: <ShieldCheck /> }
                             ].map((item, i) => (
                                <div key={i} className="p-10 border border-white/10 bg-white/[0.02] space-y-6 group hover:bg-white transition-all duration-700">
                                     <div className="h-10 w-10 border border-white/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                         {item.icon}
                                     </div>
                                     <h4 className="text-xl font-black italic uppercase italic group-hover:text-black">{item.t}</h4>
                                     <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed text-white/20 group-hover:text-black/40">
                                         {item.d}
                                     </p>
                                </div>
                             ))}
                         </div>
                    </div>

                    {/* 🔌 2. DATA ENCRYPTION */}
                    <div className="p-16 border border-emerald-500/10 bg-emerald-500/[0.02] space-y-12">
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic italic underline underline-offset-8">End-to-End Encryption</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-white/40 max-w-2xl">
                                IN ACCORDANCE WITH GLOBAL PRIVACY STANDARDS, ALL PRODUCTION ASSETS AND TRANSACTIONS ARE SECURED VIA SSL ENCRYPTION. WE DO NOT STORE CARD DATA ON OUR SERVERS.
                            </p>
                        </div>
                        <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                            <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> 256-bit AES</div>
                            <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> GDPR Active</div>
                        </div>
                    </div>

                    {/* 🔌 3. CONTACT REDIRECT */}
                    <div className="p-16 border-t border-white/10 flex flex-row items-center justify-between">
                         <div className="space-y-2">
                             <h4 className="text-xl font-black italic uppercase italic">Privacy Agency</h4>
                             <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">
                                DIRECT SIGNAL FOR DATA PORTABILITY OR DELETION BROADCASTS
                             </p>
                             <Link href="/contact" className="text-xs font-black uppercase tracking-widest hover:text-emerald-400 transition-colors">
                                 PRIVACY@BEATSWALA.COM
                             </Link>
                         </div>
                         <Mail className="h-12 w-12 text-white/5" />
                    </div>

                </div>
            </main>
        </div>
    )
}
