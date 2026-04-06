import { createClient } from '@/lib/supabase/server'
import { getFilteredPacks, getFilteredSamples, getAllCategories } from './actions'
import Link from 'next/link'
import { Search, Music, Zap, Disc, ArrowRight, Play, Download, Waves, Radio, Volume2, Mic2, Settings2, Sparkles, Filter, Activity, Monitor } from 'lucide-react'
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
  
  // 🎙️ FETCH SOUND DATA (With Circuit Breakers active)
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
    <div className="min-h-screen bg-black text-white selection:bg-studio-yellow selection:text-black lg:pl-20 relative overflow-hidden">
      
      {/* 🧬 STUDIO BACKGROUND DECOR (Speakers & Waves) */}
      <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none -z-0 lg:block hidden">
          <div className="flex flex-col gap-20">
              <div className="h-96 w-96 border-4 border-white rounded-full animate-pulse flex items-center justify-center">
                  <Volume2 className="h-48 w-48" />
              </div>
              <div className="h-96 w-96 border-4 border-spider-red rounded-full animate-ping flex items-center justify-center">
                  <Mic2 className="h-48 w-48" />
              </div>
          </div>
      </div>

      {/* 🎧 MAIN HEADER: SOUND LIBRARY */}
      <header className="px-6 md:px-20 py-24 bg-black relative border-b border-white/10">
        <div className="max-w-7xl mx-auto">
            {/* 🎙️ Level Indicators (Music Aesthetic) */}
            <div className="flex items-end gap-1 mb-12 h-10 opacity-20">
                {[...Array(32)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-1 shadow-[0_0_10px_currentColor] transition-all duration-300 ${i % 4 === 0 ? 'bg-spider-red h-[80%]' : 'bg-studio-yellow h-[40%]'}`}
                        style={{ height: `${20 + Math.random() * 80}%` }}
                    />
                ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-16">
                <div className="space-y-6 text-left">
                    <div className="flex items-center gap-4">
                        <Radio className="h-6 w-6 text-spider-red animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">Established Studio. 2024</span>
                    </div>
                    <h1 className="text-7xl md:text-[8rem] font-black uppercase tracking-tighter italic leading-[0.8] flex items-center gap-6">
                        Sound <span className="text-studio-yellow underline decoration-spider-red decoration-8 underline-offset-[16px]">Library</span>
                    </h1>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-[0.4em] pt-4">Explore premium high-definition samples for your track.</p>
                </div>

                {/* 🔎 ENHANCED SEARCH */}
                <form action="/browse" className="relative w-full max-w-xl self-end group">
                    <input type="hidden" name="category" value={params.category || ''} />
                    <div className="flex items-center gap-6 bg-white/[0.03] border-4 border-white/10 px-10 py-8 group-hover:border-studio-yellow transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <Search className="h-10 w-10 text-white/20 group-hover:text-studio-yellow" />
                        <input 
                            name="q"
                            type="text" 
                            autoComplete="off"
                            placeholder="Find your next sound..." 
                            defaultValue={params.q}
                            className="bg-transparent text-3xl font-black uppercase tracking-widest focus:outline-none placeholder:text-white/5 w-full caret-spider-red"
                        />
                        <div className="h-3 w-3 rounded-full bg-spider-red animate-ping" />
                    </div>
                </form>
            </div>

            {/* 🎞️ FILTER SLIDER (GENRES) */}
            <div className="mt-20 space-y-8">
                <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em] text-white/30 border-b border-white/5 pb-4">
                    <Filter className="h-4 w-4" /> Filter By Genre
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link 
                        href={`/browse${params.q ? `?q=${params.q}` : ''}${params.type ? `&type=${params.type}` : ''}`}
                        className={`px-10 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-2 ${!params.category ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-black border-white/10 text-white/30 hover:border-white/40 hover:text-white'}`}
                    >
                        All Sounds
                    </Link>
                    {categories?.map((cat: any) => (
                        <Link 
                            key={cat.id} 
                            href={`/browse?category=${cat.id}${params.q ? `?q=${params.q}` : ''}${params.type ? `&type=${params.type}` : ''}`}
                            className={`px-10 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-2 ${params.category === cat.id ? 'bg-studio-yellow text-black border-studio-yellow shadow-[0_0_30px_rgba(255,200,0,0.2)]' : 'bg-black border-white/10 text-white/30 hover:border-white/40 hover:text-white'}`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* 🏮 TYPE SELECTOR */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
                {[
                    { label: 'LOOPS', id: 'loop', icon: Waves },
                    { label: 'ONE-SHOTS', id: 'oneshot', icon: Zap },
                    { label: 'MIDI', id: 'midi', icon: Settings2 },
                    { label: 'VOCALS', id: 'vocal', icon: Mic2 }
                ].map((vibe) => (
                    <Link 
                        key={vibe.id}
                        href={`/browse?type=${vibe.id}${params.q ? `&q=${params.q}` : ''}${params.category ? `&category=${params.category}` : ''}`}
                        className={`px-8 py-3.5 text-[11px] font-black uppercase tracking-widest flex items-center gap-4 transition-all border-2 ${params.type === vibe.id ? 'bg-spider-red border-spider-red text-white shadow-[0_0_30px_rgba(225,29,72,0.2)]' : 'bg-black border-white/10 text-white/20 hover:border-white'}`}
                    >
                        <vibe.icon className="h-4 w-4" />
                        {vibe.label}
                    </Link>
                ))}
                {params.type && (
                   <Link href={`/browse?${params.q ? `q=${params.q}` : ''}${params.category ? `&category=${params.category}` : ''}`} 
                         className="h-12 px-6 flex items-center justify-center bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-spider-red hover:text-white transition-all ml-4">
                      Reset
                   </Link>
                )}
            </div>
        </div>
      </header>

      <main className="bg-black">
        {/* 📦 BUNDLES & PACKS (Section Title) */}
        {packs && packs.length > 0 && (
            <section className="px-6 md:px-20 py-24 relative border-b border-white/5">
                <div className="max-w-7xl mx-auto mb-20 flex items-center justify-between">
                    <div className="flex flex-col gap-3">
                        <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-8 italic">
                            <Disc className="h-12 w-12 text-studio-yellow animate-spin-slow" /> Sound Packs
                        </h2>
                        <p className="text-white/20 text-[11px] font-bold uppercase tracking-[0.5em]">Curated high-definition collections</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {packs.map((pack: any) => (
                        <Link key={pack.id} href={`/packs/${pack.slug}`} className="group relative block bg-[#080808] p-10 border-2 border-white/5 hover:border-studio-yellow transition-all duration-700 overflow-hidden">
                            {/* 🎧 Hover Overlay Decoration */}
                            <div className="absolute top-0 left-0 w-3 h-3 bg-studio-yellow animate-pulse" />
                            <div className="absolute bottom-0 right-0 w-20 h-1 bg-spider-red scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-700" />
                            
                            <div className="aspect-square relative overflow-hidden bg-black mb-10 border-4 border-white/5 group-hover:border-studio-yellow/20 transition-colors">
                                {pack.cover_url ? (
                                    <Image 
                                        src={pack.cover_url} 
                                        alt={pack.name} 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 15vw"
                                        className="object-cover transition-all duration-1000 group-hover:scale-125 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" 
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Music className="h-20 w-20 text-white/5 group-hover:text-studio-yellow/20" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none group-hover:text-studio-yellow transition-all italic">
                                    {pack.name}
                                </h3>
                                <div className="flex items-center justify-between pt-8 border-t border-white/10 group-hover:border-studio-yellow/20 transition-colors">
                                    <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} className="text-base font-black tracking-tighter" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-white">Studio.WAV</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        )}

        {/* 🎧 INDIVIDUAL SOUNDS LIST */}
        {samples && samples.length > 0 && (
            <section className="px-6 md:px-20 py-32 bg-[#050505] border-t-[32px] border-white">
                <div className="max-w-7xl mx-auto mb-20 flex items-center justify-between">
                    <div className="flex flex-col gap-3">
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-spider-red flex items-center gap-8 italic">
                            <Activity className="h-12 w-12 text-studio-yellow animate-pulse" /> All Sounds
                        </h2>
                        <p className="text-white/20 text-[11px] font-bold uppercase tracking-[0.5em]">Individual sound signatures for your DAW</p>
                    </div>
                </div>

                <div className="divide-y-8 divide-white/5 border-t border-white/10 bg-black">
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-12 gap-10 px-16 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/20">
                        <div className="col-span-1">Track</div>
                        <div className="col-span-4">Sound Identification</div>
                        <div className="col-span-1">Specs</div>
                        <div className="col-span-4 px-12 text-center border-x border-white/5">Wave Signature</div>
                        <div className="col-span-2 text-right">Get File</div>
                    </div>

                    {samples.map((sample: any) => (
                        <div key={sample.id} className="group grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 px-8 md:px-16 py-12 md:py-16 items-center hover:bg-white transition-all duration-700 relative overflow-hidden">
                            {/* 🎙️ Animated Background Overlay */}
                            <div className="absolute top-0 right-0 w-0 h-full bg-studio-yellow/[0.05] group-hover:w-full transition-all duration-1000 pointer-events-none" />
                            
                            <div className="md:col-span-1 flex items-center justify-between md:justify-start relative z-10">
                                <PlayButton 
                                    id={sample.id} 
                                    url={sample.audio_url} 
                                    name={sample.name}
                                    packName={sample.sample_packs?.name}
                                    coverUrl={sample.sample_packs?.cover_url}
                                />
                                <div className="md:hidden flex flex-col items-start gap-2">
                                     <div className="font-black text-3xl tracking-tighter uppercase group-hover:text-black transition-all italic">
                                        {sample.name}
                                    </div>
                                    <div className="text-[11px] font-black uppercase tracking-widest text-spider-red flex items-center gap-2">
                                        <Volume2 className="h-3 w-3" /> {sample.bpm || '--'} BPM // {sample.key || '--'}
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

                            <div className="hidden md:block md:col-span-4 relative z-10">
                                <div className="font-black text-5xl tracking-tighter uppercase group-hover:text-black transition-all italic truncate">
                                    {sample.name}
                                </div>
                                <div className="text-[11px] font-black uppercase tracking-widest text-white/20 mt-4 group-hover:text-black/40 flex items-center gap-4">
                                    <Mic2 className="h-4 w-4 text-studio-yellow" /> From {sample.sample_packs?.name || 'Standalone Sound'}
                                </div>
                            </div>

                            <div className="hidden md:col-span-1 md:flex flex-col gap-3 items-start text-base font-black uppercase italic group-hover:text-black border-l-4 border-white/5 group-hover:border-black/10 pl-8 h-full py-4 relative z-10">
                                <span>{sample.bpm || '--'}</span>
                                <span className="opacity-40 group-hover:opacity-100 text-studio-yellow group-hover:text-spider-red">{sample.key || '--'}</span>
                            </div>

                            <div className="w-full md:col-span-4 px-0 md:px-12 h-20 flex items-center relative z-10 group-hover:grayscale">
                                <Waveform id={sample.id} active={true} />
                            </div>

                            <div className="hidden md:block md:col-span-2 text-right relative z-10">
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
            <div className="h-[95vh] flex flex-col items-center justify-center text-white/5 border-t-[64px] border-white p-20 text-center relative bg-black overflow-hidden">
                <Volume2 className="h-[40rem] w-[40rem] mb-20 animate-ping text-white/5 absolute pointer-events-none" />
                <h3 className="text-9xl md:text-[20rem] font-black uppercase tracking-tighter italic mb-16 text-white/10 opacity-20 relative z-10">Silence</h3>
                <p className="text-3xl font-black uppercase tracking-[0.8em] mb-24 text-spider-red animate-pulse relative z-10">Check your frequency</p>
                <Link href="/browse" className="px-32 py-12 bg-studio-yellow text-black text-lg font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_100px_rgba(255,200,0,0.3)] relative z-10">
                   Reset Signals
                </Link>
            </div>
        )}
      </main>

      {/* 🧬 STUDIO FOOTER: THE HUB */}
      <footer className="border-t-[32px] border-white px-6 md:px-20 py-40 bg-black relative lg:pl-20 overflow-hidden">
          {/* 🎙️ Animated Background Decor */}
          <div className="absolute bottom-0 right-0 p-20 opacity-[0.03] rotate-12">
              <Disc className="h-[600px] w-[600px] animate-spin-slow" />
          </div>

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-32 relative z-10">
              <div className="space-y-16">
                  <div className="flex items-center gap-8">
                      <div className="h-24 w-24 bg-studio-yellow rounded-full flex items-center justify-center p-6 shadow-[0_0_50px_rgba(255,200,0,0.3)]">
                          <Music className="h-full w-full text-black" />
                      </div>
                      <h2 className="text-7xl font-black uppercase tracking-widest italic">Samples Wala</h2>
                  </div>
                  <p className="text-white/30 text-sm font-black uppercase tracking-[0.5em] leading-[2.5] max-w-md border-l-8 border-spider-red pl-10">
                      Standardized audio signatures for the modern DAW. Established Mumbai 2024.
                  </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-32">
                   <div className="space-y-12">
                       <span className="text-xs font-black uppercase tracking-[0.6em] text-spider-red block">Record Store</span>
                       <ul className="space-y-6 text-[14px] font-black uppercase tracking-[0.3em] text-white/40">
                           <li><Link href="/browse" className="hover:text-studio-yellow transition-all">All Sounds</Link></li>
                           <li><Link href="/packs" className="hover:text-studio-yellow transition-all">Sound Packs</Link></li>
                           <li><Link href="/pricing" className="hover:text-studio-yellow transition-all">Plans</Link></li>
                       </ul>
                   </div>
                   <div className="space-y-12">
                       <span className="text-xs font-black uppercase tracking-[0.6em] text-studio-yellow block">Producer Area</span>
                       <ul className="space-y-6 text-[14px] font-black uppercase tracking-[0.3em] text-white/40">
                           <li><Link href="/library" className="hover:text-spider-red transition-all">Private Store</Link></li>
                           <li><Link href="/profile" className="hover:text-spider-red transition-all">Identity</Link></li>
                           <li><Link href="/license" className="hover:text-spider-red transition-all">Rights</Link></li>
                       </ul>
                   </div>
              </div>
          </div>
          <div className="mt-64 pt-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-12 opacity-30">
               <span className="text-[10px] font-black uppercase tracking-[0.8em]">
                   SAMPLES WALA // MUZIC TECH CO. 2026
               </span>
               <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-widest">
                   <Link href="/terms">Rules</Link>
                   <Link href="/privacy">Privacy</Link>
               </div>
          </div>
      </footer>

    </div>
  )
}
