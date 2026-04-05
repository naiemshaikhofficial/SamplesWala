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
  searchParams: { q?: string; category?: string; mode?: 'packs' | 'samples' }
}) {
  const params = await (searchParams as any)
  const mode = params.mode || 'packs'
  const categories = await getAllCategories()
  
  const packs = mode === 'packs' ? await getFilteredPacks({ query: params.q, category: params.category }) : []
  const samples = mode === 'samples' ? await getFilteredSamples({ query: params.q, category: params.category }) : []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let unlockedSampleIds: Set<string> = new Set()
  if (user) {
    const { data: unlocks } = await supabase.from('unlocked_samples').select('sample_id').eq('user_id', user.id)
    if (unlocks) {
      unlockedSampleIds = new Set(unlocks.map(u => u.sample_id))
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20">
      {/* 🎰 THE VAULT HEADER */}
      <header className="border-b border-white/10 px-6 md:px-20 py-16 bg-black">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
            <div className="max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 block">Discovery Agent</span>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4 italic">The Vault</h1>
                <p className="text-white/20 text-xs font-black uppercase tracking-widest">Querying: {params.q || 'ALL ARTIFACTS'}</p>
            </div>
            
            <form action="/browse" className="relative w-full max-w-md">
                <input type="hidden" name="mode" value={mode} />
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
                href={`/browse?mode=${mode}${params.q ? `&q=${params.q}` : ''}`}
                className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${!params.category ? 'bg-white text-black' : 'border border-white/10 text-white/40 hover:text-white'}`}
            >
                All Genres
            </Link>
            {categories?.map((cat: any) => (
                <Link 
                    key={cat.id} 
                    href={`/browse?mode=${mode}&category=${cat.id}${params.q ? `&q=${params.q}` : ''}`}
                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${params.category === cat.id ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white hover:text-white'}`}
                >
                    {cat.name}
                </Link>
            ))}
        </div>
      </header>

      {/* 🎚️ MODE TOGGLE */}
      <div className="flex bg-white/5 border-b border-white/10 sticky top-24 z-40 backdrop-blur-xl">
        <Link 
            href={`/browse?mode=packs${params.category ? `&category=${params.category}` : ''}${params.q ? `&q=${params.q}` : ''}`}
            className={`flex-1 h-16 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.4em] transition-all border-r border-white/10 ${mode === 'packs' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
        >
            Collections
        </Link>
        <Link 
            href={`/browse?mode=samples${params.category ? `&category=${params.category}` : ''}${params.q ? `&q=${params.q}` : ''}`}
            className={`flex-1 h-16 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.4em] transition-all ${mode === 'samples' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
        >
            Singular Sounds
        </Link>
      </div>

      <main className="bg-[#050505]">
        {mode === 'packs' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[1px] bg-white/10 border-b border-white/10">
                {packs?.map((pack: any) => (
                    <Link key={pack.id} href={`/packs/${pack.slug}`} className="group bg-black p-12 hover:bg-white transition-all">
                        <div className="aspect-square relative overflow-hidden bg-[#111] mb-10 group-hover:scale-95 transition-transform duration-700">
                            {pack.cover_url ? (
                                <Image src={pack.cover_url} alt={pack.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Disc className="h-24 w-24 text-white/5 group-hover:text-black/5" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-8">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-black/40 mb-3 block">
                                    {pack.categories?.name}
                                </span>
                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none group-hover:text-black transition-all">
                                    {pack.name}
                                </h3>
                            </div>
                            <div className="flex items-center justify-between pt-8 border-t border-white/10 group-hover:border-black/10">
                                <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} className="text-xs font-black uppercase group-hover:text-black" />
                                <div className="bg-white/5 group-hover:bg-black/5 p-2 transition-all">
                                    <ArrowRight className="h-3 w-3 text-white/20 group-hover:text-black" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            <div className="divide-y divide-white/10">
                {samples?.map((sample: any) => (
                    <div key={sample.id} className="group grid grid-cols-12 gap-8 px-6 md:px-20 py-10 items-center hover:bg-white transition-all">
                        <div className="col-span-1">
                            <PlayButton 
                                id={sample.id} 
                                url={sample.audio_url} 
                                name={sample.name}
                                packName={sample.sample_packs?.name}
                                coverUrl={sample.sample_packs?.cover_url}
                            />
                        </div>
                        <div className="col-span-5 md:col-span-4">
                            <div className="font-black text-xl tracking-tighter uppercase group-hover:text-black transition-all truncate">
                                {sample.name}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1 group-hover:text-black/40">
                                {sample.sample_packs?.name}
                            </div>
                        </div>
                        <div className="hidden md:col-span-2 md:flex flex-col gap-1 items-start text-xs font-black uppercase tracking-widest group-hover:text-black">
                            <span>{sample.bpm || '--'} BPM</span>
                            <span className="text-[9px] opacity-40">{sample.key || '--'}</span>
                        </div>
                        <div className="col-span-4 md:col-span-3 px-6">
                            <div className="h-10 flex items-center justify-center group-hover:invert transition-all">
                                <Waveform id={sample.id} active={true} />
                            </div>
                        </div>
                        <div className="col-span-2 text-right">
                             <DownloadButton 
                                sampleId={sample.id} 
                                isUnlockedInitial={unlockedSampleIds.has(sample.id)} 
                                creditCost={sample.credit_cost}
                            />
                        </div>
                    </div>
                ))}
            </div>
        )}

        {((mode === 'packs' && (!packs || packs.length === 0)) || (mode === 'samples' && (!samples || samples.length === 0))) && (
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
