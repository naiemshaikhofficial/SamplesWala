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
  searchParams: { q?: string; category?: string; type?: string }
}) {
  const params = await (searchParams as any)
  const categories = await getAllCategories()
  
  // ⚡ FETCH PRO-DATA
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
      {/* 🎰 THE VAULT: COMMAND CENTER */}
      <header className="border-b-8 border-white px-6 md:px-20 py-24 bg-black relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Disc className="h-96 w-96 animate-spin-slow" />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
            <div className="max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-2 w-12 bg-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50">Frequency Discovery Agent</span>
                </div>
                <h1 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] mb-12 italic">
                    The<br />Vault
                </h1>
                <div className="flex items-center gap-8 text-white/20 text-xs font-black uppercase tracking-widest border-t border-white/10 pt-8">
                    <span>Artifacts Found: {(packs?.length || 0) + (samples?.length || 0)}</span>
                    <span className="h-1 w-1 bg-white/20 rounded-full" />
                    <span>Query: {params.q || 'FULL_ACCESS'}</span>
                </div>
            </div>
            
            <form action="/browse" className="relative w-full max-w-lg mb-1">
                <input type="hidden" name="category" value={params.category || ''} />
                <div className="flex items-center gap-4 border-b-4 border-white pb-4">
                    <Search className="h-8 w-8 text-white" />
                    <input 
                        name="q"
                        type="text" 
                        autoComplete="off"
                        placeholder="IDENTIFY FREQUENCY..." 
                        defaultValue={params.q}
                        className="w-full bg-transparent text-3xl font-black uppercase tracking-widest focus:outline-none placeholder:text-white/5"
                    />
                </div>
            </form>
        </div>

        {/* 🎞️ RAPID FILTERS */}
        <div className="mt-16 flex flex-wrap items-center gap-2">
            <Link 
                href={`/browse${params.q ? `?q=${params.q}` : ''}`}
                className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${!params.category ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
            >
                [ ALL_GENRES ]
            </Link>
            {categories?.map((cat: any) => (
                <Link 
                    key={cat.id} 
                    href={`/browse?category=${cat.id}${params.q ? `&q=${params.q}` : ''}`}
                    className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${params.category === cat.id ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                >
                    {cat.name}
                </Link>
            ))}
        </div>
      </header>

      <main className="bg-black">
        {/* 📦 COLLECTIONS GRID (THE ART PACKS) */}
        {packs && packs.length > 0 && (
            <section>
                <div className="px-6 md:px-20 py-12 flex items-center justify-between border-b border-white/10">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-white flex items-center gap-4">
                        <ArrowRight className="h-4 w-4" /> Collection Artifacts
                    </h2>
                    <div className="font-mono text-[10px] text-white/30 italic">Grid_Scan_Active</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-px bg-white/10">
                    {packs.map((pack: any) => (
                        <Link key={pack.id} href={`/packs/${pack.slug}`} className="group bg-black p-8 md:p-10 hover:bg-white transition-all">
                            <div className="aspect-square relative overflow-hidden bg-white/5 mb-8 group-hover:scale-95 transition-transform duration-500 bw-stark-border">
                                {pack.cover_url ? (
                                    <Image 
                                        src={pack.cover_url} 
                                        alt={pack.name} 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 15vw"
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Disc className="h-16 w-16 text-white/5 group-hover:text-black/5" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-black uppercase tracking-tighter leading-none group-hover:text-black transition-all truncate">
                                    {pack.name}
                                </h3>
                                <div className="flex items-center justify-between pt-4 border-t border-white/10 group-hover:border-black/20">
                                    <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} className="text-[10px] font-black group-hover:text-black" />
                                    <span className="text-[9px] font-black uppercase opacity-20 group-hover:opacity-40 group-hover:text-black">HQ_WAV</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        )}

        {/* 🎧 SOUND LIST (THE INDIVIDUAL SAMPLES) */}
        {samples && samples.length > 0 && (
            <section className="border-t-8 border-white">
                <div className="px-6 md:px-20 py-12 flex items-center justify-between bg-[#080808]">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-white flex items-center gap-4">
                        <ArrowRight className="h-4 w-4" /> Singular Artifacts
                    </h2>
                    <div className="font-mono text-[10px] text-white/30 italic">Frequency_List_Active</div>
                </div>
                <div className="divide-y divide-white/5">
                    {/* Header Row for Tablet/Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-8 px-20 py-4 text-[9px] font-black uppercase tracking-widest text-white/20 border-b border-white/10">
                        <div className="col-span-1">Action</div>
                        <div className="col-span-4">Sample_Ident</div>
                        <div className="col-span-1">Meta</div>
                        <div className="col-span-4 px-6 text-center">Spectral_Data</div>
                        <div className="col-span-2 text-right">Access</div>
                    </div>
                    {samples.map((sample: any) => (
                        <div key={sample.id} className="group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 px-4 md:px-20 py-6 md:py-10 items-center hover:bg-white transition-all bg-black">
                            <div className="md:col-span-1 flex items-center justify-between md:justify-start">
                                <PlayButton 
                                    id={sample.id} 
                                    url={sample.audio_url} 
                                    name={sample.name}
                                    packName={sample.sample_packs?.name}
                                    coverUrl={sample.sample_packs?.cover_url}
                                />
                                <div className="md:hidden flex flex-col items-start gap-1">
                                     <div className="font-black text-xl tracking-tight uppercase group-hover:text-black transition-all truncate max-w-[200px]">
                                        {sample.name}
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-black/40">
                                        {sample.bpm || '--'}_{sample.key || '--'}
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
                                <div className="font-black text-2xl tracking-tighter uppercase group-hover:text-black transition-all truncate">
                                    {sample.name}
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-2 group-hover:text-black/40 flex items-center gap-2">
                                    <Zap className="h-2 w-2" /> {sample.sample_packs?.name || 'STANDALONE'}
                                </div>
                            </div>

                            <div className="hidden md:col-span-1 md:flex flex-col gap-1 items-start text-[11px] font-black uppercase tracking-tight group-hover:text-black border-l border-white/10 group-hover:border-black/10 pl-4 h-full py-1">
                                <span>{sample.bpm || '--'}</span>
                                <span className="opacity-40">{sample.key || '--'}</span>
                            </div>

                            <div className="w-full md:col-span-4 px-0 md:px-6 h-12 flex items-center group-hover:invert transition-all">
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
            <div className="h-[80vh] flex flex-col items-center justify-center text-white/5 grayscale border-t-8 border-white p-20 text-center">
                <Activity className="h-64 w-64 mb-12 animate-pulse text-white/2" />
                <h3 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic mb-8">Signal_Lost</h3>
                <p className="text-lg font-black uppercase tracking-[0.5em] mb-12">No Artifacts Detected In This Sector</p>
                <Link href="/browse" className="px-20 py-8 bg-white text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">Reset Discovery Array</Link>
            </div>
        )}
      </main>
    </div>
  )
}
