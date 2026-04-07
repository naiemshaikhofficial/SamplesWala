
import { createClient } from '@/lib/supabase/server'
import { getFilteredPacks, getFilteredSamples, getAllCategories } from './actions'
import Link from 'next/link'
import { 
  Search, Music, Zap, Disc, ArrowRight, Play, Download, Waves, Radio, 
  Volume2, Mic2, Settings2, Sparkles, Filter, Activity, Cpu, Layout, 
  Maximize2, MoveVertical, Timer, Terminal, Layers, Monitor, SlidersHorizontal, 
  Keyboard, X, Minus, Square, Folder, Database, HardDrive, Cpu as CpuIcon, 
  Cloud, Save, Key, UserCheck, FileJson 
} from 'lucide-react'
import Image from 'next/image'
import { PriceDisplay } from '@/components/PriceDisplay'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { Waveform } from '@/components/audio/Waveform'

import { SidebarFilters } from '@/components/browse/SidebarFilters'
import { SampleList } from '@/components/audio/SampleList'
import { Cable } from 'lucide-react'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { 
    q?: string; 
    category?: string; 
    type?: string; 
    filter?: string;
    bpm_min?: string;
    bpm_max?: string;
    key?: string;
  }
}) {
  const params = await (searchParams as any)
  const categories = await getAllCategories()
  
  // 🎹 Loading Sounds (Precision Search)
  const [packs, samples] = await Promise.all([
     getFilteredPacks({ 
        query: params.q, 
        category: params.category, 
        filter: params.filter, 
     }),
     getFilteredSamples({ 
        query: params.q, 
        category: params.category, 
        type: params.type,
        filter: params.filter,
        bpm_min: params.bpm_min ? parseInt(params.bpm_min) : undefined,
        bpm_max: params.bpm_max ? parseInt(params.bpm_max) : undefined,
        key: params.key
     })
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
        const unlockedIds = samples?.filter(s => {
            const directlyOwned = vaultItems.some(v => v.item_type === 'sample' && v.item_id === s.id)
            const packOwned = ownedPackIds.has(s.pack_id)
            return directlyOwned || packOwned
        }).map(s => s.id) || []
        unlockedSampleIds = new Set(unlockedIds)
    }
  }

  const hasNoResults = (!packs || packs.length === 0) && (!samples || samples.length === 0);

  const musicalKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 min-h-screen font-mono text-white bg-[#0a0a0a]">
      
      {/* 🎚️ BROWSER_TERMINAL_HEADER */}
      <header className="mb-16 md:mb-24 shrink-0">
        <div className="flex items-center gap-4 mb-8">
            <span className="px-4 py-1 bg-black border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-studio-neon italic">
                EXPLORE LIBRARY
            </span>
        </div>
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="flex-1">
                <h1 className="text-5xl md:text-7xl xl:text-[8vw] font-black tracking-tighter uppercase leading-[0.85] md:leading-[0.8] italic text-white shadow-studio-text">
                    SOUNDS <span className="text-studio-neon">LIBRARY</span>
                </h1>
            </div>

            <form action="/browse" className="relative w-full max-w-2xl mt-8 lg:mt-0">
                <div className="bg-studio-grey border-2 border-white/5 p-1 group focus-within:border-studio-neon transition-all relative">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-studio-neon transition-colors" />
                     <input 
                        name="q"
                        type="text" 
                        placeholder="Search for sounds..." 
                        defaultValue={params.q}
                        className="w-full bg-black px-16 py-5 border-none focus:ring-0 uppercase font-black tracking-widest text-base shadow-inner focus:outline-none"
                    />
                </div>
            </form>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start relative">
        
        {/* 🎛️ Search Filters (Col 1) */}
        <div className="lg:col-span-1">
            <SidebarFilters categories={categories} />
        </div>

        {/* 🎧 SOUND_GRID (Col 2-4) */}
        <main className="lg:col-span-3 space-y-32">
            
            {/* Packs Layout */}
            {packs && packs.length > 0 && (
                <div className="space-y-16">
                    <div className="flex items-center justify-between border-b-4 border-black pb-8">
                        <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white/40">
                            <Layers className="h-6 w-6 text-studio-neon" /> Sound Packs
                        </h2>
                        <div className="flex gap-1 h-4 overflow-hidden hidden sm:flex">
                             {[...Array(10)].map((_, i) => (
                                <div key={i} className="w-1 bg-studio-neon/10 animate-peak" style={{ animationDelay: `${i*0.1}s` }} />
                             ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10">
                        {packs.map((pack: any) => (
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
                                            VIEW DETAILS
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Individual Sounds List */}
            {samples && samples.length > 0 && (
                <div className="space-y-16">
                    <div className="flex items-center justify-between border-b-4 border-black pb-8">
                        <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white/40">
                            <Zap className="h-6 w-6 text-studio-neon" /> Individual Sounds
                        </h2>
                    </div>
                    <SampleList 
                        samples={samples} 
                        packName="Browse Results" 
                        coverUrl={null} 
                        unlockedSampleIds={unlockedSampleIds} 
                        isFullPackUnlocked={false} 
                    />
                </div>
            )}

            {hasNoResults && (
              <div className="flex flex-col items-center justify-center py-40 border-4 border-dashed border-white/5 bg-black/20 rounded-sm opacity-30 shadow-inner">
                  <Cpu size={64} className="mb-12 text-studio-neon animate-reverse-spin" />
                  <h2 className="text-3xl font-black uppercase tracking-[0.6em] italic text-white">No sounds found</h2>
                  <p className="text-[10px] uppercase tracking-[0.4em] mt-8 italic text-white/40 leading-relaxed">Adjust your filters to find sounds</p>
              </div>
            )}
        </main>
      </div>
    </div>
  )
}
