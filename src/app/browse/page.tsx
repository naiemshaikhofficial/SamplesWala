
import { createClient } from '@/lib/supabase/server'
import { getFilteredPacks, getFilteredSamples, getAllCategories, getBrowseData } from './actions'
import Link from 'next/link'
import { 
  Search, Music, Zap, Disc, ArrowRight, Play, Download, Waves, Radio, 
  Volume2, Mic2, Settings2, Sparkles, Filter, Activity, Cpu, Layout, 
  Maximize2, MoveVertical, Timer, Terminal, Layers, Monitor, SlidersHorizontal, 
  Keyboard, X, Minus, Square, Folder, Database, HardDrive, Cpu as CpuIcon, 
  Cloud, Save, Key, UserCheck, FileJson 
} from 'lucide-react'
import Image from 'next/image'
import { PriceDisplay } from '@/components/PriceDisplay'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { Waveform } from '@/components/audio/Waveform'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

import { SidebarFilters } from '@/components/browse/SidebarFilters'
import { SampleList } from '@/components/audio/SampleList'
import { Pagination } from '@/components/layout/Pagination'
import { PremiumPaywall } from '@/components/subscription/PremiumPaywall'
import { Cable } from 'lucide-react'
import { Metadata } from 'next'
import { generateAudioSignal, getDriveFileId } from '@/lib/audio/signal'
import { Suspense } from 'react'

