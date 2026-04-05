import { createClient } from '@/lib/supabase/server'
import { getFilteredPacks } from './actions'
import Link from 'next/link'
import { Search, SlidersHorizontal, Music, Zap, Disc } from 'lucide-react'
import Image from 'next/image'
import { PriceDisplay } from '@/components/PriceDisplay'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  const params = await (searchParams as any)
  const packs = await getFilteredPacks({ query: params.q, category: params.category })
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*')

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Find Your Sound</h1>
        <form action="/browse" className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            name="q"
            type="text" 
            placeholder="Search packs..." 
            defaultValue={params.q}
            className="w-full bg-white/5 border border-white/10 rounded-full h-11 pl-10 pr-4 text-sm focus:ring-1 focus:ring-white transition-all outline-none"
          />
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-64 space-y-8 shrink-0">
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4">Categories</h3>
            <div className="space-y-1">
              <Link href="/browse" className={`block px-3 py-2 rounded-lg text-sm transition-all ${!params.category ? 'bg-white text-black font-bold' : 'hover:bg-white/5'}`}>
                All Sounds
              </Link>
              {categories?.map((cat: any) => (
                <Link key={cat.id} href={`/browse?category=${cat.id}`} className={`block px-3 py-2 rounded-lg text-sm transition-all ${params.category === cat.id ? 'bg-white text-black font-bold' : 'hover:bg-white/5'}`}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
             <h3 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4">Market Stats</h3>
             <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3 text-xs">
                   <div className="bg-white/10 p-2 rounded-md"><Disc className="h-4 w-4" /></div>
                   <span className="font-bold">{packs?.length || 0} Premium Packs</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                   <div className="bg-white/10 p-2 rounded-md"><Music className="h-4 w-4" /></div>
                   <span className="text-white/60">Royalty-Free Assets</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                   <div className="bg-white/10 p-2 rounded-md"><Zap className="h-4 w-4" /></div>
                   <span className="text-white/60">Instant Digital Delivery</span>
                </div>
             </div>
          </div>
        </aside>

        <main className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {packs?.map((pack: any) => (
              <Link key={pack.id} href={`/packs/${pack.slug}`} className="group flex flex-col p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all active:scale-[0.98]">
                <div className="aspect-square relative overflow-hidden rounded-xl bg-white/5 mb-4 group-hover:shadow-2xl transition-all">
                  {pack.cover_url ? (
                    <Image src={pack.cover_url} alt={pack.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-white/5 font-black italic text-3xl uppercase tracking-tighter mix-blend-overlay">
                        WALA
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-1 rounded-md">View Pack</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">{pack.categories?.name}</span>
                </div>
                <h3 className="font-bold text-lg leading-tight mb-4 uppercase tracking-tight line-clamp-1">{pack.name}</h3>
                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                  <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} className="text-sm font-black italic" />
                  <div className="h-4 w-4 opacity-20 group-hover:opacity-100 transition-opacity"><SlidersHorizontal className="h-full w-full" /></div>
                </div>
              </Link>
            ))}
            {(!packs || packs.length === 0) && (
              <div className="col-span-full py-20 text-center text-muted-foreground italic border-2 border-dashed border-white/5 rounded-3xl">
                No matching samples found for your current filters.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
