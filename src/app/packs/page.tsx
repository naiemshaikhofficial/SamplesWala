import { createClient } from '@/lib/supabase/server'
import { getFilteredPacks } from '../browse/actions'
import Link from 'next/link'
import { SlidersHorizontal, Music, Zap, Disc, ArrowRight, Layers, Monitor, Cpu } from 'lucide-react'
import Image from 'next/image'
import { PriceDisplay } from '@/components/PriceDisplay'

export default async function SamplePacksPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  const params = await (searchParams as any)
  const packs = await getFilteredPacks({ query: params.q, category: params.category })
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*')

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 min-h-screen font-mono text-white bg-[#0a0a0a]">
      
      {/* 🎚️ PACKS_CATALOG_HEADER */}
      <header className="mb-16 md:mb-24 shrink-0">
        <div className="flex items-center gap-4 mb-8">
            <span className="px-4 py-1 bg-black border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-studio-neon italic">
                SOUND LIBRARY
            </span>
        </div>
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="flex-1">
                <h1 className="text-5xl md:text-7xl xl:text-[8vw] font-black tracking-tighter uppercase leading-[0.85] md:leading-[0.8] italic text-white shadow-studio-text">
                    SOUND <span className="text-studio-neon">PACKS</span>
                </h1>
            </div>

            <div className="flex gap-4 h-8 overflow-hidden hidden xl:flex">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-1 bg-studio-neon animate-peak opacity-10" style={{ animationDelay: `${i*0.1}s` }} />
                ))}
            </div>
        </div>
      </header>

      <main className="space-y-16">
          <div className="flex items-center justify-between border-b-4 border-black pb-8 mb-12">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white/40">
                  <Layers className="h-6 w-6 text-studio-neon" /> Full Catalog
              </h2>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">
                  TOTAL PACKS: {packs?.length || 0}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {packs?.map((pack: any) => (
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
                                alt={pack.name} 
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
                            VIEW PACK <ArrowRight size={14} className="inline ml-1" />
                        </div>
                    </div>
                </Link>
              </div>
            ))}
          </div>

          {(!packs || packs.length === 0) && (
            <div className="flex flex-col items-center justify-center py-40 border-4 border-dashed border-white/5 bg-black/20 rounded-sm opacity-30 shadow-inner">
                <Cpu size={64} className="mb-12 text-studio-neon animate-reverse-spin" />
                <h2 className="text-3xl font-black uppercase tracking-[0.6em] italic text-white">No Results Found</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] mt-8 italic text-white/40 leading-relaxed">We couldn't find any packs matching your search.</p>
            </div>
          )}
      </main>
    </div>
  )
}
