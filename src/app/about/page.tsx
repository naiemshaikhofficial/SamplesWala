'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Music, 
  Mic2, 
  Zap, 
  Target, 
  Compass, 
  ArrowRight, 
  Globe, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react'
import { SectionReveal } from '@/components/ui/SectionReveal'
import JsonLdSchema from '@/components/seo/JsonLdSchema'

export default function AboutPage() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-black text-white selection:bg-studio-neon selection:text-black overflow-x-hidden lg:pl-20">
      <JsonLdSchema type="person" />
      
      {/* 🚀 Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-20 py-32 border-b border-white/5 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-studio-neon/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-white/5 blur-[120px] rounded-full" />
        
        <div className="max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="h-[2px] w-12 bg-studio-neon" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-studio-neon font-mono">
              Based in Mumbai, India
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.85] italic mb-12"
          >
            Samples <span className="text-studio-neon">Wala</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="flex flex-col">
                <span className="text-lg md:text-2xl font-black uppercase tracking-tight text-white/40 italic">Founded by Naiem Shaikh (Nemo)</span>
                <span className="text-[10px] font-black text-studio-neon uppercase tracking-[0.4em]">A Team of 50+ Music Production Experts</span>
            </div>
          </motion.div>
        </div>

        {/* Overlay Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-5 scanline-bg z-20" />
      </section>

      {/* 🧬 Our Story */}
      <section className="px-6 md:px-20 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <SectionReveal className="relative group">
          <div className="absolute -inset-4 bg-studio-neon/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden border border-white/10 bg-white/[0.02]">
            <Image 
              src="https://imagizer.imageshack.com/img922/310/c8UQzL.jpg" 
              alt="Naiem Shaikh - Nemo" 
              fill 
              className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
              priority
            />
            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-black/20 mix-blend-overlay pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
               <div className="flex items-center gap-3 text-studio-neon font-mono text-[9px] font-black uppercase tracking-widest">
                  <Globe size={12} /> Available Worldwide
               </div>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={1} className="space-y-10">
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
            Our Journey <br/> <span className="text-studio-neon">in Sound.</span>
          </h2>
          
          <div className="space-y-6 text-lg md:text-xl font-medium text-white/50 leading-relaxed max-w-xl">
            <p>
              Founded by <span className="text-white font-black italic">Naiem Shaikh (Nemo)</span>, Samples Wala has grown from a personal project into a powerhouse team of over <span className="text-white">50+ Artists, Software Engineers, and Sound Designers</span>.
            </p>
            <p>
              Based in Mumbai, our mission is to provide the best sounds for modern music. Every sample in our collection is curated by our expert team to ensure it is a perfect tool for your music production.
            </p>
            <p>
              We bridge the gap between raw talent and professional quality, providing producers everywhere with the sounds they need to make hits.
            </p>
          </div>

          <div className="pt-8 border-t border-white/10 flex items-center gap-8">
             <div className="flex flex-col">
                <span className="text-3xl font-black text-white italic tracking-tighter">MUMBAI</span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Our Home</span>
             </div>
             <div className="h-10 w-px bg-white/10" />
             <div className="flex flex-col">
                <span className="text-3xl font-black text-white italic tracking-tighter">ACTIVE</span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Current Status</span>
             </div>
          </div>
        </SectionReveal>
      </section>

      {/* 🔭 Vision & Mission */}
      <section className="px-6 md:px-20 py-32 bg-white/[0.01] border-y border-white/5 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          
          {/* Mission Card */}
          <SectionReveal className="p-12 border border-white/10 bg-black relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 group-hover:text-studio-neon transition-all duration-500">
               <Target size={80} strokeWidth={1} />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="h-12 w-12 bg-studio-neon/10 border border-studio-neon/20 rounded-sm flex items-center justify-center">
                 <Zap className="text-studio-neon" size={24} />
              </div>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter">Our Mission</h3>
              <p className="text-xl text-white/40 font-bold leading-relaxed">
                "To create art that connects with people deeply — breaking boundaries through rhythm, emotion, and storytelling."
              </p>
            </div>
          </SectionReveal>

          {/* Vision Card */}
          <SectionReveal delay={1} className="p-12 border border-white/10 bg-black relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 group-hover:text-studio-neon transition-all duration-500">
               <Compass size={80} strokeWidth={1} />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center">
                 <Globe className="text-white" size={24} />
              </div>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter">Our Vision</h3>
              <p className="text-xl text-white/40 font-bold leading-relaxed">
                "To redefine what it means to be an independent artist in India by blending passion and innovation in every creation."
              </p>
            </div>
          </SectionReveal>

        </div>
      </section>

      {/* 🦾 Engineering the Future */}
      <section className="px-6 md:px-20 py-48 text-center relative overflow-hidden">
        {/* Background Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
           <span className="text-[20vw] font-black uppercase italic tracking-tighter">CREATIVE</span>
        </div>
        
        <SectionReveal className="max-w-4xl mx-auto space-y-12 relative z-10">
          <h3 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
            Making the <br/> <span className="text-studio-neon">Sounds of Tomorrow.</span>
          </h3>
          <p className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white/30 max-w-2xl mx-auto">
            Professional samples and education for music producers. We help you turn your talent into a career.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-12">
            <Link href="/browse" className="w-full md:w-auto px-12 py-6 bg-white text-black text-xs font-black uppercase tracking-[0.4em] hover:bg-studio-neon transition-all active:scale-95 flex items-center justify-center gap-4">
              BROWSE SOUNDS <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="w-full md:w-auto px-12 py-6 bg-transparent border-2 border-white/10 text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-white/5 transition-all active:scale-95">
              GET IN TOUCH
            </Link>
          </div>
        </SectionReveal>
      </section>

      {/* Spacing */}
      <div className="h-32 md:hidden" />
    </div>
  )
}
