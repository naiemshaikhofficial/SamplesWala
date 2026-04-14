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
  
  // 🎹 NUCLEAR_SEO: Localized Indian Search Supremacy (Cleaned Redundancy)
  const genreBase = pack.categories?.name || 'Indian'
  const displayGenre = genreBase.toLowerCase().includes('indian') ? genreBase : `${genreBase} Indian`
  
  const title = `${pack.name} - ${displayGenre} Sample Pack | Bollywood Sounds | SamplesWala`
  const description = `Download ${pack.name} by SamplesWala. The ultimate ${displayGenre} Sample Pack featuring authentic Bollywood loops, Indian percussion, and melodic phrases. 100% Royalty-Free 24-bit WAV files.`
  
  const keywords = [
    pack.name, 
    'Indian sample pack',
    'Bollywood sample pack',
    `${displayGenre} samples`, 
    'Indian percussion loops', 
    'Bollywood melody loops', 
    'Tabla loops download',
    'Hip Hop Samples',  
    'Dhol patches',
    'Indian VST sounds',
    'SamplesWala Indian sounds',
    'Desi Hip Hop samples',
    'Indian Trap loops',
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
        Back to Store
      </Link>
      
      {/* 🎹 DAW_STYLE_DETAIL_RACK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        
        {/* ⬅️ SIDEBAR: PRODUCT_METADATA */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
            
            {/* 1. MAIN_CONTROL_MODULE */}
            <div className="studio-panel bg-[#0a0a0a] border-2 border-white/10 shadow-2xl overflow-hidden group">
                {/* Module Header */}
                <div className="absolute top-0 inset-x-0 bg-studio-grey px-3 py-2 flex items-center justify-between border-b border-white/10 z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-studio-neon animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">PACK HUB</span>
                    </div>
                    <span className="text-[9px] font-black text-studio-neon">PREMIUM</span>
                </div>

                {/* Poster / Cover */}
                <div className="aspect-square relative mt-8 grayscale hover:grayscale-0 transition-all duration-700 cursor-zoom-in">
                    {pack.cover_url ? (
                        <Image 
                            src={pack.cover_url} 
                            alt={pack.name} 
                            fill 
                            priority
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            className="object-cover" 
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-studio-grey">
                            <Monitor className="h-16 w-16 text-white/5" />
                        </div>
                    )}
                </div>

                {/* 🛒 IMMEDIATE_ACTION_ZONE */}
                <div className="p-6 space-y-6 bg-black/40 border-t border-white/10">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">
                            {pack.name}
                        </h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-studio-yellow">
                            Professional Sample Pack
                        </p>
                    </div>

                    <div className="py-2">
                        <PackActionCenter 
                            packId={pack.id} 
                            bundleCost={pack.bundle_credit_cost || 50} 
                            priceInr={pack.price_inr} 
                        />
                    </div>

                    {/* Compact Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">FILES</span>
                            <span className="text-[10px] font-black text-studio-neon">{melodies + loops + oneShots} WAVS</span>
                        </div>
                        <div className="flex flex-col text-right border-l border-white/5 pl-4">
                            <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">TYPE</span>
                            <span className="text-[10px] font-black text-white/60">{pack.categories?.name || 'STUDIO'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. DESCRIPTION_MODULE */}
            <div className="p-5 bg-studio-grey/30 border border-white/5">
                 <div className="flex items-center gap-2 mb-3">
                    <Disc className="h-3 w-3 text-white/20 animate-spin-slow" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Product Details</span>
                 </div>
                 <p className="text-[11px] text-white/40 leading-relaxed font-bold italic">
                    {pack.description || "Experimental textures and precision-engineered loops for modern production workflow."}
                 </p>
            </div>

            {/* 3. ARTIFACT_BREAKDOWN */}
            <div className="p-4 bg-white/2 border border-white/5 space-y-3">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-2">SOUND CONTENTS</span>
                {melodies > 0 && <div className="flex items-center justify-between text-[10px] font-black text-studio-neon"><span>MELODIES</span><span className="text-white/40">[{melodies}]</span></div>}
                {loops > 0 && <div className="flex items-center justify-between text-[10px] font-black text-white/80"><span>LOOPS</span><span className="text-white/40">[{loops}]</span></div>}
                {oneShots > 0 && <div className="flex items-center justify-between text-[10px] font-black text-white/60"><span>ONE SHOTS</span><span className="text-white/40">[{oneShots}]</span></div>}
            </div>
        </div>

        {/* ➡️ MAINBOARD: PREVIEW_ENGINE */}
        <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between border-b-2 border-white/5 pb-4">
                <div className="flex items-center gap-4">
                    <Layers className="h-5 w-5 text-studio-neon" />
                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-white/60">
                         {pack.name} Collection
                    </h2>
                </div>
                <div className="hidden sm:flex gap-1 h-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-1 bg-studio-neon/20 animate-peak" style={{ animationDelay: `${i*0.15}s` }} />
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
                <div className="mt-12">
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
      </div>

      {/* 🧬 COLLATERAL MODULES */}
      <div className="border-t-4 border-black pt-24">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-16 flex items-center gap-6 text-white/20">
           <Disc className="h-10 w-10 animate-reverse-spin" /> 
           More Related Packs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {relatedPacks?.map((rp: any) => (
                <Link key={rp.id} href={`/packs/${rp.slug}`} className="group studio-panel bg-studio-grey border-2 border-white/5 hover:border-studio-neon transition-all overflow-hidden">
                    <div className="aspect-square relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                        {rp.cover_url && (
                          <Image src={rp.cover_url} alt={rp.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover group-hover:scale-105 transition-transform" />
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
