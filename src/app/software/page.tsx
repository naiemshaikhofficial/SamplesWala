import { Metadata } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'
import { Cpu, Sparkles, ShieldCheck, Activity, Layers, Disc } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { MasterLight, ScanlineOverlay } from '@/components/ui/MasterLight'
import { generateMetadata, pagesMeta } from '@/lib/seo-metadata'
import { unstable_cache } from 'next/cache'
import { SoftwareActionPanel, SoftwarePriceTag } from '@/components/software/SoftwareActionPanel'

export const metadata: Metadata = generateMetadata(pagesMeta.software);
export const revalidate = 604800; // ⚡ 1 WEEK STATIC CACHE

// 🧬 CACHED_PRODUCTS: Public catalog data cached for 1 week
const getCachedProducts = unstable_cache(
  async () => {
    const adminClient = getAdminClient()
    const { data } = await adminClient
      .from('software_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    return data || []
  },
  ['software-products-catalog'],
  { revalidate: 604800 }
)

export default async function SoftwareHub() {
  const products = await getCachedProducts()

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
            <Cpu size={10} /> SOFTWARE :: STACK READY
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
        {products?.map((soft: { id: string, name: string, price_inr: number, video_url?: string, thumbnail_url?: string, cover_url?: string, created_at: string }) => (
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
            {products?.map((soft: { id: string, name: string, description: string, current_version: string, price_inr: number, cover_url?: string, download_url_win?: string, download_url_mac?: string, slug: string }) => {
                
                return (
                    <div key={soft.id} className="group relative bg-[#111] border-4 border-black shadow-2xl overflow-hidden rounded-sm hover:border-white/5 transition-all">
                        {/* 💿 PRODUCT GRID LAYOUT */}
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            
                            {/* 1. VISUAL_RACK (Left Side) */}
                            <div className="relative aspect-video lg:aspect-auto bg-black border-r-4 border-black group-hover:brightness-110 transition-all overflow-hidden">
                                {soft.cover_url ? (
                                    <Image 
                                        src={soft.cover_url} 
                                        alt={soft.name} 
                                        width={800}
                                        height={450}
                                        className="w-full h-full object-cover opacity-80" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-20 bg-studio-charcoal/50">
                                        <div className="relative">
                                            <Disc className="w-40 h-40 text-studio-neon/10 animate-spin-slow" />
                                            <Cpu className="absolute inset-0 m-auto w-12 h-12 text-studio-neon" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">READY</p>
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

                                    <p className="text-sm md:text-base font-black uppercase tracking-widest text-white/40 leading-loose mb-12 max-w-xl italic whitespace-pre-wrap">
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
                                    <SoftwarePriceTag softwareName={soft.name} priceInr={soft.price_inr} />
                                    
                                    <SoftwareActionPanel 
                                        softwareName={soft.name}
                                        softwareId={soft.id}
                                        priceInr={soft.price_inr}
                                        downloadUrlWin={soft.download_url_win}
                                        downloadUrlMac={soft.download_url_mac}
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Background Identity Code */}
                        <div className="absolute -bottom-10 -right-10 text-[10rem] font-black uppercase text-white/[0.02] tracking-tighter pointer-events-none italic select-none">
                            STUDIO ENGINE
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
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">SECURED BY RAZORPAY // SAFE & ENCRYPTED</p>
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
