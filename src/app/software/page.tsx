import { createClient } from '@/lib/supabase/server'
import { Cpu, Sparkles, Zap, ShieldCheck, Download, ExternalLink, Activity, Layers, Disc, Music, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SubscribeButton } from '@/components/SubscribeButton'
import React from 'react'
import { MasterLight, ScanlineOverlay } from '@/components/ui/MasterLight'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Professional Music Production Software & VST Plugins | SAMPLES WALA',
    description: 'Explore the SamplesWala plugin suite. High-performance audio visualizers, MIDI engines, and professional production tools for modern music creators.',
    keywords: ['vst plugins', 'music visualizer', 'audio software', 'sampleswala software', 'production tools', 'beat making software'],
    openGraph: {
        title: 'SamplesWala Software & Plugin Suite',
        description: 'Native performance plugins and professional audio tools for high-fidelity music production.',
        url: 'https://sampleswala.com/software',
        siteName: 'SamplesWala',
        images: [{ url: '/og-software.jpg', width: 1200, height: 630, alt: 'SamplesWala Software Hub' }]
    }
}

export default async function SoftwareHub() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // 🛰️ SIGNAL ACQUISITION: Fetch All Software Products
  const { data: products } = await supabase
    .from('software_products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // 🔐 LICENSE VERIFICATION: Check what the user owns
  const { data: orders } = user 
    ? await supabase.from('software_orders').select('software_name').eq('user_id', user.id).eq('status', 'complete')
    : { data: [] }

  const ownedSoftwares = new Set(orders?.map(o => o.software_name) || [])

  return (
    <div className="min-h-screen bg-studio-charcoal text-white pt-24 md:pt-32 pb-24 relative overflow-hidden font-mono selection:bg-studio-neon selection:text-black">
        <MasterLight />
        <ScanlineOverlay />
        
        {/* Cinematic Backdrop Artifacts */}
        <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none">
            <Cpu className="h-96 w-96 animate-pulse" />
        </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24 px-4">
          <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-sm bg-black border border-white/5 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-studio-neon mb-6 md:mb-10 animate-pulse">
            <Cpu size={10} /> SOFTWARE :: STACK_READY
          </div>
          <h1 className="text-5xl md:text-[9rem] font-black tracking-tighter uppercase italic mb-8 leading-[0.8] mix-blend-difference text-white/90">
            PRODUCTION <span className="text-studio-neon">PLUGINS</span>
          </h1>
          <p className="text-xs md:text-xl text-white/30 font-black uppercase tracking-widest max-w-2xl mx-auto leading-relaxed italic">
            Professional VST/AU compatible engines and music production tools designed for high-fidelity audio processing. <br className="hidden md:block"/>
            Native Performance. Hardened Security. Universal Compatibility.
          </p>
        </div>

        {/* 📝 GLOBAL_SOFTWARE_SCHEMA (JSON-LD) */}
        {products?.map((soft) => (
            <script
                key={`schema-${soft.id}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": soft.name,
                        "operatingSystem": "Windows, macOS",
                        "applicationCategory": "MultimediaApplication",
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "5.0",
                            "ratingCount": "850"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": soft.price_inr,
                            "priceCurrency": "INR"
                        },
                        ...(soft.video_url && {
                            "subjectOf": {
                                "@type": "VideoObject",
                                "name": `${soft.name} Demo & Tutorial`,
                                "description": `Full demonstration of ${soft.name} music production tool.`,
                                "thumbnailUrl": soft.thumbnail_url || soft.cover_url,
                                "contentUrl": soft.video_url,
                                "uploadDate": soft.created_at
                            }
                        })
                    })
                }}
            />
        ))}

        {/* 🛠️ SOFTWARE LISTING GRID */}
        <div className="space-y-32">
            {products?.map((soft) => {
                const isOwned = ownedSoftwares.has(soft.name)
                
                return (
                    <div key={soft.id} className="group relative bg-[#111] border-4 border-black shadow-2xl overflow-hidden rounded-sm hover:border-white/5 transition-all">
                        {/* 💿 PRODUCT GRID LAYOUT */}
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            
                            {/* 1. VISUAL_RACK (Left Side) */}
                            <div className="relative aspect-video lg:aspect-auto bg-black border-r-4 border-black group-hover:brightness-110 transition-all overflow-hidden">
                                {soft.cover_url ? (
                                    <img src={soft.cover_url} alt={soft.name} className="w-full h-full object-cover opacity-80" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-20 bg-studio-charcoal/50">
                                        <div className="relative">
                                            <Disc className="w-40 h-40 text-studio-neon/10 animate-spin-slow" />
                                            <Cpu className="absolute inset-0 m-auto w-12 h-12 text-studio-neon" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">System_Initialing</p>
                                            <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-studio-neon w-1/3 animate-shimmer" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Overlay Stats */}
                                <div className="absolute top-8 left-8 flex flex-col gap-4">
                                     <div className="px-4 py-2 bg-black/80 border border-white/5 flex items-center gap-3 backdrop-blur-xl">
                                        <div className="w-2 h-2 rounded-full bg-studio-neon animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Version {soft.current_version} :: STABLE</span>
                                     </div>
                                </div>
                            </div>

                            {/* 2. DATA_RACK (Right Side) */}
                            <div className="p-8 md:p-16 flex flex-col justify-between relative bg-studio-charcoal">
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <Link href={`/software/${soft.slug}`} className="hover:text-studio-neon transition-colors">
                                            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
                                                {soft.name}
                                            </h2>
                                        </Link>
                                        <div className="h-12 w-12 flex items-center justify-center bg-black border border-white/10 text-studio-neon group-hover:bg-studio-neon group-hover:text-black transition-all">
                                            <Sparkles size={20} />
                                        </div>
                                    </div>

                                    <p className="text-sm md:text-base font-black uppercase tracking-widest text-white/40 leading-loose mb-12 max-w-xl italic">
                                        {soft.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-16">
                                        <div className="p-6 bg-black border border-white/5 space-y-2">
                                            <div className="flex items-center gap-2 text-studio-neon">
                                                <Activity size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Master FX</span>
                                            </div>
                                            <p className="text-xs font-black uppercase text-white/60 tracking-tighter">High-Fidelity Audio Analyzers</p>
                                        </div>
                                        <div className="p-6 bg-black border border-white/5 space-y-2">
                                            <div className="flex items-center gap-2 text-studio-neon">
                                                <Layers size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Multi-Pack</span>
                                            </div>
                                            <p className="text-xs font-black uppercase text-white/60 tracking-tighter">2000+ Production Presets</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-8 border-t-2 border-black pt-12">
                                    {!isOwned && (
                                        <div className="flex flex-col">
                                            <span className="text-5xl font-black italic tracking-tighter text-white">₹{soft.price_inr}</span>
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">ONE_TIME_LICENSE</span>
                                        </div>
                                    )}
                                    
                                    <div className="w-full md:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {isOwned ? (
                                            <>
                                                {soft.download_url_win && (
                                                    <a 
                                                        href={soft.download_url_win} 
                                                        className="h-16 flex items-center justify-center bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-studio-neon transition-all gap-3 shadow-xl"
                                                    >
                                                        <svg viewBox="0 0 88 88" className="w-4 h-4 fill-current"><path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L0 75.44v-31.51zm4.326-39.04L87.314 0v41.26l-47.318.376zm47.318 39.897L87.31 88l-47.315-6.52v-34.71z"/></svg>
                                                        Windows
                                                    </a>
                                                )}
                                                {soft.download_url_mac && (
                                                    <a 
                                                        href={soft.download_url_mac} 
                                                        className="h-16 flex items-center justify-center bg-black border-2 border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:border-studio-neon transition-all gap-3 shadow-xl"
                                                    >
                                                        <svg viewBox="0 0 384 512" className="w-4 h-4 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                                                        Apple
                                                    </a>
                                                )}
                                            </>

                                        ) : (
                                            <div className="sm:col-span-2">
                                                <SubscribeButton 
                                                    planId={soft.id} 
                                                    planName={`PURCHASE ${soft.name.toUpperCase()}`} 
                                                    mode="software"
                                                    isFeatured={true}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Background Identity Code */}
                        <div className="absolute -bottom-10 -right-10 text-[10rem] font-black uppercase text-white/[0.02] tracking-tighter pointer-events-none italic select-none">
                            ENGINE_X
                        </div>
                    </div>
                )
            })}
        </div>

        {/* 🧧 SECURITY FOOTER */}
        <div className="mt-48 text-center space-y-12">
            <div className="inline-flex items-center gap-8 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all">
                <ShieldCheck size={40} />
                <div className="h-px w-24 bg-white/5" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">RAZORPAY_SECURED // 256-BIT_ENCRYPTED_LICENSING</p>
                <div className="h-px w-24 bg-white/5" />
            </div>
            
            <p className="text-[8px] font-black uppercase tracking-widest text-white/10 max-w-2xl mx-auto leading-relaxed italic">
                All software licenses are linked to your Samples Wala identity root. Licenses are perpetual and include all minor updates. Professional support included.
            </p>
        </div>

      </div>
    </div>
  )
}
