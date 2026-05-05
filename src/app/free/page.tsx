
import { Metadata } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Gift, Zap, ArrowRight, Music } from 'lucide-react'
import { SampleList } from '@/components/audio/SampleList'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { generateAudioSignal, getDriveFileId } from '@/lib/audio/signal'

import { Pagination } from '@/components/layout/Pagination'
import { PremiumPaywall } from '@/components/subscription/PremiumPaywall'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { getServerAuth } from '@/lib/supabase/auth'

import { getCachedFreeSamples } from './actions'

export const metadata: Metadata = generateMetadata(pagesMeta.free);
export const runtime = 'edge'; // 🚀 ULTRA_FAST_EDGE_RUNTIME

export default async function FreeSamplesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sParams = await searchParams
  const page = (sParams.page as string) || '1'
  const pageVal = parseInt(page)
  const pageSize = 20
  const from = (pageVal - 1) * pageSize
  const to = from + pageSize - 1
  
  // 🧬 CACHED_DATA_BRIDGE: Fetches from Next.js Data Cache (Pre-calculated Signals)
  const { samples: freeSamples, count } = await getCachedFreeSamples(from, to)

  // 🛡️ AUTH_SIGNAL: Only check subscription for deep browsing (Page > 1)
  // Page 1 is always public — skipping auth saves a Supabase call for 90%+ of visitors
  let isSubscribed = false

  if (pageVal > 1) {
    const { user, isSubscribed: subStatus } = await getServerAuth()
    isSubscribed = subStatus
  }

  const isRestricted = pageVal > 1 && !isSubscribed;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 min-h-screen font-mono text-white">
      {/* 📝 COLLECTION_PAGE_SCHEMA (JSON-LD) */}
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "CollectionPage",
                  "name": "Free Samples & Loops Library | Samples Wala",
                  "description": "Premium quality royalty-free Indian sounds and trap samples available for free download.",
                  "url": "https://sampleswala.com/free",
                  "mainEntity": {
                      "@type": "ItemList",
                      "itemListElement": (freeSamples || []).map((s: { id: string, name: string }, i: number) => ({
                          "@type": "ListItem",
                          "position": i + 1,
                          "url": `https://sampleswala.com/samples/${s.id}`,
                          "name": s.name
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
                      { "@type": "ListItem", "position": 2, "name": "Browse", "item": "https://sampleswala.com/browse" },
                      { "@type": "ListItem", "position": 3, "name": "Free Samples", "item": "https://sampleswala.com/free" }
                  ]
              })
          }}
      />
      <Breadcrumbs 
        items={[
          { label: 'BROWSE', href: '/browse' },
          { label: 'FREE_SAMPLES', href: '/free', active: true }
        ]} 
      />

      <header className="mb-24 mt-12 relative overflow-hidden p-12 bg-studio-charcoal border-4 border-studio-yellow shadow-[0_0_50px_rgba(234,179,8,0.1)]">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Gift size={300} className="text-studio-yellow" />
        </div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
                <span className="px-4 py-1 bg-black border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-studio-yellow italic flex items-center gap-2">
                    <Zap size={14} className="fill-studio-yellow" /> Free Sounds
                </span>
                <span className="px-4 py-1 bg-black border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-white/50 italic">Secure System</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-none mb-8">
                FREE <span className="text-studio-yellow">SAMPLES</span>
            </h1>
            <p className="text-xl md:text-3xl text-white/60 max-w-3xl font-bold italic leading-tight">
                High-fidelity, pro-grade sounds at zero credit cost. Build your library with our curated selection of royalty-free freebies.
            </p>
        </div>
      </header>

      <section className="mb-32">
          <div className="flex items-center justify-between border-b-4 border-black pb-8 mb-12">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white/40">
                  <Music className="h-6 w-6 text-studio-yellow" /> Zero-Credit Inventory
              </h2>
          </div>

          {freeSamples && freeSamples.length > 0 ? (
              <>
                  {isRestricted ? (
                      <PremiumPaywall />
                  ) : (
                      <>
                          <Suspense fallback={<div className="h-screen w-full bg-black/20 animate-pulse" />}>
                              <SampleList 
                                  samples={freeSamples} 
                                  packName="Free Collection" 
                                  coverUrl={null} 
                              />
                          </Suspense>

                          <div className="mt-20">
                              <Pagination 
                                  currentPage={pageVal} 
                                  totalCount={count ?? 0} 
                                  pageSize={pageSize} 
                                  baseUrl="/free"
                                  searchParams={sParams}
                              />
                          </div>
                      </>
                  )}
              </>
          ) : (
              <div className="py-40 border-4 border-dashed border-white/5 text-center bg-black/20">
                  <Gift size={64} className="mx-auto mb-8 text-white/10" />
                  <h3 className="text-2xl font-black uppercase tracking-widest text-white/20 italic">Scanning for free frequencies...</h3>
                  <p className="text-white/10 mt-4 uppercase text-[10px] tracking-widest">Check back soon for new free drops</p>
              </div>
          )}
      </section>

      {/* 🛡️ Trust Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
              { title: "Commercial Ready", desc: "Use these in your commercial tracks without paying royalties." },
              { title: "Instant Download", desc: "No credit cards, no surveys. Just one click to grab the WAV." },
              { title: "Studio Fidelity", desc: "Same 24-bit quality as our premium artifact packs." }
          ].map((item, i) => (
              <div key={i} className="p-8 border-2 border-white/5 bg-studio-grey/20 hover:border-studio-yellow/40 transition-all">
                  <h4 className="text-lg font-black uppercase tracking-widest text-studio-yellow mb-4 underline decoration-4 underline-offset-8 decoration-black">{item.title}</h4>
                  <p className="text-sm text-white/40 font-bold italic">{item.desc}</p>
              </div>
          ))}
      </section>

      <div className="py-24 border-t-4 border-black flex flex-col items-center">
            <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-12 text-center">
                Want More <span className="text-studio-neon">Premium</span> Power?
            </h3>
            <Link href="/browse" className="group flex items-center gap-6 px-12 py-6 bg-studio-neon text-black font-black uppercase tracking-[0.4em] italic hover:scale-105 transition-all">
                Explore Full Library <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
      </div>
    </div>
  )
}
