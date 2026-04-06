
import { createClient } from '@/lib/supabase/server'
import { getFilteredPacks, getFilteredSamples, getAllCategories } from './actions'
import Link from 'next/link'
import { 
  Search, Music, Zap, Disc, ArrowRight, Play, Download, Waves, Radio, 
  Volume2, Mic2, Settings2, Sparkles, Filter, Activity, Cpu, Layout, 
  Maximize2, MoveVertical, Timer, Terminal, Layers, Monitor, SlidersHorizontal, 
  Keyboard, X, Minus, Square, Folder, Database, HardDrive, Cpu as CpuIcon, 
  Cable, Cloud, Save, Key, UserCheck, FileJson 
} from 'lucide-react'
import Image from 'next/image'
import { PriceDisplay } from '@/components/PriceDisplay'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { Waveform } from '@/components/audio/Waveform'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; type?: string; filter?: string }
}) {
  const params = await (searchParams as any)
  const categories = await getAllCategories()
  
  // 🎹 BOOTING SOUND ENGINE (Circuit Breakers active)
  const [packs, samples] = await Promise.all([
     getFilteredPacks({ query: params.q, category: params.category, filter: params.filter }),
     getFilteredSamples({ query: params.q, category: params.category, filter: params.filter })
  ])

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let unlockedSampleIds: Set<string> = new Set()
  if (user) {
    const { data: vaultItems } = await supabase
        .from('user_vault')
        .select('item_id, item_type')
        .eq('user_id', user.id)

    if (vaultItems) {
        const ownedPackIds = new Set(vaultItems.filter(v => v.item_type === 'pack').map(v => v.item_id))
        
        // A sample is considered unlocked if it's in the vault OR its pack is in the vault
        const unlockedIds = samples?.filter(s => {
            const directlyOwned = vaultItems.some(v => v.item_type === 'sample' && v.item_id === s.id)
            const packOwned = ownedPackIds.has(s.pack_id)
            return directlyOwned || packOwned
        }).map(s => s.id) || []
        
        unlockedSampleIds = new Set(unlockedIds)
    }
  }

  const hasNoResults = (!packs || packs.length === 0) && (!samples || samples.length === 0);

  return (
    <div className="min-h-screen bg-[#111] text-white selection:bg-studio-neon selection:text-black step-grid relative overflow-hidden font-mono transition-all duration-300">
      
      {/* 🎚️ PLAYLIST HEADER (Toolbar) */}
      <header className="px-6 md:px-16 py-12 bg-studio-grey border-b-4 border-black relative overflow-hidden">
        <div className="max-w-[1800px] mx-auto flex flex-col gap-16 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon bg-black/40 px-4 py-1 self-start border-l-4 border-studio-neon">
                        Playlist — Arrangement
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-1 bg-studio-neon shadow-[0_0_15px_#a6e22e]" />
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                            TRACK<span className="text-studio-neon">LIST</span>
                        </h1>
                    </div>
                </div>

                {/* 🔎 BROWSER SEARCH (Pattern Selection) */}
                <form action="/browse" className="relative w-full max-w-xl group">
                    <input type="hidden" name="category" value={params.category || ''} />
                    <div className="flex items-center gap-6 bg-black px-8 py-5 border-2 border-white/5 group-hover:border-studio-neon transition-all duration-500 shadow-inner">
                        <Search className="h-6 w-6 text-white/20 group-hover:text-studio-neon" />
                        <input 
                            name="q"
                            type="text" 
                            autoComplete="off"
                            placeholder="Find patterns..." 
                            defaultValue={params.q}
                            className="bg-transparent text-2xl font-black uppercase tracking-widest focus:outline-none placeholder:text-white/5 w-full caret-studio-neon"
                        />
                        <div className="h-2 w-2 rounded-full bg-spider-red animate-pulse" />
                    </div>
                </form>
            </div>

            {/* 🎞️ TRACK FILTERS (Insert Slots) */}
            <div className="flex flex-wrap gap-2 pt-8 border-t border-white/5">
                <Link 
                    href={`/browse${params.q ? `?q=${params.q}` : ''}${params.type ? `&type=${params.type}` : ''}`}
                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${!params.category ? 'bg-studio-neon text-black border-studio-neon' : 'bg-[#1a1a1a] border-white/10 text-white/30 hover:border-white'}`}
                >
                    [ All_Tracks ]
                </Link>
                {categories?.map((cat: any) => (
                    <Link 
                        key={cat.id} 
                        href={`/browse?category=${cat.id}${params.q ? `?q=${params.q}` : ''}${params.type ? `&type=${params.type}` : ''}`}
                        className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${params.category === cat.id ? 'bg-studio-neon text-black border-studio-neon' : 'bg-[#1a1a1a] border-white/5 text-white/20 hover:border-white'}`}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto py-24 px-6 lg:px-20 relative">
        
        {/* 📦 PLUGIN SLOTS (Sound Packs) */}
        {packs && packs.length > 0 && (
            <div className="mb-40">
                <div className="flex items-center gap-6 mb-16 opacity-40">
                    <Layers className="h-5 w-5 text-studio-yellow" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Plugin_Database::VST_Rack</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {packs.map((pack: any) => (
                        <div key={pack.id} className="studio-panel bg-studio-grey border-2 border-white/10 group shadow-2xl relative">
                            {/* VST Header Bar */}
                            <div className="bg-[#111] px-4 py-2 flex items-center justify-between border-b border-black">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 truncate pr-10">{pack.name}</span>
                                <div className="flex gap-1.5 grayscale opacity-40">
                                    <Minus size={10} />
                                    <Square size={8} />
                                    <X size={10} />
                                </div>
                            </div>
                            
                            <Link href={`/packs/${pack.slug}`} className="block p-4 bg-black/40 hover:bg-black transition-all">
                                <div className="aspect-square relative overflow-hidden mb-6 border border-white/5">
                                    {pack.cover_url ? (
                                        <Image 
                                            src={pack.cover_url} 
                                            alt={pack.name} 
                                            fill 
                                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 opacity-60 group-hover:opacity-100" 
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Monitor className="h-16 w-16 text-white/5" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} className="text-xs font-black" />
                                    <div className="px-3 py-1 bg-black text-[8px] font-black text-studio-neon tracking-widest border border-white/10 uppercase">
                                        Open_VST
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* 🎧 PLAYLIST ARRANGEMENT (Samples List) */}
        {samples && samples.length > 0 && (
            <div className="bg-black/60 shadow-2xl relative overflow-hidden border-2 border-white/5">
                <div className="px-10 py-6 bg-studio-grey flex items-center justify-between border-b-2 border-black">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white/40">Track_Playlist :: arrangement.flp</span>
                    <div className="flex gap-1 h-4">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="w-1 bg-studio-neon animate-peak" style={{ animationDelay: `${i*0.05}s` }} />
                        ))}
                    </div>
                </div>

                <div className="divide-y-2 divide-black">
                    {samples.map((sample: any, idx: number) => {
                        const trackColors = ['bg-[#ff7f50]', 'bg-[#98fb98]', 'bg-[#ffa07a]', 'bg-[#e0ffff]'];
                        const trackColor = trackColors[idx % trackColors.length];
                        const textColor = 'text-black';
                        
                        return (
                            <div key={sample.id} className="group flex flex-col md:flex-row items-stretch bg-studio-charcoal relative">
                                
                                {/* 🎹 Track Header (The Colored Tab) */}
                                <div className={`w-full md:w-80 ${trackColor} flex items-center px-8 py-10 md:py-16 gap-6 shadow-[inset_-4px_0_10px_rgba(0,0,0,0.3)] relative z-20`}>
                                    <div className="h-12 w-12 flex items-center justify-center bg-black/20 rounded-full">
                                        <PlayButton 
                                            id={sample.id} 
                                            url={sample.audio_url} 
                                            name={sample.name}
                                            packName={sample.sample_packs?.name}
                                            coverUrl={sample.sample_packs?.cover_url}
                                            lightMode={true}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xl font-black uppercase tracking-tighter ${textColor} leading-none truncate max-w-[180px]`}>{sample.name}</span>
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${textColor} opacity-40 mt-2 italic`}>Track_{idx + 1}</span>
                                    </div>
                                </div>

                                {/* 🎞️ Track Clip (The Waveform in Grid) */}
                                <div className="flex-1 min-h-[140px] step-grid bg-black/40 relative overflow-hidden flex items-center px-12 group-hover:bg-white/[0.03] transition-colors duration-700">
                                    <div className={`absolute top-4 bottom-4 left-4 right-4 ${trackColor} opacity-20 group-hover:opacity-40 transition-opacity border-l-[32px] border-black/40`} />
                                    
                                    <div className="w-full relative z-10 h-16 grayscale group-hover:grayscale-0 transition-all duration-700">
                                        <Waveform id={sample.id} active={true} />
                                    </div>

                                    {/* 🧬 Step Sequencer Buttons (16 Dots) */}
                                    <div className="absolute bottom-4 right-10 flex gap-2 opacity-5 mt-auto group-hover:opacity-40 transition-opacity scale-75 md:scale-100 origin-right">
                                        {[...Array(16)].map((_, i) => (
                                            <div key={i} className={`h-3 w-8 border border-white/10 ${i % 4 === 0 ? 'bg-white/20' : 'bg-black/40'}`} />
                                        ))}
                                    </div>

                                    {/* 📦 Download Control */}
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-10 group-hover:translate-x-0">
                                        <DownloadButton 
                                            sampleId={sample.id} 
                                            isUnlockedInitial={unlockedSampleIds.has(sample.id)} 
                                            creditCost={sample.credit_cost}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {hasNoResults && (
          <div className="flex flex-col items-center justify-center py-40 border-4 border-dashed border-white/5 opacity-40">
             <Radio className="w-24 h-24 mb-10 text-white/10" />
             <h2 className="text-4xl font-black uppercase tracking-[0.5em]">No_Signal</h2>
             <p className="text-xs uppercase tracking-widest mt-4">Try_Different_Frequency</p>
          </div>
        )}
      </main>

    </div>
  )
}
