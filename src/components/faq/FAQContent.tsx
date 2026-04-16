
'use client'

import React, { useState, useEffect } from 'react'
import { 
    HelpCircle, Zap, Cpu, Mail, Activity, MessageSquare, 
    ShieldQuestion, ChevronDown, CheckCircle2, XCircle, Clock,
    Download, ShieldCheck, CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function FAQContent() {
    const [systemTime, setSystemTime] = useState('')
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setSystemTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const categories = [
        { 
            title: 'Plans & Payments', 
            icon: <CreditCard size={18} />, 
            items: [
                {
                    q: "How does the subscription work?",
                    a: "It's simple: Pick a plan (Starter, Pro, or Elite) and you'll get a set amount of credits every month. You can spend these credits to download any sound or sample pack you like from our library."
                },
                {
                    q: "Will I be charged automatically?",
                    a: "Yes, your membership will renew automatically every month (or year, depending on your plan) so you don't lose access. You can turn this off anytime in your account settings."
                },
                {
                    q: "What if my payment fails?",
                    a: "Don't worry, we'll try to process it again 3 times over the next week. If it still doesn't work, your account will just be paused until you update your payment info."
                }
            ]
        },
        { 
            title: 'Cancel Anytime', 
            icon: <XCircle size={18} />, 
            items: [
                {
                    q: "How do I cancel my subscription?",
                    a: "You can cancel whenever you want. Just go to 'Settings' > 'Account' and click 'Cancel Subscription'. You'll still have access to your plan until the end of your current billing month."
                },
                {
                    q: "What happens to my credits if I cancel?",
                    a: "You keep all the sounds you've already downloaded forever. However, any 'unused' credits in your balance will expire when your subscription finally ends. Make sure to spend them before your month is up!"
                },
                {
                    q: "Can I come back later?",
                    a: "Of course! You can rejoin anytime. Just keep in mind that you'll start fresh with a new credit balance."
                }
            ]
        },
        { 
            title: 'Copyright & License', 
            icon: <ShieldCheck size={18} />, 
            items: [
                {
                    q: "Are these sounds royalty-free?",
                    a: "Yes, 100%. Once you download a sound, you can use it in your music, videos, or commercial projects without ever paying us another rupee. You own the right to use it for life."
                },
                {
                    q: "Can I resell these sounds?",
                    a: "No. You can use them in your own music productions, but you aren't allowed to resell the individual sounds or packs as your own library."
                },
                {
                    q: "Do I need to give you credit?",
                    a: "No, you don't have to mention us in your credits. Just focus on making great music!"
                }
            ]
        }
    ]

    return (
        <div className="container mx-auto px-4 relative z-10 max-w-5xl py-20 pb-40">
            {/* 🏷️ HEAD_SIGNAL */}
            <div className="mb-24 text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-20 opacity-[0.03] select-none pointer-events-none">
                    <HelpCircle size={400} />
                </div>
                
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-black border border-white/5 text-[10px] font-black uppercase tracking-[0.5em] text-studio-neon mb-8 shadow-2xl">
                    <Activity size={12} className="animate-pulse" /> 
                    HELP_CENTER // {systemTime}
                </div>
                
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-8 italic">
                    NEED <span className="text-white/10 not-italic outline-text">HELP?</span>
                </h1>
                
                <p className="text-xs md:text-lg text-white/30 font-black uppercase tracking-[0.3em] max-w-2xl mx-auto leading-relaxed italic">
                    Everything you need to know about <span className="text-white/60">payments, cancelling, and using our sounds.</span>
                </p>
            </div>

            {/* 📡 COMPREHENSIVE_FAQ_MODULE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* 1. Category Dashboard */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="p-6 bg-black border-2 border-white/5 rounded-none flex items-center justify-between mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">QUICK_TOPICS</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-studio-neon animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-studio-neon/40" />
                        </div>
                    </div>
                    {categories.map((cat, i) => (
                        <div key={i} className="group relative" onClick={() => setOpenIndex(i * 10)}>
                            <div className="p-6 bg-white/[0.02] border border-white/5 hover:border-studio-neon/40 transition-all cursor-pointer flex items-center gap-6">
                                <div className="p-3 bg-black border border-white/10 text-studio-neon transition-transform group-hover:scale-110">
                                    {cat.icon}
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">{cat.title}</h4>
                                    <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1 italic">{cat.items.length} QUESTIONS</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="pt-12">
                        <div className="p-8 border-2 border-dashed border-white/5 rounded-none space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">STILL STUCK?</h5>
                            <Link href="/contact" className="flex items-center justify-center gap-4 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-studio-neon transition-all hover:scale-[1.02]">
                                <Mail size={14} /> CHAT WITH US
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. FAQ Terminal */}
                <div className="lg:col-span-8 space-y-12">
                    {categories.map((cat, catIdx) => (
                        <div key={catIdx} className="space-y-6">
                            <div className="flex items-center gap-4 text-white/10 mb-8 font-black uppercase tracking-[0.4em] text-[10px]">
                                <div className="w-2.5 h-2.5 border border-current" />
                                <span>{cat.title}</span>
                                <div className="h-px flex-1 bg-current" />
                            </div>

                            <div className="space-y-4">
                                {cat.items.map((item, i) => {
                                    const globalIdx = catIdx * 10 + i;
                                    const isOpen = openIndex === globalIdx;
                                    return (
                                        <div key={i} className={`border-2 transition-all ${isOpen ? 'border-studio-neon/40 bg-white/[0.03]' : 'border-white/5 bg-black'}`}>
                                            <button 
                                                onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                                                className="w-full p-6 text-left flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <span className={`text-[10px] font-black tracking-widest ${isOpen ? 'text-studio-neon' : 'text-white/20'}`}>
                                                        {catIdx+1}.{i+1}
                                                    </span>
                                                    <h3 className={`text-xs md:text-sm font-black uppercase tracking-tight italic transition-all ${isOpen ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                                                        {item.q}
                                                    </h3>
                                                </div>
                                                <ChevronDown size={14} className={`text-white/20 transition-transform ${isOpen ? 'rotate-180 text-studio-neon' : ''}`} />
                                            </button>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-10 pb-8 pt-2">
                                                            <div className="p-6 bg-black border border-white/5 text-xs text-white/40 leading-relaxed uppercase tracking-widest font-bold italic relative shadow-inner">
                                                                <div className="absolute top-0 left-0 w-1 h-full bg-studio-neon shadow-[0_0_10px_#a6e22e]" />
                                                                {item.a}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 📧 SUPPORT_PIPELINE */}
            <div className="mt-32 p-12 md:p-24 border-4 border-black bg-[#0a0a0a] relative overflow-hidden group shadow-[0_0_100px_rgba(166,226,46,0.05)] text-center">
                 {/* Visualizer Background */}
                 <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end gap-1 opacity-[0.03] pointer-events-none px-4">
                    {[...Array(60)].map((_, i) => (
                        <div key={i} className="w-px bg-white" style={{ height: `${Math.random() * 100}%` }} />
                    ))}
                 </div>

                 <div className="relative z-10 space-y-12">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-2 border-white/10 flex items-center justify-center mb-8 relative group cursor-crosshair">
                            <Image src="/Logo.png" alt="Samples Wala" width={32} height={32} className="brightness-0 invert opacity-40 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-studio-neon" />
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-studio-neon" />
                        </div>
                        <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter italic">TALK TO A REAL PERSON</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mt-4 leading-relaxed max-w-lg italic">
                            IF YOU CAN'T FIND THE ANSWER HERE, JUST DROP US A MESSAGE. <br/>
                            OUR SUPPORT TEAM IS READY TO HELP.
                        </p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <Link href="mailto:support@sampleswala.com" className="w-full md:w-auto px-16 py-6 border-2 border-white group relative hover:border-studio-neon transition-all overflow-hidden">
                            <div className="absolute inset-0 bg-studio-neon translate-y-full group-hover:translate-y-0 transition-transform" />
                            <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white group-hover:text-black flex items-center gap-4">
                                <Mail size={14} /> Email Support Team
                            </span>
                        </Link>
                        <Link href="/contact" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-studio-neon transition-colors italic underline underline-offset-8 decoration-white/10 hover:decoration-studio-neon">
                            VISIT SUPPORT PAGE
                        </Link>
                    </div>
                 </div>
            </div>

            <div className="mt-12 text-center opacity-10 flex flex-col md:flex-row justify-center items-center gap-8 text-[9px] font-black uppercase tracking-[0.6em] italic">
                <div className="flex items-center gap-4"><Zap size={14} /> Trusted by Producers</div>
                <div className="flex items-center gap-4"><ShieldQuestion size={14} /> Clear & Honest Policy</div>
                <div className="flex items-center gap-4"><Clock size={14} /> Fast Support Responses</div>
            </div>
        </div>
    )
}
