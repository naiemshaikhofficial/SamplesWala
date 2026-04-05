import { createClient } from '@/lib/supabase/server'
import { getFilteredPacks } from '../browse/actions'
import Link from 'next/link'
import { SlidersHorizontal, Music, Zap, Disc } from 'lucide-react'
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
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none italic">All Sample Packs</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <main className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                </div>
                <h3 className="font-bold text-lg leading-tight mb-4 uppercase tracking-tight line-clamp-1">{pack.name}</h3>
                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                  <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} className="text-sm font-black italic" />
                </div>
              </Link>
            ))}
          </div>
          {(!packs || packs.length === 0) && (
            <div className="py-20 text-center text-muted-foreground italic border-2 border-dashed border-white/5 rounded-3xl">
              No sample packs found in the database.
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
