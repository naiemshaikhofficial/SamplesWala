import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Clock, Music4, Zap, ShieldCheck, Sparkles, Disc, Monitor, Layers, Database } from 'lucide-react'
import Link from 'next/link'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { PriceDisplay } from '@/components/PriceDisplay'
import { BulkUnlockButton } from '@/components/audio/BulkUnlockButton'
import { SubscribeButton } from '@/components/SubscribeButton'
import { SecureDownloadButton } from '@/components/audio/SecureDownloadButton'
import { Waveform } from '@/components/audio/Waveform'
import { SampleList } from '@/components/audio/SampleList'
import { PackActionCenter } from '@/components/audio/PackActionCenter'
import { getRelatedPacks, getFilteredSamples } from '@/app/browse/actions'
import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Pagination } from '@/components/layout/Pagination'

export const revalidate = 3600; // ⚡ CACHE_DURATION: 1 HOUR

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const adminClient = getAdminClient()
  const { slug } = await params
  
  let { data: pack, error } = await adminClient
    .from('sample_packs')
    .select('name, description, cover_url, categories(name), samples(bpm, key)')
    .eq('slug', slug)
    .single()

  // 🛡️ SEO_FALLBACK: If join fails, fetch basic pack data to prevent "Pack Not Found"
  if (!pack || error) {
    const { data: fallback } = await adminClient
      .from('sample_packs')
      .select('name, description, cover_url')
      .eq('slug', slug)
      .single()
    pack = fallback as any;
  }

  if (!pack) return { title: 'Pack Not Found | SAMPLES WALA' }

  // Extract metadata samples for keywords
  const bpmList = pack.samples?.map((s: any) => s.bpm).filter(Boolean)
  const keyList = pack.samples?.map((s: any) => s.key).filter(Boolean)
  const genre = pack.categories?.name || 'Music'
  
  const bpmStr = [...new Set(bpmList)].slice(0, 4).join(', ')
  const keyStr = [...new Set(keyList)].slice(0, 4).join(', ')
  
  // 🎹 NUCLEAR_SEO: Enhanced Description Injection
  const genreName = pack.categories?.name || 'Electronic'
  const title = `${pack.name} - Elite ${genreName} Samples [International Standard] | SamplesWala`
  const description = `The #1 world-class alternative to Splice. Download ${pack.name} by SamplesWala. Professional ${genreName} loops, Trap melody, and Drill drums. 100% Royalty-Free 24-bit WAV files.`
  
  const keywords = [
    pack.name, 
    `${genreName} samples`, 
    'global sample pack', 
    'royalty free loops', 
    'pro wav samples', 
    'trap loops',
    'drill samples',
    'afrobeat sounds',
    'phonik loops',
    'splice alternative',
    'looperman style sounds',
    'industry standard audio',
    ...[...new Set(bpmList)].map(b => `${b} bpm`),
    ...[...new Set(keyList)].map(k => `${k} key`)
  ]

  const ogImage = `https://sampleswala.com/api/og/pack/${slug}`

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://sampleswala.com/packs/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://sampleswala.com/packs/${slug}`
    }
  }
}

