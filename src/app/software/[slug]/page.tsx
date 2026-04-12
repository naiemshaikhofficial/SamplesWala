import { createClient } from '@/lib/supabase/server'
import { Cpu, Sparkles, Zap, ShieldCheck, Download, Activity, Layers, Disc, Music, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SubscribeButton } from '@/components/SubscribeButton'
import React from 'react'
import { MasterLight, ScanlineOverlay } from '@/components/ui/MasterLight'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data: soft } = await supabase.from('software_products').select('*').eq('slug', slug).single()
    
    if (!soft) return { title: 'Software Not Found | SamplesWala' }

    // 🚀 NUCLEAR SEO: VISUALIZER STUDIO EXCLUSIVE
    if (slug === 'visualizer-studio') {
        return {
            title: 'Visualizer Studio | Best Music Audio Visualizer Software - SamplesWala',
            description: 'Create stunning audio-reactive music visualizers in seconds. The ultimate Visualizer Software for music producers, beatmakers, and YouTubers. Export high-quality music visualizer videos fast.',
            keywords: ['music visualizer', 'audio visualizer software', 'beat visualizer maker', 'podcast visualizer', 'audio reactive video', 'FL Studio visualizer alternative', 'after effects audio spectrum maker'],
            openGraph: {
                title: 'Visualizer Studio - Fast Music Visualizer Software',
                description: 'Transform your audio into eye-catching visual experiences effortlessly. Get the ultimate VST/Standalone visualizer engine.',
                type: 'website',
                siteName: 'SamplesWala',
                ...(soft.cover_url && { images: [{ url: soft.cover_url }] })
            },
            twitter: {
                card: 'summary_large_image',
                title: 'Visualizer Studio by SamplesWala',
                description: 'The fastest way to generate professional audio-reactive videos for your beats.',
                ...(soft.cover_url && { images: [soft.cover_url] })
            }
        }
    }

    // Default Fallback SEO
    return {
      title: `${soft.name} | Professional Music Software | SamplesWala`,
      description: soft.description,
      openGraph: {
        title: `${soft.name} | SamplesWala`,
        description: soft.description,
        type: 'website',
        ...(soft.cover_url && { images: [{ url: soft.cover_url }] })
      }
    }
}

