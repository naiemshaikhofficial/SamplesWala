import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { getAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Clock, Music4, Zap, ShieldCheck, Sparkles, Disc, Monitor, Layers, Database, Video, Music2, Volume2, Info } from 'lucide-react'
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
import { CompactHeroDescription } from '@/components/audio/CompactHeroDescription'
import { getRelatedPacks, getFilteredSamples, getBrowseData } from '@/app/browse/actions'
import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Pagination } from '@/components/layout/Pagination'
import { PremiumPaywall } from '@/components/subscription/PremiumPaywall'
import { generateAudioSignal, getDriveFileId } from '@/lib/audio/signal'

import { cache } from 'react'

// 🧬 DEDUPLICATION_ENGINE: Prevents redundant Supabase hits across generateMetadata and Page
const getCachedPack = cache(async (slug: string) => {
  const adminClient = getAdminClient()
  const { data, error } = await adminClient
    .from('sample_packs')
    .select('*, categories(name), samples(bpm, key, type)')
    .eq('slug', slug)
    .single()
  return { data, error }
})

export const revalidate = 86400; // Cache for 24 hours (Aggressive Vercel Optimization)

// 🚀 SSG_OPTIMIZATION: Pre-render top 50 packs to save Supabase usage
export async function generateStaticParams() {
  const adminClient = getAdminClient()
  const { data: packs } = await adminClient
    .from('sample_packs')
    .select('slug')
    .order('created_at', { ascending: false })
    .limit(50)

  return (packs || []).map((pack: { slug: string }) => ({
    slug: pack.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: pack, error } = await getCachedPack(slug)

  if (!pack || error) return { title: 'Pack Not Found | Samples Wala' }

  const melodies = pack.samples?.filter((s: any) => s.type === 'melody' || s.type === 'loop').length || 0
  const loops = pack.samples?.filter((s: any) => s.type === 'drum_loop' || s.type === 'percussion_loop').length || 0
  const oneShots = pack.samples?.filter((s: any) => s.type === 'one_shot' || s.type === 'drum_one_shot').length || 0
  const bpmList = pack.samples?.map((s: any) => s.bpm).filter(Boolean)
  const keyList = pack.samples?.map((s: any) => s.key).filter(Boolean)
  const genre = pack.categories?.name || 'Music'
  
  const bpmStr = [...new Set(bpmList)].slice(0, 4).join(', ')
  const keyStr = [...new Set(keyList)].slice(0, 4).join(', ')
  
  // 🎹 NUCLEAR_SEO: Localized Indian Search Supremacy (Cleaned Redundancy)
  const genreBase = pack.categories?.name || 'Indian'
  const displayGenre = genreBase.toLowerCase().includes('indian') ? genreBase : `${genreBase} Indian`
  
  // 🚀 SEO_REFINEMENT: Punchy, Keyword-Rich Titles
  const title = `${pack.name} | ${displayGenre} Sample Pack & Drum Kit | Samples Wala`
  
  // 🚀 NUCLEAR_SEO: Punchy, Keyword-Rich Description for Google
  const totalSounds = melodies + loops + oneShots
  const seoDescription = pack.description 
    ? `${pack.name} by Samples Wala: Professional ${displayGenre} Sample Pack featuring ${totalSounds} high-quality sounds. ${pack.description.substring(0, 120)}... 100% Royalty-Free 24-bit WAV.`
    : `Download ${pack.name} Drum Kit & Sample Pack. Features ${totalSounds} authentic ${displayGenre} sounds, including Bollywood loops, Indian percussion, and melodic phrases. High-quality 24-bit WAV, 100% Royalty-Free for commercial use.`
  
  const keywords = [
    pack.name, 
    'Indian sample pack',
    'Bollywood sample pack',
    `${genreBase} loops`,
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
    'royalty free samples',
    'music production',
    'wav samples',
    ...[...new Set(bpmList)].map(b => `${b} bpm`),
    ...[...new Set(keyList)].map(k => `${k} key`)
  ]

  const ogImage = `https://sampleswala.com/api/og/pack/${slug}`

  return {
    title,
    description: seoDescription,
    keywords,
    openGraph: {
      title,
      description: seoDescription,
      type: 'article',
      url: `https://sampleswala.com/packs/${slug}`,
      images: [
        { url: ogImage, width: 1200, height: 630, alt: title },
        { url: pack.cover_url || '', width: 800, height: 800, alt: `${pack.name} Cover` }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: seoDescription,
      images: [ogImage, pack.cover_url || ''],
    },
    alternates: {
      canonical: `https://sampleswala.com/packs/${slug}`
    }
  }
}

// 🎥 YOUTUBE_ID_EXTRACTOR
function getYouTubeId(url: string | null) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default async function PackPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { data: pack, error } = await getCachedPack(slug)

  if (error || !pack) {
    notFound();
  }

  const sParams = await searchParams
  const page = (sParams.page as string) || '1'
  const search = (sParams.search as string) || '' // 🔎 READ SEARCH QUERY
  const pageVal = parseInt(page)
  const pageSize = 20

  // 🚀 CONSOLIDATED_STUDIO_FETCH: Fetch samples, categories, and related packs in one unified signal
  const browseData = await getBrowseData({
      packId: pack.id,
      query: search,
      type: sParams.type as string,
      page: pageVal,
      limit: pageSize,
      sort: sParams.sort as string
  })

  const { samples: rawSamples, count, packs: relatedPacks, isSubscribed, isRestricted, categories } = browseData;
  const categoryData = categories.find((c: any) => c.id === pack.category_id);
  
  const enrichedPack = { ...pack, categories: categoryData };
  const genreBase = categoryData?.name || 'Indian'
  const displayGenre = genreBase.toLowerCase().includes('indian') ? genreBase : `${genreBase} Indian`
  const videoId = getYouTubeId(enrichedPack.video_url);

  const samples = rawSamples.map((s: any) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      bpm: s.bpm,
      key: s.key,
      credit_cost: s.credit_cost,
      audio_url: s.audio_url,
      signal: generateAudioSignal(getDriveFileId(s.audio_url), s.name)
  }))

  // 🧬 STABLE_COUNTS: Use database metadata for consistent filter counts
  const melodies = pack.melody_count || 0
  const loops = pack.loop_count || 0
  const oneShots = pack.one_shot_count || 0
  const presets = pack.preset_count || 0
  const totalPackSamples = melodies + loops + oneShots + presets
  
  // 💹 Master Credit Summation Engine
  const totalIndividualCredits = pack.total_credits || 0

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
      "name": "Samples Wala"
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
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sampleswala.com/" },
      { "@type": "ListItem", "position": 2, "name": "Browse", "item": "https://sampleswala.com/browse" },
      { "@type": "ListItem", "position": 3, "name": enrichedPack.categories?.name || 'Packs', "item": `https://sampleswala.com/browse?category=${enrichedPack.categories?.id}` },
      { "@type": "ListItem", "position": 4, "name": enrichedPack.name, "item": `https://sampleswala.com/packs/${slug}` }
    ]
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 min-h-screen font-mono">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <Breadcrumbs 
            items={[
            { label: 'BROWSE', href: '/browse' },
            { label: enrichedPack.categories?.name || 'PACKS', href: `/browse?category=${enrichedPack.categories?.id}` },
            { label: enrichedPack.name, href: `/packs/${slug}`, active: true }
            ]} 
        />
        <Link href="/browse" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-studio-neon group transition-all">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-2" />
            Back to Store
        </Link>
      </div>
      
      {/* 🚀 PREMIUM_HERO_HEADER */}
      <div className="relative mb-16 p-8 lg:p-12 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-2xl overflow-hidden group/hero">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-studio-neon/10 blur-[120px] rounded-full" />
        
        {/* ℹ️ INFO_BUTTON (Top-Right) */}
        <div className="absolute top-6 right-6 z-20">
            <Link 
                href="#about" 
                className="p-2.5 rounded-full bg-white/5 border border-white/5 text-white/20 hover:text-studio-neon hover:bg-studio-neon/10 hover:border-studio-neon/20 transition-all block backdrop-blur-md"
                title="About this Pack"
            >
                <Info size={18} />
            </Link>
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* 1. COVER_IMAGE (3-Cols) */}
            <div className="lg:col-span-3">
                <div className="aspect-square relative rounded-xl overflow-hidden shadow-2xl border border-white/10 group bg-studio-grey">
                    {pack.cover_url ? (
                        <Image 
                            src={pack.cover_url} 
                            alt={pack.name} 
                            fill 
                            priority
                            sizes="(max-width: 1024px) 100vw, 300px"
                            className="object-cover group-hover:scale-105 transition-transform duration-1000" 
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Monitor className="h-20 w-20 text-white/5" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
            </div>

            {/* 2. PRODUCT_CONTENT (9-Cols) */}
            <div className="lg:col-span-9 flex flex-col h-full">
                {/* Header Info */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-studio-neon/10 text-studio-neon text-[9px] font-black uppercase tracking-[0.2em] rounded">
                            {enrichedPack.categories?.name || 'Exclusive'}
                        </span>
                        <div className="h-[1px] w-8 bg-white/10" />
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                            {count} Sounds Available
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight max-w-4xl">
                        {enrichedPack.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/5 mt-6">
                        {melodies > 0 && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                <Layers size={14} className="text-studio-neon" />
                                <span>{melodies} Melodies</span>
                            </div>
                        )}
                        {loops > 0 && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                <Zap size={14} className="text-studio-yellow" />
                                <span>{loops} Loops</span>
                            </div>
                        )}
                        {oneShots > 0 && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                <Music2 size={14} className="text-studio-neon" />
                                <span>{oneShots} One-shots</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            <Disc size={14} className="text-white/20" />
                            <span>24-Bit Wav</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto space-y-8">
                    <div className="flex flex-wrap items-center gap-4">
                        <PackActionCenter 
                            packId={enrichedPack.id} 
                            bundleCost={enrichedPack.bundle_credit_cost || 50} 
                            priceInr={enrichedPack.price_inr} 
                            priceUsd={enrichedPack.price_usd}
                        />
                    </div>

                    {/* Compact Description */}
                    <div id="about" className="max-w-3xl border-t border-white/5 pt-4">
                        <CompactHeroDescription description={enrichedPack.description || ""} />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ➡️ SOUNDS_LIST_SECTION */}
      <div className="mb-24">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                  <div className="h-8 w-1 bg-studio-neon" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-studio-neon" /> Sounds In Pack
                  </h2>
              </div>
              <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  Total {count} Samples Available
              </div>
          </div>

          <div className="relative min-h-[500px] studio-panel bg-studio-grey/10 border border-white/5 rounded-xl overflow-hidden p-1">
              {isRestricted && (
                  <div className="absolute inset-0 z-[100] flex items-start justify-center p-4 md:pt-16 bg-black/60 backdrop-blur-md">
                      <PremiumPaywall totalSamples={count} />
                  </div>
              )}
              
              <div className={isRestricted ? "blur-2xl grayscale pointer-events-none select-none opacity-40 transition-all duration-1000" : ""}>
                  <Suspense fallback={<div className="h-screen w-full bg-studio-grey/20 animate-pulse" />}>
                       <SampleList 
                           samples={samples || []} 
                           packName={pack.name} 
                           coverUrl={pack.cover_url} 
                           packId={pack.id} 
                           totalCount={totalPackSamples}
                           melodiesCount={melodies}
                           loopsCount={loops}
                           oneShotsCount={oneShots}
                           presetsCount={presets}
                           isSubscribed={isSubscribed}
                       />
                  </Suspense>

                  {/* 🎯 PAGE_1_INLINE_WALL */}
                  {!isSubscribed && pageVal === 1 && (count ?? 0) > pageSize && (
                      <div className="mt-16 py-16 border-t border-white/5 flex flex-col items-center bg-gradient-to-t from-black/40 to-transparent">
                          <PremiumPaywall totalSamples={(count ?? 0) - pageSize} />
                      </div>
                  )}

                  {samples && samples.length > 0 && (isSubscribed || pageVal > 1 || (count ?? 0) > pageSize) && (
                      <div className="p-8 border-t border-white/5">
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
      </div>

      {/* 🧬 RELATED_PACKS_SECTION */}
      <div className="mt-24 border-t border-white/5 pt-24 mb-24">
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
            "brand": { "@type": "Brand", "name": "Samples Wala" },
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
                "acceptedAnswer": { "@type": "Answer", "text": `Yes, all loops and samples in ${pack.name} are 100% royalty-free for commercial music production. You can use them in your tracks and sell them on Spotify, Apple Music, and more.` }
              },
              {
                "@type": "Question",
                "name": `What files are included in ${pack.name}?`,
                "acceptedAnswer": { "@type": "Answer", "text": `This pack contains high-quality 24-bit WAV files, including ${melodies} melodies, ${loops} loops, and ${oneShots} one-shots. Compatible with all major DAWs like FL Studio, Ableton, and Logic.` }
              },
              {
                "@type": "Question",
                "name": `Can I use ${pack.name} for Bollywood and Hip Hop production?`,
                "acceptedAnswer": { "@type": "Answer", "text": `Absolutely. ${pack.name} is specifically designed for modern ${displayGenre} production, blending authentic traditional sounds with contemporary urban textures.` }
              }
            ]
          })
        }}
      />
    </div>
  )
}