export const revalidate = 86400; // Cache for 24 hours (Aggressive Vercel Optimization)

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const q = params.q
  const category = params.category
  const type = params.type
  
  let title = 'Sounds Library | Samples Wala'
  let description = 'Browse our massive library of premium royalty-free samples, drum kits, and loops. Filter by BPM, Key, and Genre to find your perfect sound.'
  const domain = 'https://sampleswala.com'

  if (q) {
    title = `Download "${q}" Samples & Loops | Samples Wala`
    description = `Explore high-quality "${q}" audio samples and loops for music production. Pro-grade 24-bit WAV files, 100% royalty-free.`
  } else if (type === 'presets') {
    title = 'Pro Vocal Presets & Plugin Patches | Samples Wala'
    description = 'Download premium vocal presets, Serum patches, and DAW chains. Industry-standard sound design for FL Studio, Ableton, and Logic Pro.'
  } else if (category) {
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    title = `Best ${formattedCategory} Samples & Drum Kits | Samples Wala`
    description = `Premium ${formattedCategory} loops and sounds for modern music producers. Discover the best royalty-free ${category} packs.`
  }

  const keywords = [
    'sample packs', 'drum kits', 'wav loops', 'royalty free samples',
    'music production sounds', 'FL Studio packs', 'Ableton samples',
    q, category, type
  ].filter(Boolean)

  // 📡 CANONICAL_GENERATOR: Consolidate permutations to avoid GSC "Currently Not Indexed"
  const cParams = new URLSearchParams()
  if (category) cParams.set('category', category)
  if (type) cParams.set('type', type)
  if (params.genre) cParams.set('genre', params.genre as string)
  if (params.tag) cParams.set('tag', params.tag as string)
  
  const canonicalQuery = cParams.toString()
  const canonicalPath = canonicalQuery ? `https://sampleswala.com/browse?${canonicalQuery}` : 'https://sampleswala.com/browse'

  return { 
    title, 
    description,
    keywords,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title,
      description,
      url: `https://sampleswala.com/browse`,
      images: ['/og-image.jpg']
    }
  }
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { 
    q?: string; 
    category?: string; 
    type?: string; 
    filter?: string;
    bpm_min?: string;
    bpm_max?: string;
    key?: string;
  }
}) {
  const params = await (searchParams as any)
  
  const page = (params.page as string) || '1'
  // 🛡️ AUTH_SIGNAL: Verify Subscription for Deep Browsing (Page > 1)
  const pageVal = parseInt(page)
  const pageSize = 20
  
  // 🚀 CONSOLIDATED_STUDIO_FETCH: All-in-one signal acquisition
  const browseData = await getBrowseData({
      query: params.q,
      category: params.category,
      type: params.type,
      bpm_min: params.bpm_min ? parseInt(params.bpm_min) : undefined,
      bpm_max: params.bpm_max ? parseInt(params.bpm_max) : undefined,
      key: params.key,
      sort: params.sort,
      page: pageVal,
      limit: pageSize,
      filter: params.filter,
      genre: params.genre as string,
      tag: params.tag as string
  })

  const { samples: rawSamples, count, categories, packs, isSubscribed, isRestricted } = browseData;

  // 🧬 SIGNAL_INJECTION
  const samples = (rawSamples || []).map((s: any) => ({
      ...s,
      signal: generateAudioSignal(getDriveFileId(s.audio_url), s.name)
  }))

  const hasNoResults = (!packs || packs.length === 0) && (!samples || samples.length === 0);

  const musicalKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const isNewAssets = params.sort === 'newest';
  const isTrending = params.filter === 'trending';
  const isPresets = params.type === 'presets';
  
  const dynamicTitle = isPresets ? 'PRO PRESETS' : (isNewAssets ? 'NEW ARRIVALS' : (isTrending ? 'TOP TRENDS' : 'SOUNDS LIBRARY'));
  const dynamicLabel = isPresets ? 'PRESET ARTIFACTS' : (isNewAssets ? 'NEW SIGNAL ARCHIVE' : (isTrending ? 'POPULAR SONIC DATA' : 'EXPLORE LIBRARY'));

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 min-h-screen font-mono text-white bg-[#0a0a0a]">
      {/* 🧭 BREADCRUMB_NAV */}
      <Breadcrumbs 
        items={[
          { label: 'BROWSE', href: '/browse', active: true }
        ]} 
      />

      {/* 📝 COLLECTION_SCHEMA (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": dynamicTitle,
            "description": `Browse our collection of premium ${params.category || ''} sample packs and individual sounds.`,
            "url": "https://sampleswala.com/browse",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": (packs || []).map((p: any, i: number) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": `https://sampleswala.com/packs/${p.slug}`
              }))
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
              { "@type": "ListItem", "position": 2, "name": "Browse", "item": "https://sampleswala.com/browse", "active": true }
            ]
          })
        }}
      />
      
      {/* 🎚️ BROWSER_TERMINAL_HEADER */}
      <header className="mb-16 md:mb-24 shrink-0">
        <div className="flex items-center gap-4 mb-8">
            <span className="px-4 py-1 bg-black border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-studio-neon italic">
                {dynamicLabel}
            </span>
        </div>
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="flex-1">
                <h1 className="text-5xl md:text-7xl xl:text-[8vw] font-black tracking-tighter uppercase leading-[0.85] md:leading-[0.8] italic text-white shadow-studio-text">
                    {dynamicTitle.split(' ')[0]} <span className="text-studio-neon">{dynamicTitle.split(' ')[1]}</span>
                </h1>
            </div>

            <div className="relative w-full max-w-2xl mt-8 lg:mt-0">
                {!isSubscribed ? (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex items-center justify-between px-8 border-2 border-white/5 group">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded bg-studio-neon/10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-studio-neon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-studio-neon/80 leading-none mb-1">Search Locked</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 leading-none">Subscription Required</span>
                            </div>
                        </div>
                        <Link 
                            href="/subscription" 
                            className="text-[10px] font-black bg-studio-neon text-black px-4 py-2 rounded-sm hover:bg-white transition-colors"
                        >
                            UPGRADE NOW
                        </Link>
                    </div>
                ) : null}
                <form action="/browse" className="relative">
                    <div className="bg-studio-grey border-2 border-white/5 p-1 group focus-within:border-studio-neon transition-all relative">
                         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-studio-neon transition-colors" />
                         <input 
                            name="q"
                            type="text" 
                            placeholder={isSubscribed ? "Search for sounds..." : "SEARCH LOCKED"} 
                            defaultValue={params.q}
                            disabled={!isSubscribed}
                            className="w-full bg-black px-16 py-5 border-none focus:ring-0 uppercase font-black tracking-widest text-base shadow-inner focus:outline-none disabled:opacity-20"
                        />
                    </div>
                </form>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start relative">
        
        {/* 🎛️ Search Filters (Col 1) */}
        <div className="lg:col-span-1">
            <Suspense fallback={<div className="h-screen w-80 bg-[#0d0d0d] animate-pulse" />}>
                <SidebarFilters categories={categories} isSubscribed={isSubscribed} />
            </Suspense>
        </div>

        {/* 🎧 SOUND_GRID (Col 2-4) */}
        <main className="lg:col-span-3 space-y-32">
            
            {/* Packs Layout */}
            {packs && packs.length > 0 && (
                <div className="space-y-16">
                    <div className="flex items-center justify-between border-b-4 border-black pb-8">
                        <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white/40">
                            <Layers className="h-6 w-6 text-studio-neon" /> Sound Packs
                        </h2>
                        <div className="flex gap-1 h-4 overflow-hidden hidden sm:flex">
                             {[...Array(10)].map((_, i) => (
                                <div key={i} className="w-1 bg-studio-neon/10 animate-peak" style={{ animationDelay: `${i*0.1}s` }} />
                             ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10">
                        {packs.map((pack: any) => (
                            <div key={pack.id} className="group flex flex-col">
                                <Link href={`/packs/${pack.slug}`}>
                                    <div className="aspect-square relative overflow-hidden studio-panel bg-studio-grey border-2 border-white/10 shadow-2xl group mb-8">
                                        {/* VST Header Header */}
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
                                                alt={`${pack.name} Royalty Free Sample Pack Loops`} 
                                                fill 
                                                sizes="(max-width: 1024px) 100vw, 33vw"
                                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 pt-10" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center pt-10">
                                                <Monitor className="h-20 w-20 text-white/5" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                    </div>
                                    
                                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic text-white group-hover:text-studio-neon transition-colors leading-[0.9]">
                                        {pack.name}
                                    </h3>
                                    
                                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                        <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} className="text-[11px] font-black tracking-widest" />
                                        <div className="text-[8px] font-black uppercase tracking-widest text-white/20 italic group-hover:text-studio-yellow transition-colors">
                                            VIEW DETAILS
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Individual Sounds List */}
            {samples && samples.length > 0 && (
                <div className="space-y-16">
                    <div className="flex items-center justify-between border-b-4 border-black pb-8">
                        <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white/40">
                            <Zap className="h-6 w-6 text-studio-neon" /> Individual Sounds
                        </h2>
                    </div>
                    
                    <div className="relative min-h-[400px]">
                        {isRestricted && (
                            <div className="absolute inset-0 z-[100] flex items-start justify-center p-4 md:p-12 md:pt-24 bg-black/40 backdrop-blur-sm">
                                <PremiumPaywall totalSamples={count} />
                            </div>
                        )}
                        
                        <div className={isRestricted ? "blur-xl grayscale pointer-events-none select-none opacity-50 transition-all duration-1000" : ""}>
                            <Suspense fallback={<div className="h-screen w-full bg-black/60 animate-pulse" />}>
                                <SampleList 
                                    samples={samples} 
                                    packName="Browse Results" 
                                    coverUrl={null} 
                                    totalCount={count}
                                    isSubscribed={isSubscribed}
                                />
                            </Suspense>

                            {/* 🎯 SPLICE_STYLE_INLINE_WALL: Show at bottom of Page 1 if more results exist */}
                            {!isSubscribed && pageVal === 1 && (count ?? 0) > pageSize && (
                                <div className="mt-12 py-12 border-t border-white/5 flex flex-col items-center">
                                    <PremiumPaywall totalSamples={(count ?? 0) - pageSize} />
                                </div>
                            )}

                            {!hasNoResults && (isSubscribed || pageVal > 1) && (
                                <div className="mt-20">
                                    <Pagination 
                                        currentPage={pageVal} 
                                        totalCount={count ?? 0} 
                                        pageSize={pageSize} 
                                        baseUrl="/browse"
                                        searchParams={params}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {hasNoResults && (
              <div className="flex flex-col items-center justify-center py-40 border-4 border-dashed border-white/5 bg-black/20 rounded-sm opacity-30 shadow-inner">
                  <Cpu size={64} className="mb-12 text-studio-neon animate-reverse-spin" />
                  <h2 className="text-3xl font-black uppercase tracking-[0.6em] italic text-white">No sounds found</h2>
                  <p className="text-[10px] uppercase tracking-[0.4em] mt-8 italic text-white/40 leading-relaxed">Adjust your filters to find sounds</p>
              </div>
            )}
        </main>
      </div>
    </div>
  )
}
