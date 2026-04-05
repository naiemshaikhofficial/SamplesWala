import Link from 'next/link'
import { HelpCircle, Sparkles, CreditCard, ShieldCheck, Download, Mail, ArrowLeft } from 'lucide-react'

export default function FAQPage() {
    const faqs = [
        {
            category: 'Currency & Credits — मुद्रा',
            icon: <CreditCard className="h-5 w-5" />,
            questions: [
                { q: 'How do credits work on Samples Wala?', a: 'Credits are our platform currency. You can use them to "Secure" (unlock) any audio artifact. Once secured, you have lifetime commercial rights to that file.' },
                { q: 'Do credits expire?', a: 'Monthly membership credits expire at the end of your billing cycle. However, credits purchased in "One-Time Packs" never expire.' }
            ]
        },
        {
            category: 'Licensing & Rights — अधिकार',
            icon: <ShieldCheck className="h-5 w-5" />,
            questions: [
                { q: 'Are your sounds royalty-free?', a: '100%. Every artifact you secure comes with a non-exclusive, worldwide, perpetual commercial license. No royalties owed, ever.' },
                { q: 'Can I use these sounds in Netflix/Commercials?', a: 'Absolutely. Our "Gold Standard License" clears you for any commercial medium including TV, Film, and Streaming.' }
            ]
        },
        {
            category: 'Technical Specs — तकनीकी',
            icon: <Download className="h-5 w-5" />,
            questions: [
                { q: 'What file formats are provided?', a: 'All artifacts are delivered in High-Fidelity 24-bit 44.1kHz WAV format, compatible with every major DAW (Ableton, FL Studio, Logic, Pro Tools).' },
                { q: 'What happens if I lose my files?', a: "Your secured sounds are stored in your 'My Sounds' library perpetually. You can re-download them anytime, forever." }
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20">
            
            {/* 🎰 THE FAQ HEADER */}
            <header className="border-b border-white/10 px-6 md:px-20 py-32 bg-black">
                <div className="max-w-4xl">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white mb-8 flex items-center gap-2 group transition-all">
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                        Protocol Home
                    </Link>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 block">Knowledge Registry — सामान्य प्रश्न</span>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic italic mb-12">Signal Intel</h1>
                    <p className="text-xl text-white/40 leading-relaxed font-medium uppercase tracking-tight">
                        A prioritized registry of questions for the modern production agent. Precision answers for precision creators.
                    </p>
                </div>
            </header>

            <main className="px-6 md:px-20 py-24">
                <div className="max-w-5xl space-y-24">
                    {faqs.map((group, i) => (
                        <div key={i} className="space-y-12">
                             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8 flex items-center gap-4">
                                {group.icon}
                                {group.category}
                             </h3>
                             
                             <div className="grid grid-cols-1 gap-8">
                                {group.questions.map((item, j) => (
                                    <div key={j} className="p-12 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all space-y-6">
                                        <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">{item.q}</h4>
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed text-white/40 max-w-3xl">
                                            {item.a}
                                        </p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    ))}

                    {/* 🔌 THE CONNECT CARD */}
                    <div className="p-16 bg-white text-black flex flex-col md:flex-row items-center justify-between gap-12 group">
                        <div className="space-y-4">
                             <h3 className="text-4xl font-black uppercase tracking-tighter italic italic">Still No Signal?</h3>
                             <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                 BROADCAST YOUR DIRECT QUERY TO OUR CORE AGENT TEAM. <br/> 
                                 RESPONSE TIME: OPTIMIZED UNDER 24 HOURS.
                             </p>
                        </div>
                        <Link href="/contact" className="h-16 px-12 bg-black text-white flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                             <Mail className="h-4 w-4" /> Contact Agent
                        </Link>
                    </div>
                </div>
            </main>

        </div>
    )
}
