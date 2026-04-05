import { createClient } from '@/lib/supabase/server'
import { getFilteredPacks, getFilteredSamples, getAllCategories } from './actions'
import Link from 'next/link'
import { Search, SlidersHorizontal, Music, Zap, Disc, ArrowRight, ShieldCheck, Play, Download, Activity } from 'lucide-react'
import Image from 'next/image'
import { PriceDisplay } from '@/components/PriceDisplay'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { Waveform } from '@/components/audio/Waveform'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  const params = await (searchParams as any)
  const categories = await getAllCategories()
  
  // ⚡ FETCH BOTH SIMULTANEOUSLY (PRO-SEARCH)
  const [packs, samples] = await Promise.all([
     getFilteredPacks({ query: params.q, category: params.category }),
     getFilteredSamples({ query: params.q, category: params.category })
  ])

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let unlockedSampleIds: Set<string> = new Set()
  if (user) {
    const { data: unlocks } = await supabase.from('unlocked_samples').select('sample_id').eq('user_id', user.id)
    if (unlocks) {
      unlockedSampleIds = new Set(unlocks.map(u => u.sample_id))
    }
  }

  const hasNoResults = (!packs || packs.length === 0) && (!samples || samples.length === 0);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20">
      {/* 🎰 THE VAULT HEADER */}
      <header className="border-b border-white/10 px-6 md:px-20 py-16 bg-black">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
            <div className="max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 block">Discovery Agent</span>
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4 italic">The Vault</h1>
                <p className="text-white/20 text-xs font-black uppercase tracking-widest">Querying: {params.q || 'ALL ARTIFACTS'}</p>
            </div>
            
            <form action="/browse" className="relative w-full max-w-md">
                <input type="hidden" name="category" value={params.category || ''} />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input 
                    name="q"
                    type="text" 
                    placeholder="SEARCH YOUR SAMPLE..." 
                    defaultValue={params.q}
                    className="w-full bg-transparent border-b-2 border-white/20 h-16 px-0 text-lg font-black uppercase tracking-widest focus:border-white transition-all outline-none placeholder:text-white/10"
                />
            </form>
        </div>

        {/* 🎞️ GENRE STRIP */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar border-t border-white/5 pt-8">
            <Link 
                href={`/browse${params.q ? `?q=${params.q}` : ''}`}
                className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${!params.category ? 'bg-white text-black' : 'border border-white/10 text-white/40 hover:text-white'}`}
            >
                All Genres
            </Link>
            {categories?.map((cat: any) => (
                <Link 
                    key={cat.id} 
                    href={`/browse?category=${cat.id}${params.q ? `&q=${params.q}` : ''}`}
                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${params.category === cat.id ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white hover:text-white'}`}
                >
                    {cat.name}
                </Link>
            ))}
        </div>
      </header>

      <main className="bg-[#050505]">
        {/* 📦 COLLECTIONS SECTION */}
        {packs && packs.length > 0 && (
            <section className="bg-black">
                <div className="px-6 md:px-20 py-10 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Matching Collections</h2>
                    <span className="text-[10px] font-black px-3 py-1 bg-white/5 rounded-full text-white/40">{packs.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[1px] bg-white/5">
                    {packs.map((pack: any) => (
                        <Link key={pack.id} href={`/packs/${pack.slug}`} className="group bg-black p-8 md:p-12 hover:bg-white transition-all border-b border-white/5">
                            <div className="aspect-square relative overflow-hidden bg-[#111] mb-10 group-hover:scale-95 transition-transform duration-700">
                                {pack.cover_url ? (
                                    <Image 
                                        src={pack.cover_url} 
                                        alt={pack.name} 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Disc className="h-24 w-24 text-white/5 group-hover:text-black/5" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none group-hover:text-black transition-all truncate">
                                    {pack.name}
                                </h3>
                                <div className="flex items-center justify-between pt-6 border-t border-white/10 group-hover:border-black/10">
                                    <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} className="text-[10px] font-black uppercase group-hover:text-black" />
                                    <ArrowRight className="h-3 w-3 text-white/20 group-hover:text-black" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        )}

        {/* 🎧 SINGULAR SOUNDS SECTION */}
        {samples && samples.length > 0 && (
            <section className="bg-black pt-1 px-0">
                <div className="px-6 md:px-20 py-10 border-b border-white/5 flex items-center justify-between bg-[#050505]">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Matching Artifacts</h2>
                    <span className="text-[10px] font-black px-3 py-1 bg-white/5 rounded-full text-white/40">{samples.length}</span>
                </div>
                <div className="divide-y divide-white/10">
                    {samples.map((sample: any) => (
                        <div key={sample.id} className="group flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8 px-4 md:px-20 py-6 md:py-8 items-center hover:bg-white transition-all">
                            <div className="w-full md:col-span-1 flex items-center justify-between md:justify-start">
                                <PlayButton 
                                    id={sample.id} 
                                    url={sample.audio_url} 
                                    name={sample.name}
                                    packName={sample.sample_packs?.name}
                                    coverUrl={sample.sample_packs?.cover_url}
                                />
                                <div className="md:hidden">
                                     <div className="font-black text-lg tracking-tight uppercase group-hover:text-black transition-all truncate">
                                        {sample.name}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1 group-hover:text-black/40">
                                        {sample.bpm || '--'} BPM | {sample.key || '--'}
                                    </div>
                                </div>
                                <div className="md:hidden">
                                    <DownloadButton 
                                        sampleId={sample.id} 
                                        isUnlockedInitial={unlockedSampleIds.has(sample.id)} 
                                        creditCost={sample.credit_cost}
                                    />
                                </div>
                            </div>

                            <div className="hidden md:block md:col-span-4">
                                <div className="font-black text-xl tracking-tighter uppercase group-hover:text-black transition-all truncate">
                                    {sample.name}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1 group-hover:text-black/40 flex items-center gap-2">
                                    <Zap className="h-2 w-2" /> {sample.sample_packs?.name}
                                </div>
                            </div>

                            <div className="hidden md:col-span-1 md:flex flex-col gap-1 items-start text-[10px] font-black uppercase tracking-widest group-hover:text-black">
                                <span>{sample.bpm || '--'}</span>
                                <span className="opacity-40">{sample.key || '--'}</span>
                            </div>

                            <div className="w-full md:col-span-4 px-0 md:px-6 invisible md:visible h-0 md:h-auto overflow-hidden">
                                <Waveform id={sample.id} active={true} />
                            </div>

                            <div className="hidden md:block md:col-span-2 text-right">
                                <DownloadButton 
                                    sampleId={sample.id} 
                                    isUnlockedInitial={unlockedSampleIds.has(sample.id)} 
                                    creditCost={sample.credit_cost}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {hasNoResults && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-white/10 grayscale">
                <Activity className="h-32 w-32 mb-8 animate-pulse" />
                <p className="text-xl font-black uppercase tracking-widest italic">Signal Lost — No Artifacts Detected</p>
                <Link href="/browse" className="mt-8 px-12 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest">Reset Discovery</Link>
            </div>
        )}
      </main>
    </div>
  )
}
