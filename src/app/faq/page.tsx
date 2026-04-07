
'use client'

import { HelpCircle, ShieldQuestion, MessageSquare, Zap, Cpu, Mail, Database, Activity } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAudio } from '@/components/audio/AudioProvider'

export default function HelpPage() {
    const { isPlaying } = useAudio()

    const categories = [
        { title: 'Subscribing & Credits', icon: <Zap size={20} />, description: 'How to manage your artifacts and refills.' },
        { title: 'Audio & License', icon: <Cpu size={20} />, description: 'Copyright and royalty-free signal protocols.' },
        { title: 'Account Settings', icon: <ShieldQuestion size={20} />, description: 'Identity management and security locks.' },
    ]

    const faqs = [
        { q: "How do credits work?", a: "Each individual sample costs 1 credit. Packs can be purchased as a full signal for discounted credit rates." },
        { q: "Can I cancel my subscription?", a: "Yes. Use the Settings gear icon in the header to access the membership management terminal." },
        { q: "Are loops royalty-free?", a: "100%. All samples on SAMPLES WALA are high-fidelity royalty-free artifacts." }
    ]

    return (
        <div className="min-h-screen bg-studio-charcoal text-white pt-24 md:pt-32 pb-24 relative overflow-hidden font-mono selection:bg-studio-neon selection:text-black">
             {/* 🧬 BACKGROUND_GRID */}
             <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} 
            />

            <div className="container mx-auto px-4 relative z-10 max-w-4xl">
                 {/* 🏷️ HEAD_SIGNAL */}
                <div className="mb-16 md:mb-20 text-center">
                    <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-sm bg-black border border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon mb-6">
                        <HelpCircle size={10} /> HELP_CENTER
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-6">
                        SUPPORT <span className="text-white/10 italic">CONSOLE</span>
                    </h1>
                    <p className="text-xs md:text-lg text-white/30 font-black uppercase tracking-widest italic max-w-2xl mx-auto leading-relaxed">
                        Need assistance? Access our surgical troubleshooting guides.
                    </p>
                </div>

                {/* 🕹️ 1. QUICK_CATEGORIES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 px-4 md:px-0">
                    {categories.map((cat, i) => (
                        <div key={i} className="p-8 bg-black/40 border-2 border-white/5 hover:border-studio-neon transition-all group rounded-sm shadow-xl">
                            <div className="text-studio-neon mb-6 group-hover:scale-110 transition-transform origin-left">
                                {cat.icon}
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest mb-2 italic">{cat.title}</h3>
                            <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">{cat.description}</p>
                        </div>
                    ))}
                </div>

                {/* 📡 2. FAQ_TERMINAL */}
                <div className="space-y-4 px-4 md:px-0">
                    <div className="flex items-center gap-3 mb-10 text-white/10">
                        <MessageSquare size={16} />
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] italic">Frequent_Inquiries</h2>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>

                    {faqs.map((faq, i) => (
                        <div key={i} className="p-8 bg-black/60 border border-white/5 rounded-sm hover:bg-black/80 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="text-studio-neon h-6 w-6 shrink-0 font-black text-xs">[ 0{i+1} ]</div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight mb-4 italic text-white/90 underline decoration-studio-neon/20 underline-offset-8 decoration-2">{faq.q}</h4>
                                    <p className="text-xs text-white/40 leading-relaxed uppercase tracking-widest leading-loose">{faq.a}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 📧 3. CONTACT_CHANNEL */}
                <div className="mt-24 p-8 md:p-16 bg-studio-neon text-black rounded-sm text-center shadow-[0_0_50px_rgba(166,226,46,0.15)] relative overflow-hidden group">
                     <div className="relative z-10">
                        <h3 className="text-3xl md:text-6xl font-black uppercase tracking-tighter italic mb-8">DIRECT_STUDIO_SIGNAL</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-12 opacity-60 italic">Still having trouble? Connect with our studio engineers directly.</p>
                        
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Link href="mailto:support@sampleswala.com" className="w-full md:w-auto px-12 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all italic rounded-sm shadow-xl flex items-center justify-center gap-4">
                                <Mail size={14} /> Open Ticket
                            </Link>
                            <Link href="/browse" className="w-full md:w-auto px-12 py-5 border-2 border-black text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all italic rounded-sm shadow-xl flex items-center justify-center gap-4">
                                <Activity size={14} /> System Online
                            </Link>
                        </div>
                     </div>
                     <div className="absolute -right-20 -bottom-20 opacity-[0.05] group-hover:opacity-10 transition-opacity pointer-events-none">
                         <HelpCircle size={300} />
                     </div>
                </div>

            </div>
        </div>
    )
}
