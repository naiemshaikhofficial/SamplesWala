import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Music, Download, ArrowLeft, Disc, LayoutGrid, Search, ShieldCheck, Activity, Layers, PlayCircle, Loader2 } from 'lucide-react'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { Waveform } from '@/components/audio/Waveform'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 1. Fetch USER_VAULT Entries
  const { data: vaultItems } = await supabase
    .from('user_vault')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const ownedSampleIds = vaultItems?.filter(v => v.item_type === 'sample').map(v => v.item_id) || []
  const ownedPackIds = vaultItems?.filter(v => v.item_type === 'pack').map(v => v.item_id) || []

  // 2. Fetch Full Data for those IDs
  const [samples, packs] = await Promise.all([
    ownedSampleIds.length > 0 
      ? supabase.from('samples').select('*, sample_packs(name, cover_url)').in('id', ownedSampleIds).then(res => res.data)
      : Promise.resolve([]),
    ownedPackIds.length > 0 
      ? supabase.from('sample_packs').select('*').in('id', ownedPackIds).then(res => res.data)
      : Promise.resolve([])
  ])

  // Aggregate stats
  const totalSounds = (samples?.length || 0)
  const totalCollections = (packs?.length || 0)

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-studio-neon selection:text-black font-mono overflow-x-hidden">
      
      {/* 🚀 VAULT_MATRIX_OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
           <div className="absolute inset-0 bg-[linear-gradient(rgba(166,226,46,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(166,226,46,0.1)_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <div className="container mx-auto max-w-[1600px] px-6 md:px-12 py-20 relative z-10">
        
        {/* 📟 TERMINAL_HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 border-b-4 border-black pb-16">
            <div className="space-y-6">
                <Link href="/browse" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-studio-neon mb-6 group transition-all">
                   <ArrowLeft className="h-4 w-4 mr-4 group-hover:-translate-x-2 transition-transform" /> BACK_TO_NEXUS
                </Link>
                <div className="flex items-center gap-8">
                    <div className="h-20 w-2 bg-studio-neon shadow-[0_0_20px_#a6e22e]" />
                    <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-none text-white/90">
                        THE_VAULT
                    </h1>
                </div>
                <div className="flex items-center gap-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/40 italic">
                    <span className="flex items-center gap-2">[ <Music size={12} className="text-studio-neon" /> {totalSounds} SOUNDS ]</span>
                    <span className="flex items-center gap-2">[ <Layers size={12} className="text-studio-yellow" /> {totalCollections} PACKS ]</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="px-10 py-6 bg-white/[0.02] border-2 border-black rounded-sm flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3 text-studio-neon animate-pulse" /> ENCRYPTION_SYNC
                    </span>
                    <span className="text-2xl font-black italic tracking-tighter text-studio-neon">ACTIVE_DAW_LINK</span>
                </div>
            </div>
        </div>

        {/* 🏛️ COLLECTION_RACK (Owned Packs) */}
        {packs && packs.length > 0 && (
            <div className="mb-32">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-white/10 mb-12 italic">
                    <LayoutGrid className="h-4 w-4 text-studio-yellow" /> AUTHORIZED_COLLECTIONS
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {packs.map((p: any) => (
                        <Link 
                            key={p.id} 
                            href={`/packs/${p.slug}`}
                            className="group p-6 bg-white/[0.02] border-2 border-black hover:border-studio-neon transition-all relative overflow-hidden flex flex-col gap-6"
                        >
                            <div className="aspect-square relative overflow-hidden bg-black/40 border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-700">
                                {p.cover_url ? (
                                    <Image src={p.cover_url} alt={p.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                                ) : <div className="h-full w-full flex items-center justify-center font-black italic text-2xl text-white/5">WALA</div>}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-black text-xl uppercase tracking-tighter italic truncate group-hover:text-studio-neon transition-colors leading-none">{p.name}</h3>
                                <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">FULL_CHANNEL_UNLOCKED</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        {/* 🧿 SIGNAL_GRID (Owned Samples) */}
        {(!samples || samples.length === 0) && (!packs || packs.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-48 border-4 border-dashed border-white/5 bg-black/40 rounded-sm">
                <Disc className="h-24 w-24 text-white/5 animate-reverse-spin mb-10" />
                <h3 className="text-3xl font-black uppercase italic text-white/20 tracking-tighter">VAULT_EMPTY</h3>
                <Link href="/browse" className="mt-10 px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[12px] hover:bg-studio-neon transition-all">
                    INITIALIZE_COLLECTION
                </Link>
            </div>
        ) : samples && samples.length > 0 && (
            <div className="space-y-12">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-white/10 italic">
                    <Music className="h-4 w-4 text-studio-neon" /> DISCRETE_ARTIFACTS
                </div>
                <div className="border-2 border-black bg-white/[0.01] overflow-hidden">
                    {/* Header Strip */}
                    <div className="hidden md:grid grid-cols-12 gap-8 px-10 py-6 border-b-2 border-black text-[9px] uppercase font-black tracking-widest text-white/20 bg-black/40">
                        <div className="col-span-1 text-center">STS</div>
                        <div className="col-span-4 italic">Signal Identification</div>
                        <div className="col-span-1 text-center">TEMPO</div>
                        <div className="col-span-1 text-center">KEY</div>
                        <div className="col-span-4 text-center">MONITOR_SPECTRUM</div>
                        <div className="col-span-1 text-right">IO</div>
                    </div>

                    <div className="divide-y-2 divide-black">
                        {samples.map((sample: any, idx: number) => (
                            <div key={sample.id} className="group flex flex-col md:grid md:grid-cols-12 gap-8 px-10 py-8 items-center transition-all hover:bg-white/[0.03] border-b border-black">
                                
                                {/* Transport */}
                                <div className="w-full md:col-span-1 flex items-center justify-center">
                                    <PlayButton 
                                        id={sample.id} 
                                        url={sample.audio_url} 
                                        name={sample.name}
                                        packName={sample.sample_packs?.name || "UNLOCKED"}
                                        coverUrl={sample.sample_packs?.cover_url}
                                        bpm={sample.bpm}
                                        audioKey={sample.key}
                                        isUnlocked={true}
                                    />
                                </div>

                                {/* Track Info */}
                                <div className="w-full md:col-span-4 flex flex-col gap-1">
                                    <span className="text-xl font-black uppercase tracking-tighter text-white transition-colors group-hover:text-studio-neon truncate">
                                        {sample.name}
                                    </span>
                                    <span className="text-[8px] font-black uppercase text-white/10 tracking-[0.4em] italic group-hover:text-studio-neon/40 transition-colors">
                                        TRANSID_{Math.floor(Math.random() * 99999)} // AUTHORIZED_SIGNAL
                                    </span>
                                </div>

                                {/* Metadata */}
                                <div className="hidden md:block col-span-1 text-center font-black text-[12px] text-white/30 italic">
                                    {sample.bpm || <span className="opacity-10">-</span>}
                                </div>
                                <div className="hidden md:block col-span-1 text-center font-black text-[12px] text-studio-neon tracking-tighter italic">
                                    {sample.key || <span className="opacity-10 opacity-10 text-white/30">-</span>}
                                </div>

                                {/* Spectral Visualization */}
                                <div className="w-full md:col-span-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Waveform id={sample.id} active={true} />
                                </div>

                                {/* Download Signal */}
                                <div className="w-full md:col-span-1 flex justify-end">
                                    <DownloadButton 
                                        sampleId={sample.id} 
                                        isUnlockedInitial={true} 
                                        creditCost={sample.credit_cost}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  )
}
