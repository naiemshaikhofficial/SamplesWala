'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Diamond, Crown, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function SubscriptionFeature() {
  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden border-y-4 border-white/5">
      {/* 🧬 AMBIENT_BACKGROUND_GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-studio-neon/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* ⬅️ LEFT: VALUE_PROPOSITION */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon bg-studio-neon/5 px-4 py-1 self-start border-l-4 border-studio-neon">
                Membership :: Global Access
              </div>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] italic">
                STUDIO<br />
                <span className="text-studio-neon">MEMBERSHIP</span>
              </h2>
              <p className="text-lg md:text-2xl text-white/40 font-bold italic leading-tight max-w-xl">
                Unlock the full power of SamplesWala. Get monthly credits, exclusive sounds, and a professional commercial license.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <Zap className="text-studio-neon" />, title: "Monthly Credits", desc: "Up to 500 tokens every 30 days" },
                { icon: <Diamond className="text-studio-neon" />, title: "Premium Access", desc: "Unlock exclusive artist series" },
                { icon: <Crown className="text-studio-neon" />, title: "Pro License", desc: "100% royalty-free commercial clearance" },
                { icon: <Sparkles className="text-studio-neon" />, title: "Crate Digging", desc: "Advanced AI-powered sound discovery" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="shrink-0 mt-1">{item.icon}</div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white">{item.title}</h4>
                    <p className="text-[9px] font-bold text-white/30 uppercase italic">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8">
               <Link href="/subscription" className="group inline-flex items-center gap-6 px-12 py-6 bg-studio-neon text-black font-black uppercase tracking-[0.3em] italic hover:scale-105 transition-all shadow-[0_0_50px_rgba(166,226,46,0.3)]">
                  View Studio Plans <ArrowRight className="group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>
          </div>

          {/* ➡️ RIGHT: VISUAL_CARD_STACK */}
          <div className="relative aspect-square lg:aspect-auto h-full min-h-[500px] flex items-center justify-center">
             <div className="absolute inset-0 bg-studio-neon/5 rounded-full blur-[100px] animate-pulse" />
             
             {/* 🎚️ THE_PREMIUM_CARD */}
             <motion.div 
               initial={{ rotateY: 15, rotateX: 10, y: 0 }}
               whileInView={{ rotateY: -15, rotateX: -10, y: -20 }}
               transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
               className="w-full max-w-md bg-[#0a0a0a] border-2 border-white/10 p-8 shadow-2xl relative z-20 group"
             >
                {/* Card UI Header */}
                <div className="flex justify-between items-center mb-12">
                   <div className="w-12 h-12 bg-studio-neon rounded-full flex items-center justify-center text-black font-black italic shadow-[0_0_20px_#a6e22e]">SW</div>
                   <div className="px-3 py-1 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-studio-neon transition-colors">Digital Identity</div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Status: <span className="text-studio-neon">Active</span></p>
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter">STUDIO PRO</h3>
                   </div>

                   {/* Visual Meter */}
                   <div className="h-1 w-full bg-white/5 relative overflow-hidden">
                      <motion.div 
                        initial={{ width: "10%" }}
                        whileInView={{ width: "85%" }}
                        transition={{ duration: 2, delay: 0.5 }}
                        className="absolute inset-y-0 left-0 bg-studio-neon" 
                      />
                   </div>

                   <div className="flex justify-between items-end pt-12">
                      <div className="space-y-1">
                         <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">VALID THRU</p>
                         <p className="text-lg font-black italic">12 / 29</p>
                      </div>
                      <div className="h-10 w-16 bg-gradient-to-br from-white/10 to-transparent border border-white/10" />
                   </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-20 h-20 border-t-2 border-r-2 border-studio-neon/40 opacity-0 group-hover:opacity-100 transition-all p-2" />
                <div className="absolute -bottom-10 -left-10 w-20 h-20 border-b-2 border-l-2 border-studio-neon/40 opacity-0 group-hover:opacity-100 transition-all" />
             </motion.div>

             {/* Background Floating Elements */}
             <div className="absolute top-1/4 right-0 w-32 h-32 bg-white/5 border border-white/5 rotate-45 -z-10 blur-sm" />
             <div className="absolute bottom-1/4 left-10 w-24 h-24 bg-studio-neon/10 rounded-full -z-10 blur-xl animate-bounce" style={{ animationDuration: '4s' }} />
          </div>

        </div>
      </div>
    </section>
  )
}
