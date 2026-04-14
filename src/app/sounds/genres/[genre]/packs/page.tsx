
export const revalidate = 3600;

import { Metadata } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFilteredPacks } from '@/app/browse/actions'
import Link from 'next/link'
import Image from 'next/image'
import { Layers, ArrowLeft } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }): Promise<Metadata> {
  const { genre } = await params
  const genreTitle = genre.charAt(0).toUpperCase() + genre.slice(1)
  
  const title = `Best ${genreTitle} Sample Packs & Drum Kits | SAMPLES WALA`
  const description = `Discover and download the best ${genreTitle} sample packs, loops, and drum kits. Professional royalty-free sounds for Your next ${genreTitle} production.`

  return {
    title,
    description,
    keywords: [
        `${genre} sample packs`, 
        `${genre} drum kits`, 
        `best ${genre} loops`, 
        'royalty free sample packs'
    ],
    openGraph: {
      title,
      description,
      url: `https://sampleswala.com/sounds/genres/${genre}/packs`,
      images: [{ url: '/og-genres.jpg' }]
    },
    alternates: {
      canonical: `/sounds/genres/${genre}/packs`
    }
  }
}

export default async function GenrePacksPage({ 
  params 
}: { 
  params: Promise<{ genre: string }> 
}) {
  const { genre } = await params
  const adminClient = getAdminClient()
  
  const { data: categories } = await adminClient
    .from('categories')
    .select('id, name')
    .ilike('name', genre)
  
  const category = categories?.[0]
  const packs = await getFilteredPacks({ category: category?.id })
  const genreDisplay = category?.name || genre.toUpperCase()

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 min-h-screen font-mono text-white">
      <Breadcrumbs 
        items={[
          { label: 'BROWSE', href: '/browse' },
          { label: genreDisplay, href: `/sounds/genres/${genre}` },
          { label: 'PACKS', href: `/sounds/genres/${genre}/packs`, active: true }
        ]} 
      />

      <header className="mb-24 mt-12">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-8">
            {genreDisplay} <span className="text-studio-neon">PACKS</span>
        </h1>
        <p className="text-xl text-white/40 max-w-2xl font-bold italic leading-tight">
            Comprehensive archive of professional {genreDisplay} sample packs and drum kits.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {packs && packs.map((pack: any) => (
              <a key={pack.id} href={`/packs/${pack.slug}`} className="group">
                  <div className="aspect-square relative overflow-hidden border-2 border-white/5 group-hover:border-studio-neon transition-all bg-studio-grey">
                      {pack.cover_url && (
                            <Image 
                              src={pack.cover_url} 
                              alt={pack.name} 
                              fill 
                              sizes="(max-width: 1024px) 100vw, 25vw"
                              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                            />
                      )}
                      <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-all flex flex-col justify-end p-6">
                          <h3 className="text-xl font-black uppercase italic tracking-tight leading-none mb-2">{pack.name}</h3>
                          <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{pack.categories?.name}</span>
                      </div>
                  </div>
              </a>
          ))}
      </div>

      <footer className="py-24 mt-32 border-t border-white/5 text-center">
            <a href={`/sounds/genres/${genre}`} className="inline-flex items-center gap-4 text-white/40 hover:text-studio-neon transition-colors uppercase font-black tracking-widest italic text-sm">
                <ArrowLeft size={16} /> All {genreDisplay} Sounds
            </a>
      </footer>
    </div>
  )
}
