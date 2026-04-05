import Link from 'next/link'
import { Mail, MessageSquare, Globe, ArrowLeft, Send, Music4, Zap } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20">
            
            {/* 🎰 THE SIGNAL HEADER */}
            <header className="border-b border-white/10 px-6 md:px-20 py-32 bg-black">
                <div className="max-w-4xl">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white mb-8 flex items-center gap-2 group transition-all">
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                        Protocol Home
                    </Link>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 block">Signal Center — संपर्क</span>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic italic mb-12">Contact Agent</h1>
                    <p className="text-xl text-white/40 leading-relaxed font-medium">
                        Whether it's a technical artifact failure or a commercial partnership broadcast, our transmission lines are open 24/7.
                    </p>
                </div>
            </header>

            <main className="px-6 md:px-20 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 max-w-7xl">
                    
                    {/* 🔌 1. TRANSMISSION FORM */}
                    <div className="p-12 border border-white/10 bg-white/[0.02] space-y-12">
                        <div className="space-y-2">
                             <h3 className="text-2xl font-black uppercase italic tracking-tighter">New Broadcast</h3>
                             <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Frequency: High Priority — उच्च प्राथमिकता</span>
                        </div>
                        
                        <form className="space-y-8">
                             <div className="space-y-2 group">
                                 <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-focus-within:text-white transition-all">Agent Name</label>
                                 <input 
                                    type="text" 
                                    placeholder="YOUR FULL NAME" 
                                    className="w-full bg-transparent border-b border-white/10 py-4 text-xs font-black uppercase tracking-widest focus:border-white transition-all outline-none"
                                 />
                             </div>
                             <div className="space-y-2 group">
                                 <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-focus-within:text-white transition-all">Contact Pipeline</label>
                                 <input 
                                    type="email" 
                                    placeholder="EMAIL@DOMAIN.COM" 
                                    className="w-full bg-transparent border-b border-white/10 py-4 text-xs font-black uppercase tracking-widest focus:border-white transition-all outline-none"
                                 />
                             </div>
                             <div className="space-y-2 group">
                                 <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-focus-within:text-white transition-all">Transmission Signal</label>
                                 <textarea 
                                    rows={4}
                                    placeholder="YOUR TECHNICAL OR COMMERCIAL BROADCAST..." 
                                    className="w-full bg-transparent border-b border-white/10 py-4 text-xs font-black uppercase tracking-widest focus:border-white transition-all outline-none resize-none"
                                 />
                             </div>
                             <button className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all active:scale-[0.98]">
                                <Send className="h-4 w-4" /> Send Signal — सिग्नल भेजें
                             </button>
                        </form>
                    </div>

                    {/* 🛡️ 2. DIRECT PIPELINES */}
                    <div className="flex flex-col justify-between py-12">
                         <div className="space-y-20">
                             
                             <div className="space-y-8">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Support Lines — सहायता</h4>
                                <div className="space-y-6">
                                     <div className="flex items-center gap-6 group">
                                         <div className="h-12 w-12 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                             <Mail className="h-5 w-5" />
                                         </div>
                                         <div>
                                             <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Direct Signal</span>
                                             <span className="text-xs font-black uppercase tracking-widest">contact@beatswala.com</span>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-6 group">
                                         <div className="h-12 w-12 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                             <MessageSquare className="h-5 w-5" />
                                         </div>
                                         <div>
                                             <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Partnership Registry</span>
                                             <span className="text-xs font-black uppercase tracking-widest">partners@beatswala.com</span>
                                         </div>
                                     </div>
                                </div>
                             </div>

                             <div className="space-y-8">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Production Base — स्थान</h4>
                                <div className="space-y-2">
                                     <h5 className="text-3xl font-black italic tracking-tighter uppercase grayscale opacity-20">Mumbai, India — मुंबई</h5>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-white/20 leading-relaxed">
                                        OPERATING FROM THE HEART OF THE HIGH-DENSITY <br/> 
                                        PRODUCTION HUB. GLOBAL TRANSMISSION ACTIVE.
                                     </p>
                                </div>
                             </div>

                         </div>

                         <div className="pt-24 flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/10 italic">
                             <div className="flex items-center gap-2"><Globe className="h-3 w-3" /> Worldwide Connection</div>
                             <div className="flex items-center gap-2"><Zap className="h-3 w-3" /> High Performance Ops</div>
                         </div>
                    </div>

                </div>
            </main>

        </div>
    )
}
