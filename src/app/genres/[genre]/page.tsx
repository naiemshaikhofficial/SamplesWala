export const revalidate = 3600; // ⚡ CACHE_DURATION: 1 HOUR

import { Metadata } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFilteredPacks, getFilteredSamples } from '@/app/browse/actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Layers, Zap, ArrowLeft, Disc } from 'lucide-react'
import Image from 'next/image'
import { SampleList } from '@/components/audio/SampleList'
import { PriceDisplay } from '@/components/PriceDisplay'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Pagination } from '@/components/layout/Pagination'

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }): Promise<Metadata> {
  const { genre } = await params
  const genreTitle = genre.charAt(0).toUpperCase() + genre.slice(1)
  
  const title = `Best ${genreTitle} Samples & Loops | Download ${genreTitle} Drum Kits`
  const description = `Looking for the best ${genreTitle} samples? Download premium royalty-free ${genreTitle} loops, drum kits, and one-shots for FL Studio, Ableton, and Logic Pro.`

  return {
    title,
    description,
    keywords: [`${genre} samples`, `${genre} loops`, `${genre} drum kit`, 'royalty free samples', 'music production'],
    openGraph: {
      title,
      description,
      type: 'website',
    }
  }
}

export default async function GenrePage({ 
  params,
  searchParams
}: { 
  params: Promise<{ genre: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { genre } = await params
  const sParams = await searchParams
  const page = (sParams.page as string) || '1'
  const pageVal = parseInt(page)
  const pageSize = 20
  const adminClient = getAdminClient()
  
  // Find category by name (case-insensitive)
  const { data: categories } = await adminClient
    .from('categories')
    .select('id, name')
    .ilike('name', genre)
  
  const category = categories?.[0]
  
  if (!category) {
      // Fallback search in samples if category not found strictly
      // But for SEO silos, we usually want these to match categories
  }

  const packs = await getFilteredPacks({ category: category?.id })
  const { samples, count } = await getFilteredSamples({ 
    category: category?.id, 
    limit: pageSize.toString(),
    page: page
  })

  const genreDisplay = category?.name || genre.toUpperCase()

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 min-h-screen font-mono text-white">
      {/* 📝 COLLECTION_PAGE_SCHEMA (JSON-LD) */}
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "CollectionPage",
                  "name": `${genreDisplay} Samples & Loops Library`,
                  "description": `Comprehensive collection of professional ${genreDisplay} sound packs and samples.`,
                  "url": `https://sampleswala.com/genres/${genre}`,
                  "mainEntity": {
                      "@type": "ItemList",
                      "itemListElement": (packs || []).map((p, i) => ({
                          "@type": "ListItem",
                          "position": i + 1,
                          "url": `https://sampleswala.com/packs/${p.slug}`
                      }))
                  }
              })
          }}
      />

      {/* 🧭 BREADCRUMB_SCHEMA (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Catalog", "item": "https://sampleswala.com/browse" },
              { "@type": "ListItem", "position": 2, "name": "Genres", "item": "https://sampleswala.com/browse" },
              { "@type": "ListItem", "position": 3, "name": genreDisplay, "item": `https://sampleswala.com/genres/${genre}` }
            ]
          })
        }}
      />

      <Breadcrumbs 
        items={[
          { label: 'BROWSE', href: '/browse' },
          { label: 'GENRES', href: '/browse' },
          { label: genreDisplay, href: `/genres/${genre}`, active: true }
        ]} 
      />

      <header className="mb-24 mt-12">
        <div className="flex items-center gap-4 mb-8">
            <span className="px-4 py-1 bg-black border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-studio-neon italic">
                Silo_Authority_Node :: {genreDisplay}
            </span>
        </div>
        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-none mb-12">
            {genreDisplay} <span className="text-studio-neon">SOUNDS</span>
        </h1>
        <p className="text-xl md:text-3xl text-white/40 max-w-4xl font-bold italic leading-tight">
            The definitive collection of industry-standard {genreDisplay} samples, precision-engineered for professional music production.
        </p>
      </header>

      {/* 🚀 Authority Content Section (SEO Block) */}
      <section className="mb-32 grid grid-cols-1 md:grid-cols-2 gap-16 p-12 bg-studio-charcoal border-l-8 border-studio-neon">
          <div>
              <h2 className="text-3xl font-black uppercase italic mb-8">Why our {genreDisplay} Samples?</h2>
              <p className="text-white/60 leading-relaxed mb-6">
                  Every loop and one-shot in our {genreDisplay} archive has been processed through high-end analog gear and digital precision tools. 
                  Whether you are looking for earth-shaking 808s or ethereal melodies, our {genreDisplay} packs deliver the sonic impact your tracks need.
              </p>
              <div className="flex gap-4">
                  <div className="px-4 py-2 bg-black/40 border border-white/5 text-[10px] font-black uppercase">24-BIT WAV</div>
                  <div className="px-4 py-2 bg-black/40 border border-white/5 text-[10px] font-black uppercase">ROYALTY FREE</div>
                  <div className="px-4 py-2 bg-black/40 border border-white/5 text-[10px] font-black uppercase">STEMS INCLUDED</div>
              </div>
          </div>
          <div className="flex items-center justify-center opacity-10">
              <Disc size={200} className="animate-reverse-spin" />
          </div>
      </section>

      {packs && packs.length > 0 && (
          <div className="mb-32">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-12 flex items-center gap-4 text-white/40 border-b border-white/5 pb-4">
                  <Layers className="h-6 w-6 text-studio-neon" /> {genreDisplay} Packs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {packs.map((pack: any) => (
                      <Link key={pack.id} href={`/packs/${pack.slug}`} className="group relative">
                          <div className="aspect-square relative overflow-hidden border-2 border-white/5 group-hover:border-studio-neon transition-all">
                              {pack.cover_url && (
                                  <Image 
                                    src={pack.cover_url} 
                                    alt={pack.name} 
                                    fill 
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                                  />
                              )}
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all flex items-end p-6">
                                  <h3 className="text-2xl font-black uppercase italic tracking-tight">{pack.name}</h3>
                              </div>
                          </div>
                      </Link>
                  ))}
              </div>
          </div>
      )}

      {samples.length > 0 && (
          <div className="mb-32">
               <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-12 flex items-center gap-4 text-white/40 border-b border-white/5 pb-4">
                  <Zap className="h-6 w-6 text-studio-neon" /> Individual {genreDisplay} Sounds
              </h2>
              <SampleList 
                  samples={samples} 
                  packName={`${genreDisplay} Collection`} 
                  coverUrl={null} 
              />

              {samples && samples.length > 0 && (
                  <div className="mt-20">
                      <Pagination 
                          currentPage={pageVal} 
                          totalCount={count ?? 0} 
                          pageSize={pageSize} 
                          baseUrl={`/genres/${genre}`}
                          searchParams={sParams}
                      />
                  </div>
              )}
          </div>
      )}

      <footer className="py-24 border-t-4 border-black text-center">
            <Link href="/browse" className="inline-flex items-center gap-4 text-studio-neon hover:text-white transition-colors uppercase font-black tracking-[0.4em] italic">
                <ArrowLeft size={20} /> Return to Global Signal Matrix
            </Link>
      </footer>
    </div>
  )
}