export default async function SoftwareDetailPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // 🛰️ SIGNAL ACQUISITION: Fetch Specific Software Component
  const { data: soft, error } = await supabase
    .from('software_products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !soft) {
      notFound()
  }

  // 🔐 LICENSE VERIFICATION: Check what the user owns
  const { data: order } = user 
    ? await supabase.from('software_orders').select('*').eq('user_id', user.id).eq('software_name', soft.name).eq('status', 'complete').maybeSingle()
    : { data: null }

  const isOwned = !!order

  return (
    <div className="min-h-screen bg-studio-charcoal text-white pt-24 md:pt-32 pb-24 relative overflow-hidden font-mono selection:bg-studio-neon selection:text-black">
        <MasterLight />
        <ScanlineOverlay />
        
        {/* Cinematic Backdrop Artifacts */}
        <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none">
            <Cpu className="h-96 w-96 animate-pulse" />
        </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="mb-12">
            <Link href="/software" className="inline-flex items-center gap-4 text-studio-neon hover:text-white transition-colors uppercase font-black tracking-[0.4em] italic text-xs">
                <ArrowLeft size={16} /> Return to Software Stack
            </Link>
        </div>

        {/* 📝 GLOBAL_SOFTWARE_SCHEMA (JSON-LD) */}
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                    slug === 'visualizer-studio' 
                    ? [
                        {
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            "name": "Visualizer Studio",
                            "operatingSystem": "Windows, macOS",
                            "applicationCategory": "MultimediaApplication",
                            "description": "Create stunning audio-reactive music visualizers in seconds. The ultimate Visualizer Software for music producers and YouTubers.",
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": "4.9",
                                "ratingCount": "1284"
                            },
                            "offers": {
                                "@type": "Offer",
                                "price": soft.price_inr,
                                "priceCurrency": "INR"
                            }
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "What is the best music visualizer software?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Visualizer Studio by SamplesWala is one of the fastest and most powerful music visualizer software. It allows you to create audio-reactive videos, beat visualizers, and podcast visualizers in seconds."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Can I use Visualizer Studio to upload beats to YouTube?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Yes, it is perfectly optimized for YouTubers and music producers wanting to upload their instrumental beats with a high-quality audio reactive background."
                                    }
                                }
                            ]
                        }
                    ] 
                    : {
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
                        }
                    }
                )
            }}
        />

        {/* 🛠️ SOFTWARE HERO UNIT */}
        <div className="group relative bg-[#090909] border-[2px] border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden lg:rounded-xl hover:border-white/10 transition-all duration-[1s]">
            {/* Cinematic animated dust/grid layer */}
            <div className="absolute inset-0 bw-grid opacity-20 group-hover:opacity-40 transition-opacity duration-[2s] pointer-events-none" />
            
            {/* 💿 PRODUCT GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
                
                {/* 1. VISUAL_RACK (Left Side) */}
                <div className="relative aspect-square bg-[#000] border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60" />
                    {soft.cover_url ? (
                        <img src={soft.cover_url} alt={soft.name} className="w-full h-full object-contain lg:object-center object-top p-8 lg:p-12 opacity-80 group-hover:scale-[1.02] group-hover:opacity-100 transition-all duration-[2s]" />
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
                    <div className="absolute top-8 left-8 flex flex-col gap-4 z-20">
                            <div className="px-5 py-2.5 bg-black/90 border border-white/10 flex items-center gap-3 backdrop-blur-xl shadow-xl rounded-sm">
                            <div className="w-2 h-2 rounded-full bg-studio-neon animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">Version {soft.current_version}</span>
                            </div>
                    </div>
                </div>

                {/* 2. DATA_RACK (Right Side) */}
                <div className="relative aspect-square p-8 md:p-12 lg:p-16 flex flex-col bg-gradient-to-b from-[#111] to-[#0a0a0a] overflow-y-auto custom-scrollbar">
                    <div className="flex-1">
                        <div className="flex gap-3 mb-8 flex-wrap">
                            <span className="px-4 py-1.5 bg-studio-neon text-black text-[9px] font-black uppercase tracking-[0.3em] shadow-[0_0_15px_rgba(166,226,46,0.2)] rounded-sm">Studio Engine</span>
                            <span className="px-4 py-1.5 bg-[#1a1a1a] text-white text-[9px] font-black uppercase tracking-[0.3em] border border-white/10 rounded-sm">Perpetual License</span>
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-5xl md:text-[5rem] lg:text-[6.5rem] font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30 leading-[0.85] pb-2 drop-shadow-2xl">
                                {soft.name}
                            </h2>
                            <div className="hidden md:flex h-16 w-16 items-center justify-center bg-black border border-white/10 text-studio-neon group-hover:bg-studio-neon group-hover:text-black transition-colors duration-500 rounded-lg shadow-2xl shrink-0">
                                <Sparkles size={24} />
                            </div>
                        </div>

                        <p className="text-sm md:text-lg font-medium text-white/50 leading-relaxed mb-12 max-w-2xl font-sans tracking-wide">
                            {soft.long_description || soft.description}
                        </p>

                        {/* 🌟 DYNAMIC FEATURES LIST */}
                        {soft.main_features && soft.main_features.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
                                {soft.main_features.map((feat: string, idx: number) => {
                                    const parts = feat.split('–');
                                    const title = parts[0]?.trim() || feat;
                                    const subtitle = parts[1]?.trim() || '';
                                    return (
                                        <div key={idx} className="p-5 bg-black/40 border border-white/5 group/card hover:border-studio-neon/50 transition-colors relative overflow-hidden rounded-lg shadow-sm hover:shadow-[0_0_15px_rgba(166,226,46,0.05)]">
                                            <div className="flex items-center gap-3 text-studio-neon mb-2 relative z-10">
                                                <div className="p-1.5 bg-studio-neon/10 rounded-full shrink-0 group-hover/card:bg-studio-neon group-hover/card:text-black transition-colors">
                                                    <Zap size={12} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 drop-shadow-md truncate">{title}</span>
                                            </div>
                                            {subtitle && (
                                                <p className="text-[11px] font-black uppercase text-white/40 tracking-widest leading-relaxed relative z-10">{subtitle}</p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                                <div className="p-8 bg-[#050505] border border-white/5 group/card hover:border-studio-neon/50 transition-colors relative overflow-hidden rounded-lg shadow-xl hover:shadow-[0_0_30px_rgba(166,226,46,0.1)]">
                                    <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover/card:opacity-10 transition-opacity group-hover/card:scale-110 duration-500">
                                        <Activity size={100} />
                                    </div>
                                    <div className="flex items-center gap-3 text-studio-neon mb-6 relative z-10">
                                        <div className="p-2 bg-studio-neon/10 rounded-sm">
                                            <Activity size={16} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Audio Synthesis</span>
                                    </div>
                                    <p className="text-sm font-black uppercase text-white/70 tracking-widest leading-relaxed relative z-10">High-Fidelity Audio Analyzers & Responsive FX</p>
                                </div>
                                <div className="p-8 bg-[#050505] border border-white/5 group/card hover:border-studio-neon/50 transition-colors relative overflow-hidden rounded-lg shadow-xl hover:shadow-[0_0_30px_rgba(166,226,46,0.1)]">
                                    <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover/card:opacity-10 transition-opacity group-hover/card:scale-110 duration-500">
                                        <Layers size={100} />
                                    </div>
                                    <div className="flex items-center gap-3 text-studio-neon mb-6 relative z-10">
                                        <div className="p-2 bg-studio-neon/10 rounded-sm">
                                            <Layers size={16} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Master Pack</span>
                                    </div>
                                    <p className="text-sm font-black uppercase text-white/70 tracking-widest leading-relaxed relative z-10">2500+ Production Presets & VFX Templates</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-6 border-t border-white/10 pt-10 mt-auto">
                        {isOwned ? (
                            <div className="w-full space-y-5">
                                <div className="flex items-center gap-3 text-studio-neon">
                                    <ShieldCheck size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Active License Detected</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    {soft.download_url_win && (
                                        <a 
                                            href={soft.download_url_win} 
                                            className="h-16 flex items-center justify-center bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-studio-neon hover:scale-[1.02] active:scale-95 transition-all gap-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-sm"
                                        >
                                            <svg viewBox="0 0 88 88" className="w-5 h-5 fill-current"><path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L0 75.44v-31.51zm4.326-39.04L87.314 0v41.26l-47.318.376zm47.318 39.897L87.31 88l-47.315-6.52v-34.71z"/></svg>
                                            Windows Download
                                        </a>
                                    )}
                                    {soft.download_url_mac && (
                                        <a 
                                            href={soft.download_url_mac} 
                                            className="h-16 flex items-center justify-center bg-black border-2 border-white/20 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:border-studio-neon hover:text-black hover:scale-[1.02] active:scale-95 transition-all gap-4 shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-sm"
                                        >
                                            <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                                            Apple Download
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center gap-8 w-full bg-[#050505] border border-white/5 p-6 rounded-lg">
                                <div className="flex flex-col">
                                    <span className="text-5xl lg:text-6xl font-black italic tracking-tighter text-white drop-shadow-lg">₹{soft.price_inr}</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">ONE_TIME_LICENSE</span>
                                </div>
                                <div className="w-full sm:flex-1">
                                    <SubscribeButton 
                                        planId={soft.id} 
                                        planName={`PURCHASE ${soft.name.toUpperCase()}`} 
                                        mode="software"
                                        isFeatured={true}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Background Identity Code */}
            <div className="absolute -bottom-10 -right-10 text-[10rem] font-black uppercase text-white/[0.02] tracking-tighter pointer-events-none italic select-none">
                ENGINE_X
            </div>
        </div>

        {/* Dynamic Video Section (If Available) */}
        {soft.video_url && (
            <div className="mt-32">
                <div className="flex items-center gap-4 mb-12 text-white/10">
                    <Music className="h-6 w-6 text-studio-neon" />
                    <h2 className="text-3xl font-black uppercase tracking-[0.3em] italic">System Overview</h2>
                    <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="w-full aspect-video border-4 border-black bg-black rounded-sm overflow-hidden relative group shadow-2xl">
                    <iframe 
                        src={soft.video_url}
                        className="w-full h-full absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        )}

        {/* 📸 SCREENSHOT RACK */}
        {soft.screenshots && soft.screenshots.length > 0 && (
            <div className="mt-32">
                <div className="flex items-center gap-4 mb-12 text-white/10">
                    <Zap className="h-6 w-6 text-studio-neon" />
                    <h2 className="text-3xl font-black uppercase tracking-[0.3em] italic">Interface Preview</h2>
                    <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="overflow-x-auto pb-8 snap-x snap-mandatory hide-scroll flex gap-8">
                    {soft.screenshots.map((img: string, idx: number) => (
                        <div key={idx} className="w-full aspect-video border-4 border-black bg-black rounded-sm overflow-hidden snap-center shrink-0 relative group">
                            <img 
                                src={img} 
                                alt={`${soft.name} Interface Screenshot ${idx + 1}`} 
                                className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
                                loading="lazy"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* ⚙️ SYSTEM REQUIREMENTS */}
        {soft.system_requirements && (
             <div className="mt-32 bg-[#111] border border-white/5 p-8 md:p-12 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-all">
                    <Cpu size={250} />
                 </div>
                 <div className="flex items-center gap-4 mb-10 text-white">
                    <Cpu className="h-5 w-5 text-studio-neon" />
                    <h3 className="text-xl font-black uppercase tracking-[0.3em] italic">System Architecture</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {Object.entries(soft.system_requirements).flatMap(([key, value]) => {
                        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                            return Object.entries(value).map(([subKey, subValue]) => (
                                <div key={`${key}-${subKey}`} className="space-y-3 p-6 bg-black/50 border border-white/5 rounded hover:border-studio-neon/30 transition-colors">
                                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-studio-neon opacity-80">{subKey.replace(/_/g, ' ')}</p>
                                     <p className="text-base font-medium text-white/80">{String(subValue)}</p>
                                </div>
                            ))
                        }
                        return [(
                            <div key={key} className="space-y-3 p-6 bg-black/50 border border-white/5 rounded hover:border-studio-neon/30 transition-colors">
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-studio-neon opacity-80">{key.replace(/_/g, ' ')}</p>
                                 <p className="text-base font-medium text-white/80">{String(value)}</p>
                            </div>
                        )]
                    })}
                 </div>
             </div>
        )}

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
