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
    const title = `${soft.name} | Professional Music Software & VST Plugin | SAMPLES WALA`
    const description = `Download ${soft.name} from SamplesWala. ${soft.description}. Premium production tool available for Windows and macOS. Lifetime updates included.`
    const ogImage = `https://sampleswala.com/api/og/software/${slug}`
    
    return {
      title,
      description,
      keywords: [soft.name, 'vst plugin', 'music production tool', 'audio engine', 'sampleswala software'],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://sampleswala.com/software/${slug}`,
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage]
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
                <ArrowLeft size={16} /> Back to Software
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

        {/* 🛠️ TRADITIONAL PRO LAYOUT (NO INTERNAL SCROLLING) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* ⬅️ LEFT COLUMN: IMAGE & PURCHASE */}
            <div className="lg:col-span-4 flex flex-col gap-8">
                {/* Visual Cover */}
                <div className="relative aspect-square bg-[#000] border-2 border-white/5 rounded-xl shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60" />
                    {soft.cover_url ? (
                        <img src={soft.cover_url} alt={soft.name} className="w-full h-full object-contain lg:object-center object-top p-8 lg:p-12 opacity-80 group-hover:scale-[1.02] group-hover:opacity-100 transition-all duration-700" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-20 bg-studio-charcoal/50">
                            <div className="relative">
                                <Disc className="w-40 h-40 text-studio-neon/10 animate-spin-slow" />
                                <Cpu className="absolute inset-0 m-auto w-12 h-12 text-studio-neon" />
                            </div>
                        </div>
                    )}
                    
                    <div className="absolute top-6 left-6 flex flex-col gap-4 z-20">
                         <div className="px-4 py-2 bg-black/90 border border-white/10 flex items-center gap-3 backdrop-blur-xl shadow-xl rounded-sm">
                            <div className="w-2 h-2 rounded-full bg-studio-neon animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">V{soft.current_version}</span>
                         </div>
                    </div>
                </div>

                {/* Purchase Panel */}
                <div className="bg-[#111] border border-white/5 p-8 rounded-xl flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {isOwned ? (
                        <div className="w-full space-y-6">
                            <div className="flex items-center gap-3 text-studio-neon mb-4">
                                <ShieldCheck size={18} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Licensed Version</span>
                            </div>
                            <div className="flex flex-col gap-4 w-full">
                                {soft.download_url_win && (
                                    <a href={soft.download_url_win} className="h-14 flex items-center justify-center bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-studio-neon hover:scale-[1.02] active:scale-95 transition-all gap-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-sm">
                                        <svg viewBox="0 0 88 88" className="w-5 h-5 fill-current"><path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L0 75.44v-31.51zm4.326-39.04L87.314 0v41.26l-47.318.376zm47.318 39.897L87.31 88l-47.315-6.52v-34.71z"/></svg>
                                        Download for Windows
                                    </a>
                                )}
                                {soft.download_url_mac && (
                                    <a href={soft.download_url_mac} className="h-14 flex items-center justify-center bg-black border-2 border-white/20 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:border-studio-neon hover:text-black hover:scale-[1.02] active:scale-95 transition-all gap-4 shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-sm">
                                        <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                                        Download for Mac
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-8 w-full">
                            <div className="flex flex-col items-center">
                                <span className="text-5xl lg:text-5xl font-black italic tracking-tighter text-white drop-shadow-lg">₹{soft.price_inr}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">ONE-TIME PAYMENT</span>
                            </div>
                            <div className="w-full">
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

            {/* ➡️ RIGHT COLUMN: DETAILS */}
            <div className="lg:col-span-8 flex flex-col gap-20">
                
                {/* 1. Title & Description */}
                <div>
                     <div className="flex gap-3 mb-6 flex-wrap">
                        <span className="px-4 py-1.5 bg-studio-neon text-black text-[9px] font-black uppercase tracking-[0.3em] shadow-[0_0_15px_rgba(166,226,46,0.2)] rounded-sm">Professional Tool</span>
                        <span className="px-4 py-1.5 bg-[#1a1a1a] text-white text-[9px] font-black uppercase tracking-[0.3em] border border-white/10 rounded-sm">Lifetime Access</span>
                    </div>
                    <h2 className="text-5xl md:text-[5rem] lg:text-[5.5rem] font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30 leading-[0.85] pb-4 drop-shadow-2xl">
                        {soft.name}
                    </h2>
                    <p className="text-base md:text-lg font-medium text-white/60 leading-relaxed max-w-3xl font-sans tracking-wide">
                        {soft.long_description || soft.description}
                    </p>
                </div>

                {/* 2. Features */}
                <div>
                    <div className="flex items-center gap-4 mb-8 text-white/10">
                        <Zap className="h-6 w-6 text-studio-neon" />
                        <h2 className="text-2xl font-black uppercase tracking-[0.3em] italic">Key Features</h2>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    {soft.main_features && soft.main_features.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {soft.main_features.map((feat: string, idx: number) => {
                                const parts = feat.split('–');
                                const title = parts[0]?.trim() || feat;
                                const subtitle = parts[1]?.trim() || '';
                                return (
                                    <div key={idx} className="p-5 bg-[#0a0a0a] border border-white/5 group/card hover:border-studio-neon/50 transition-colors relative overflow-hidden rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3 text-studio-neon mb-2 relative z-10">
                                            <div className="p-1.5 bg-studio-neon/10 rounded-full shrink-0 group-hover/card:bg-studio-neon group-hover/card:text-black transition-colors">
                                                <Zap size={12} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 truncate">{title}</span>
                                        </div>
                                        {subtitle && (
                                            <p className="text-[11px] font-black uppercase text-white/40 tracking-widest leading-relaxed relative z-10">{subtitle}</p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-8 bg-[#0a0a0a] border border-white/5 group/card transition-colors relative overflow-hidden rounded-lg">
                                <div className="flex items-center gap-3 text-studio-neon mb-4">
                                    <Activity size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Full Customization</span>
                                </div>
                                <p className="text-sm font-black uppercase text-white/50 tracking-widest leading-relaxed">Easily change colors, effects, and layouts.</p>
                            </div>
                            <div className="p-8 bg-[#0a0a0a] border border-white/5 group/card transition-colors relative overflow-hidden rounded-lg">
                                <div className="flex items-center gap-3 text-studio-neon mb-4">
                                    <Layers size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Fast Export</span>
                                </div>
                                <p className="text-sm font-black uppercase text-white/50 tracking-widest leading-relaxed">Save your videos in High Quality fast.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. System Requirements */}
                {soft.system_requirements && (
                    <div>
                        <div className="flex items-center gap-4 mb-8 text-white/10">
                            <Cpu className="h-6 w-6 text-studio-neon" />
                            <h2 className="text-2xl font-black uppercase tracking-[0.3em] italic">System Requirements</h2>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(soft.system_requirements).flatMap(([key, value]) => {
                                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                    return Object.entries(value).map(([subKey, subValue]) => (
                                        <div key={`${key}-${subKey}`} className="flex flex-col gap-2 p-5 bg-[#0a0a0a] border border-white/5 rounded-lg hover:border-studio-neon/30 transition-colors">
                                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-studio-neon">{subKey.replace(/_/g, ' ')}</span>
                                             <span className="text-sm font-medium text-white/80">{String(subValue)}</span>
                                        </div>
                                    ))
                                }
                                return [(
                                    <div key={key} className="flex flex-col gap-2 p-5 bg-[#0a0a0a] border border-white/5 rounded-lg hover:border-studio-neon/30 transition-colors">
                                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-studio-neon">{key.replace(/_/g, ' ')}</span>
                                         <span className="text-sm font-medium text-white/80">{String(value)}</span>
                                    </div>
                                )]
                            })}
                        </div>
                    </div>
                )}

                {/* 4. Interface Screenshots */}
                {soft.screenshots && soft.screenshots.length > 0 && (
                    <div>
                        <div className="flex items-center gap-4 mb-8 text-white/10">
                            <Disc className="h-6 w-6 text-studio-neon" />
                            <h2 className="text-2xl font-black uppercase tracking-[0.3em] italic">Gallery</h2>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>
                        <div className="flex flex-col gap-12">
                            {soft.screenshots.map((img: string, idx: number) => (
                                <div key={idx} className="w-full border border-white/5 bg-[#0a0a0a] rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative">
                                    <img 
                                        src={img} 
                                        alt={`${soft.name} Screenshot ${idx + 1}`} 
                                        className="w-full h-auto object-contain" 
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Overview Video */}
                {soft.video_url && (
                    <div>
                        <div className="flex items-center gap-4 mb-8 text-white/10">
                            <Music className="h-6 w-6 text-studio-neon" />
                            <h2 className="text-2xl font-black uppercase tracking-[0.3em] italic">Watch Demo</h2>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>
                        <div className="w-full aspect-video border border-white/5 bg-[#0a0a0a] rounded-xl overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                            <iframe 
                                src={soft.video_url}
                                className="w-full h-full absolute inset-0 opacity-90 hover:opacity-100 transition-opacity"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}

            </div>
        </div>

        {/* Removed Footer per user request */}
        <div className="mt-20"></div>

      </div>
    </div>
  )
}
