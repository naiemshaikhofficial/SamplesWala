
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
import { SampleList } from '@/components/browse/SampleList'
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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-studio-neon selection:text-black relative overflow-hidden font-mono">
      
      {/* 🎚️ BROWSER_TERMINAL_HEADER */}
      <header className="px-6 md:px-16 py-10 bg-[#0f0f0f] border-b-2 border-black relative">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-8">
                <div className="h-10 w-1 bg-studio-neon" />
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">SOUNDS <span className="text-studio-neon">LIBRARY</span></h1>
            </div>

            <form action="/browse" className="relative w-full max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                <input 
                    name="q"
                    type="text" 
                    placeholder="Search sounds..." 
                    defaultValue={params.q}
                    className="w-full bg-black px-16 py-4 border-2 border-white/5 focus:border-studio-neon transition-all uppercase font-black tracking-widest text-lg focus:outline-none"
                />
            </form>
        </div>
      </header>

      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row min-h-[calc(100vh-140px)]">
        
        {/* 🎛️ Search Filters */}
        <SidebarFilters categories={categories} />

        {/* 🎧 SOUND_GRID */}
        <main className="flex-1 p-8 md:p-12 space-y-24 bg-[#080808]">
            
            {/* Packs Layout */}
            {packs && packs.length > 0 && (
                <div className="space-y-12">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-white/10">
                        <Folder size={12} className="text-studio-neon" /> Sound Packs
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {packs.map((pack: any) => (
                            <div key={pack.id} className="bg-[#111] border-2 border-white/5 hover:border-studio-neon transition-all p-4 group">
                                <Link href={`/packs/${pack.slug}`}>
                                    <div className="aspect-square relative overflow-hidden mb-6 bg-black">
                                        {pack.cover_url ? (
                                            <Image 
                                                src={pack.cover_url} 
                                                alt={pack.name} 
                                                fill 
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover grayscale-0 group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                                <Disc size={64} />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest truncate group-hover:text-studio-neon transition-colors">{pack.name}</h3>
                                    <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                                        <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} className="text-[10px] font-black" />
                                        <ArrowRight size={14} className="text-white/10 group-hover:text-studio-neon group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Individual Sounds List */}
            {samples && samples.length > 0 && (
                <SampleList samples={samples} unlockedSampleIds={unlockedSampleIds} />
            )}

            {hasNoResults && (
              <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 opacity-40">
                  <Cpu size={48} className="mb-10 text-studio-neon animate-pulse" />
                  <h2 className="text-2xl font-black uppercase tracking-[0.5em]">No Sounds Found</h2>
                  <p className="text-[10px] uppercase tracking-[0.3em] mt-4 italic">Try adjusting your filters</p>
              </div>
            )}
        </main>
      </div>
    </div>
  )
}