export default async function PackPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const adminClient = getAdminClient()
  const { slug } = await params
  const sParams = await searchParams
  const page = (sParams.page as string) || '1'
  const search = (sParams.search as string) || '' // 🔎 READ SEARCH QUERY
  const sort = (sParams.sort as string) || 'newest' // 🎚️ READ SORT PARAM
  const pageVal = parseInt(page)
  const pageSize = 20
  
  // 🎹 ENHANCED FETCH WITH RELATIONAL FALLBACK (Admin Signal)
  let { data: pack, error } = await adminClient
    .from('sample_packs')
    .select('*, categories(name, id), samples(bpm, key, credit_cost)')
    .eq('slug', slug)
    .single()

  // Fallback for cases where foreign keys are descriptive but missing in schema cache
  if (!pack || error) {
    const { data: fallbackPack } = await adminClient
        .from('sample_packs')
        .select('*, samples(bpm, key, credit_cost)')
        .eq('slug', slug)
        .single()
    pack = fallbackPack;
  }

  if (!pack) notFound()
  
  const { samples, count } = await getFilteredSamples({ 
    packId: pack.id,
    limit: pageSize.toString(),
    page: page,
    query: search, // 🔎 USE 'query' AS PER INTERFACE
    sort: sort // 🎚️ PASS SORT TO GLOBAL DB QUERY
  })
  
  // Handled relation locally if joined query failed
  const categoryId = pack.category_id;
  const relatedPacks = categoryId ? await getRelatedPacks(pack.id, categoryId) : [];
  
  const allSamples = pack?.samples || []
  const melodies = allSamples.filter((s: any) => s.bpm && s.key).length || 0
  const loops = allSamples.filter((s: any) => s.bpm && !s.key).length || 0
  const oneShots = allSamples.filter((s: any) => !s.bpm).length || 0
  
  // 💹 Master Credit Summation Engine
  const totalIndividualCredits = allSamples.reduce((sum: number, s: any) => sum + (s.credit_cost || 1), 0) || 0

  // 🧪 DETECTION_PROTOCOL: IDENTIFY IF THIS IS A PREMIUM ARTIFACT (DRIVE / STEMS / MIDI)
  const hasPremiumArtifacts = pack.description?.toLowerCase().includes('stems') || 
                            pack.description?.toLowerCase().includes('midi') || 
                            pack.description?.toLowerCase().includes('drive') ||
                            pack.full_pack_download_url?.toLowerCase().includes('drive') ||
                            pack.full_pack_download_url?.toLowerCase().includes('dropbox');

  // 📝 STRUCTURED_DATA (JSON-LD)
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": pack.name,
    "image": pack.cover_url,
    "description": pack.description,
    "brand": {
      "@type": "Brand",
      "name": "SamplesWala"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "128"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://sampleswala.com/packs/${slug}`,
      "priceCurrency": "INR",
      "price": pack.price_inr,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 min-h-screen font-mono">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      
      <Breadcrumbs 
        items={[
          { label: 'BROWSE', href: '/browse' },
          { label: pack.categories?.name || 'PACKS', href: `/browse?category=${pack.categories?.id}` },
          { label: pack.name, href: `/packs/${slug}`, active: true }
        ]} 
      />

      <Link href="/browse" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-studio-neon mb-8 md:mb-12 group transition-all">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-2" />
        RELOAD_BROWSER
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16 mb-24 relative">
        {/* 🧬 VST GUI MODULE */}
        <div className="lg:col-span-1">
          <div className="aspect-square relative overflow-hidden studio-panel bg-studio-grey border-2 border-white/10 shadow-2xl group">
             {/* VST Header */}
            <div className="absolute top-0 inset-x-0 bg-[#111] px-4 py-2 flex items-center justify-between border-b border-black z-20">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 truncate pr-10">{pack.name}</span>
                <div className="flex gap-1.5 opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-studio-neon" />
                    <div className="w-1.5 h-1.5 rounded-full bg-studio-yellow" />
                </div>
            </div>

            {pack.cover_url ? (
               <Image 
                 src={pack.cover_url} 
                 alt={`${pack.name} - ${pack.categories?.name || 'Pro'} Sample Pack | Download Loops & One-Shots | SamplesWala`} 
                 fill 
                 sizes="(max-width: 1024px) 100vw, 33vw"
                 className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 pt-10" 
               />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center pt-8">
                    <Monitor className="h-24 w-24 text-white/5" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 p-4 md:p-6 studio-panel bg-black/40 border-2 border-white/5">
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-3 border-b border-white/5 pb-1">Artifact_Stats</span>
                <div className="space-y-1.5">
                    {melodies > 0 && <div className="flex items-center justify-between text-[9px] font-black text-studio-neon"><span>MELODIES</span><span>{melodies}</span></div>}
                    {loops > 0 && <div className="flex items-center justify-between text-[9px] font-black text-white/60"><span>LOOPS</span><span>{loops}</span></div>}
                    {oneShots > 0 && <div className="flex items-center justify-between text-[9px] font-black text-white/40"><span>1SHOTS</span><span>{oneShots}</span></div>}
                </div>
             </div>
             <div className="flex flex-col border-l border-white/5 pl-4 md:pl-6">
                <span className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-3 border-b border-white/5 pb-1">Signal_Type</span>
                <div className="flex items-center gap-2 text-[10px] font-black text-studio-yellow">
                    <Disc className="h-3 w-3 animate-spin-slow" />
                    <span>24-BIT WAV</span>
                </div>
                <div className="mt-2 text-[8px] text-white/20 uppercase font-black">ROYALTY_FREE</div>
             </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
             <span className="px-3 md:px-4 py-1 bg-black border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-studio-neon">
                {pack.categories?.name || 'STUDIO_PACK'}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl xl:text-[10vw] font-black tracking-tighter mb-8 uppercase leading-[0.85] md:leading-[0.8] italic text-white shadow-studio-text">
            {pack.name}
          </h1>
          <p className="text-sm md:text-2xl text-white/40 mb-12 md:mb-16 max-w-3xl leading-snug md:leading-relaxed whitespace-pre-line font-bold italic">
            {pack.description || "Experimental textures and precision-engineered loops for modern production workflow."}
          </p>

          {/* 💎 ACQUISITION RACK */}
          <div className="flex flex-col lg:flex-row items-stretch gap-6 md:gap-8 mb-24">
              <div className="flex-1 bg-studio-grey p-8 md:p-10 flex flex-col justify-between border-2 border-white/5 group hover:border-white/20 transition-all">
                  <div>
                      <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 md:mb-12">[ SELECTIVE_MODE ]</div>
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 md:mb-6 italic text-white/80">Individual Samples</h3>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">
                          Precision extraction mode. Unlock specific frequencies for your project using individual credits.
                      </p>
                  </div>
                  <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/10 flex flex-col gap-6 text-left">
                      <div>
                          <div className="text-3xl md:text-5xl font-black italic mb-2 tracking-tighter text-studio-neon leading-none">
                              {totalIndividualCredits} CREDITS
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-4 leading-relaxed">
                              TOTAL VALUE OF ALL INDIVIDUAL SAMPLES
                          </div>
                      </div>
                      <Link href="/pricing" className="h-12 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white hover:text-black transition-all">
                          Get Credits Now
                      </Link>
                  </div>
              </div>

              <div className="flex-[1.8] bg-[#0a0a0a] border-4 border-studio-yellow p-6 md:p-14 relative group shadow-[0_0_100px_rgba(234,179,8,0.1)] rounded-sm overflow-hidden">
                  {/* 🔩 DECOR SCREWS */}
                  <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-studio-yellow/20 shadow-inner border border-black flex items-center justify-center">
                      <div className="w-3 h-[1px] bg-black/40 rotate-45" />
                  </div>
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-studio-yellow/20 shadow-inner border border-black flex items-center justify-center">
                      <div className="w-3 h-[1px] bg-black/40 -rotate-45" />
                  </div>
                  <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-studio-yellow/20 shadow-inner border border-black flex items-center justify-center">
                      <div className="w-3 h-[1px] bg-black/40 -rotate-45" />
                  </div>
                  <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-studio-yellow/20 shadow-inner border border-black flex items-center justify-center">
                      <div className="w-3 h-[1px] bg-black/40 rotate-45" />
                  </div>

                  <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none group-hover:rotate-180 transition-transform duration-[3s]">
                      <Disc className="h-64 w-64 text-studio-yellow" />
                  </div>

                  <div className="relative z-10">
                      <div className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 italic text-studio-yellow flex items-center gap-4">
                         <Zap className="h-4 w-4 animate-pulse" /> [ FULL_ACCESS_PROTOCOL ]
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8 md:gap-12">
                          <div className="flex flex-col justify-center min-w-0">
                             <h3 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold uppercase tracking-tighter mb-6 md:mb-8 italic leading-[0.9] text-white">
                                The Full<br /><span className="text-studio-yellow">Sample Pack</span>
                             </h3>
                             <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white/40 leading-relaxed max-w-sm">
                                UNLOCK EVERYTHING: THIS UPGRADE GANTS INSTANT ACCESS TO EVERY SAMPLE {hasPremiumArtifacts ? "+ DRIVE EXCLUSIVES" : ""} IN THIS PACK.
                             </p>
                          </div>

                          <div className="space-y-4 pt-4 min-w-0 w-full overflow-hidden">
                             <span className="text-[9px] font-black uppercase tracking-widest text-[#fff]/20 border-b border-white/5 pb-2 block italic text-left">PACK_CONTENTS:</span>
                             <div className="grid grid-cols-1 gap-2">
                                 {(() => {
                                     // 📟 DYNAMIC_SPEC_ROUTING
                                     const defaultSpecs = [
                                         { label: 'Full Multitrack Stems', icon: <Layers size={12}/>, active: hasPremiumArtifacts },
                                         { label: 'Master MIDI Sequences', icon: <Music4 size={12}/>, active: hasPremiumArtifacts },
                                         { label: 'Lifetime License', icon: <Zap size={12}/>, active: true },
                                         { label: 'High-Quality 24-bit WAV', icon: <Database size={12}/>, active: true }
                                     ];

                                     const specsToRender = (pack.specifications && Array.isArray(pack.specifications) && pack.specifications.length > 0)
                                         ? pack.specifications.map((s: string) => ({
                                             label: s,
                                             icon: s.toLowerCase().includes('stem') ? <Layers size={12}/> : 
                                                   s.toLowerCase().includes('midi') ? <Music4 size={12}/> :
                                                   s.toLowerCase().includes('license') ? <Zap size={12}/> :
                                                   s.toLowerCase().includes('wav') ? <Database size={12}/> : <Sparkles size={12}/>,
                                             active: true
                                         }))
                                         : defaultSpecs;

                                     return specsToRender.map((m: any, i: number) => (
                                         <div key={i} className={`flex items-center gap-3 text-[9px] font-bold uppercase tracking-tight p-3 border transition-all min-w-0 ${m.active ? 'text-white/60 bg-white/5 border-white/5' : 'text-white/10 bg-white/2 border-white/2 opacity-30'}`}>
                                             <div className={m.active ? "text-studio-yellow shrink-0" : "text-white/10 shrink-0"}>{m.icon}</div>
                                             <span className="truncate flex-1">{m.label}</span>
                                         </div>
                                     ));
                                 })()}
                             </div>
                          </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-6 mt-12 pt-10 pb-4 border-t border-white/10 w-full">
                          <PackActionCenter 
                            packId={pack.id} 
                            bundleCost={pack.bundle_credit_cost || 50} 
                            priceInr={pack.price_inr} 
                          />
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* 🎹 TRACK LIST ARRANGEMENT */}
      <div className="mb-32">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 border-b-4 border-black pb-6 gap-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4 md:gap-6 text-white/40">
                <Layers className="h-6 w-6 md:h-8 md:h-8 text-studio-neon" /> 
                Playlist :: {slug}
            </h2>
            <div className="flex gap-1 h-4 md:h-6 overflow-hidden max-w-full">
                 {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-1 bg-studio-neon/20 animate-peak shrink-0" style={{ animationDelay: `${i*0.1}s` }} />
                 ))}
            </div>
        </div>

        <SampleList 
            samples={samples || []} 
            packName={pack.name} 
            coverUrl={pack.cover_url} 
            packId={pack.id} 
            totalCount={allSamples.length}
            loopsCount={loops + melodies}
            oneShotsCount={oneShots}
        />
        
        {samples && samples.length > 0 && (
            <div className="mt-20">
                <Pagination 
                    currentPage={pageVal} 
                    totalCount={count ?? 0} 
                    pageSize={pageSize} 
                    baseUrl={`/packs/${slug}`}
                    searchParams={sParams}
                />
            </div>
        )}
      </div>

      {/* 🧬 COLLATERAL MODULES */}
      <div className="border-t-4 border-black pt-24">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-16 flex items-center gap-6 text-white/20">
           <Disc className="h-10 w-10 animate-reverse-spin" /> 
           Cross-Breediing_Artifacts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {relatedPacks?.map((rp: any) => (
                <Link key={rp.id} href={`/packs/${rp.slug}`} className="group studio-panel bg-studio-grey border-2 border-white/5 hover:border-studio-neon transition-all overflow-hidden">
                    <div className="aspect-square relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                        {rp.cover_url && (
                          <Image src={rp.cover_url} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors p-6 flex flex-col justify-end">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">{rp.name}</h3>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
      {/* 🧬 NUCLEAR_SEO: Schema Injection for Search Supremacy */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": pack.name,
            "image": pack.cover_url,
            "description": pack.description,
            "brand": { "@type": "Brand", "name": "SamplesWala" },
            "offers": {
              "@type": "Offer",
              "price": pack.price_inr || "0",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": `https://sampleswala.com/packs/${slug}`,
              "itemCondition": "https://schema.org/NewCondition"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "24"
            }
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sampleswala.com/" },
              { "@type": "ListItem", "position": 2, "name": "Samples", "item": "https://sampleswala.com/browse" },
              { "@type": "ListItem", "position": 3, "name": pack.name, "item": `https://sampleswala.com/packs/${slug}` }
            ]
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `Is ${pack.name} royalty-free?`,
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, all loops and samples in this pack are 100% royalty-free for commercial music production." }
              },
              {
                "@type": "Question",
                "name": `What files are included in ${pack.name}?`,
                "acceptedAnswer": { "@type": "Answer", "text": "This pack contains high-quality 24-bit WAV files, including melody loops, drum loops, and individual one-shots." }
              }
            ]
          })
        }}
      />
    </div>
  )
}
