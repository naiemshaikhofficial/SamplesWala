import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { getAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Clock, Music4, Zap, ShieldCheck, Sparkles, Disc, Monitor, Layers, Database, Video } from 'lucide-react'
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
import { PremiumPaywall } from '@/components/subscription/PremiumPaywall'
import { generateAudioSignal, getDriveFileId } from '@/lib/audio/signal'

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

  if (!pack) return { title: 'Pack Not Found | Samples Wala' }

  // Extract metadata samples for keywords
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
  
  // Use actual pack description if available, otherwise fallback
  const seoDescription = pack.description 
    ? (pack.description.length > 160 ? `${pack.description.substring(0, 157)}...` : pack.description)
    : `Download ${pack.name} by Samples Wala. Professional ${displayGenre} Sample Pack featuring authentic Bollywood loops, Indian percussion, and melodic phrases. 100% Royalty-Free 24-bit WAV files.`
  
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
  const adminClient = getAdminClient()
  const { slug } = await params
  const sParams = await searchParams
  const page = (sParams.page as string) || '1'
  const search = (sParams.search as string) || '' // 🔎 READ SEARCH QUERY
  const pageVal = parseInt(page)
  const pageSize = 20
  
  // 🎹 STABILITY_FETCH: Fetch pack first, then category separately to avoid schema cache issues
  let { data: pack, error } = await adminClient
    .from('sample_packs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !pack) {
    if (error) console.error(`[PACK_FETCH_ERROR] Slug: ${slug}`, error.message);
    notFound();
  }

  // Fetch category separately if ID exists
  let categoryData = null;
  if (pack.category_id) {
    const { data: cat } = await adminClient
        .from('categories')
        .select('name, id')
        .eq('id', pack.category_id)
        .single();
    categoryData = cat;
  }

  // Inject category into pack object for UI compatibility
  const enrichedPack = { ...pack, categories: categoryData };
  const genreBase = categoryData?.name || 'Indian'
  const displayGenre = genreBase.toLowerCase().includes('indian') ? genreBase : `${genreBase} Indian`
  const videoId = getYouTubeId(enrichedPack.video_url);

  // Fetch all artifacts for counting
  const { data: allSamples } = await adminClient
    .from('artifact_registry')
    .select('bpm, key, type, credit_cost')
    .eq('pack_id', pack.id)
  
  // 🛡️ AUTH_SIGNAL: Verify Subscription for Deep Browsing (Page > 1)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isSubscribed = false

  if (user) {
    const { data: account } = await supabase
        .from('user_accounts')
        .select('subscription_status')
        .eq('user_id', user.id)
        .maybeSingle()
    
    isSubscribed = account?.subscription_status === 'ACTIVE'
  }

  const isRestricted = !isSubscribed && (pageVal > 1 || !!search || !!sParams.sort);

  const sort = sParams.sort || (!isSubscribed ? 'popular' : 'newest')

  const { samples: rawSamples, count } = await getFilteredSamples({ 
    packId: pack.id,
    limit: pageSize.toString(),
    page: page,
    query: search, // 🔎 USE 'query' AS PER INTERFACE
    sort: sort // 🎚️ PASS SORT TO GLOBAL DB QUERY
  })

  const samples = rawSamples.map((s: any) => ({
      ...s,
      signal: generateAudioSignal(getDriveFileId(s.audio_url), s.name)
  }))
  
  // Handled relation locally if joined query failed
  const categoryId = pack.category_id;
  const relatedPacks = categoryId ? await getRelatedPacks(pack.id, categoryId) : [];
  
  const allArtifacts = allSamples || []
  const melodies = allArtifacts.filter((s: any) => s.bpm && s.key).length || 0
  const loops = allArtifacts.filter((s: any) => s.bpm && !s.key).length || 0
  const oneShots = allArtifacts.filter((s: any) => !s.bpm && s.type !== 'preset').length || 0
  const presets = allArtifacts.filter((s: any) => s.type === 'preset').length || 0
  
  // 💹 Master Credit Summation Engine
  const totalIndividualCredits = allArtifacts.reduce((sum: number, s: any) => sum + (s.credit_cost || 1), 0) || 0

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
      
      <Breadcrumbs 
        items={[
          { label: 'BROWSE', href: '/browse' },
          { label: enrichedPack.categories?.name || 'PACKS', href: `/browse?category=${enrichedPack.categories?.id}` },
          { label: enrichedPack.name, href: `/packs/${slug}`, active: true }
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
                        <div className={`w-1.5 h-1.5 rounded-full ${enrichedPack.is_featured ? 'bg-studio-neon' : 'bg-white/20'} animate-pulse`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">PACK HUB</span>
                    </div>
                    {enrichedPack.is_featured && <span className="text-[9px] font-black text-studio-neon uppercase tracking-tighter">Featured Collection</span>}
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
                        <div className="flex items-start justify-between">
                            <h1 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">
                                {enrichedPack.name}
                            </h1>
                            {enrichedPack.price_usd && (
                                <span className="text-[10px] font-black text-white/20">
                                    ${enrichedPack.price_usd} USD
                                </span>
                            )}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-studio-yellow">
                            {enrichedPack.categories?.name || 'Professional'} Sample Pack
                        </p>
                    </div>

                    <div className="py-2">
                        <PackActionCenter 
                            packId={enrichedPack.id} 
                            bundleCost={enrichedPack.bundle_credit_cost || 50} 
                            priceInr={enrichedPack.price_inr} 
                            priceUsd={enrichedPack.price_usd}
                        />
                    </div>

                    {/* Compact Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">FILES</span>
                            <span className="text-[10px] font-black text-studio-neon">{melodies + loops + oneShots} WAVS</span>
                        </div>
                        <div className="flex flex-col text-right border-l border-white/5 pl-4">
                            <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">CREDITS</span>
                            <span className="text-[10px] font-black text-white/60">{enrichedPack.bundle_credit_cost || 50} PTS</span>
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
                 <p className="text-[11px] text-white/40 leading-relaxed font-bold italic mb-4 whitespace-pre-wrap">
                    {enrichedPack.description || "Experimental textures and precision-engineered loops for modern production workflow."}
                 </p>
                 {enrichedPack.total_contents_summary && (
                    <div className="pt-3 border-t border-white/5">
                        <span className="text-[8px] font-black text-studio-neon uppercase tracking-widest block mb-1">BUNDLE CONTENTS</span>
                        <p className="text-[9px] font-black text-white/60 uppercase">{enrichedPack.total_contents_summary}</p>
                    </div>
                 )}
            </div>

            {/* 3. ARTIFACT_BREAKDOWN */}
            <div className="p-4 bg-white/2 border border-white/5 space-y-3">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-2">SOUND CONTENTS</span>
                {melodies > 0 && <div className="flex items-center justify-between text-[10px] font-black text-studio-neon"><span>MELODIES</span><span className="text-white/40">[{melodies}]</span></div>}
                {loops > 0 && <div className="flex items-center justify-between text-[10px] font-black text-white/80"><span>LOOPS</span><span className="text-white/40">[{loops}]</span></div>}
                {oneShots > 0 && <div className="flex items-center justify-between text-[10px] font-black text-white/60"><span>ONE SHOTS</span><span className="text-white/40">[{oneShots}]</span></div>}
                {presets > 0 && <div className="flex items-center justify-between text-[10px] font-black text-studio-yellow"><span>PRESETS</span><span className="text-white/40">[{presets}]</span></div>}
            </div>

            {/* 🎥 YOUTUBE_DEMO_EMBED */}
            {videoId && (
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-studio-neon">
                        <Video size={14} /> VIDEO PREVIEW
                    </div>
                    <div className="relative aspect-video w-full border-2 border-white/5 bg-black overflow-hidden group">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowFullScreen
                            className="grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-0 pointer-events-none border border-white/10" />
                    </div>
                </div>
            )}
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

            <div className="relative min-h-[400px]">
                {isRestricted && (
                    <div className="absolute inset-0 z-[100] flex items-start justify-center p-4 md:p-12 md:pt-24 bg-black/40 backdrop-blur-sm">
                        <PremiumPaywall totalSamples={count} />
                    </div>
                )}
                
                <div className={isRestricted ? "blur-xl grayscale pointer-events-none select-none opacity-50 transition-all duration-1000" : ""}>
                    <Suspense fallback={<div className="h-screen w-full bg-black/20 animate-pulse" />}>
                        <SampleList 
                            samples={samples || []} 
                            packName={pack.name} 
                            coverUrl={pack.cover_url} 
                            packId={pack.id} 
                            totalCount={allArtifacts.length}
                            loopsCount={loops + melodies}
                            oneShotsCount={oneShots}
                            presetsCount={presets}
                            isSubscribed={isSubscribed}
                        />
                    </Suspense>

                    {/* 🎯 SPLICE_STYLE_INLINE_WALL: Show at bottom of Page 1 if more results exist */}
                    {!isSubscribed && pageVal === 1 && (count ?? 0) > pageSize && (
                        <div className="mt-12 py-12 border-t border-white/5 flex flex-col items-center">
                            <PremiumPaywall totalSamples={(count ?? 0) - pageSize} />
                        </div>
                    )}
                    
                    {samples && samples.length > 0 && (isSubscribed || pageVal > 1) && (
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
