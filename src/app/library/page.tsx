import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Music, Download, ArrowLeft, Disc, LayoutGrid, Search, ShieldCheck } from 'lucide-react'
import { PlayButton } from '@/components/audio/PlayButton'
import { SecureDownloadButton } from '@/components/audio/SecureDownloadButton'
import { Waveform } from '@/components/audio/Waveform'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 1. Fetch ALL Unlocked Samples
  const { data: unlockedSamples } = await supabase
    .from('unlocked_samples')
    .select(`
      sample_id,
      samples (*)
    `)
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false })

  // 2. Fetch ALL Unlocked Packs (for display/context)
  const { data: unlockedPacks } = await supabase
    .from('unlocked_packs')
    .select(`
        pack_id,
        sample_packs (*)
    `)
    .eq('user_id', user.id)

  const samples = unlockedSamples?.map(u => u.samples).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 md:px-20">
      <div className="container mx-auto max-w-7xl">
        
        {/* 📟 HEADER / STATUS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div>
                <Link href="/browse" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white mb-6 group transition-all">
                   <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-2 transition-transform" /> Back to Nexus
                </Link>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
                    The Vault
                </h1>
                <p className="text-white/40 text-[10px] mt-4 font-mono uppercase tracking-[0.2em]">
                    Signal Locked: {samples.length} Sounds | {unlockedPacks?.length || 0} Collections
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3 text-[#00FF00]" /> Encryption
                    </span>
                    <span className="text-xl font-bold italic tracking-tighter text-[#00FF00]">ACTIVE_SYNC</span>
                </div>
            </div>
        </div>

        {/* 🏛️ COLLECTIONS GRID (FULL PACKS) */}
        {unlockedPacks && unlockedPacks.length > 0 && (
            <div className="mb-24">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-10 italic flex items-center gap-4">
                    <LayoutGrid className="h-4 w-4" /> Authorized Collections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unlockedPacks.map((up: any) => (
                        <div key={up.pack_id} className="group p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] transition-all relative overflow-hidden">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                    {up.sample_packs?.cover_url ? (
                                        <img src={up.sample_packs.cover_url} alt="" className="object-cover h-full w-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    ) : <div className="h-full w-full flex items-center justify-center font-black italic text-sm text-white/5">WALA</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-xl uppercase tracking-tighter italic truncate group-hover:text-white transition-colors">{up.sample_packs?.name}</h3>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">Full Pack License</div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <SecureDownloadButton packId={up.pack_id} isIndividualSample={false} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* 🧿 THE VAULT (SAMPLES LIST) */}
        {samples.length === 0 && (!unlockedPacks || unlockedPacks.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-40 border border-white/5 bg-white/[0.01] rounded-[3rem]">
                <Disc className="h-20 w-20 text-white/5 animate-spin-slow mb-8" />
                <h3 className="text-2xl font-black uppercase italic text-white/20 italic tracking-tighter">Vault Empty</h3>
                <Link href="/browse" className="mt-8 px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-[11px] hover:invert transition-all">
                    Initialize Collection
                </Link>
            </div>
        ) : samples.length > 0 && (
            <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-10 italic flex items-center gap-4">
                    <Music className="h-4 w-4" /> Singular Artifacts
                </h2>
                <div className="border border-white/10 rounded-[2.5rem] overflow-hidden bg-white/[0.01] backdrop-blur-3xl shadow-2xl">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/10 text-[10px] uppercase font-black tracking-widest text-white/20 bg-white/5">
                        <div className="col-span-1">Play</div>
                        <div className="col-span-4 italic">Audio Identification</div>
                        <div className="col-span-2">Technical Meta</div>
                        <div className="col-span-3 text-center">Interactive Spectral</div>
                        <div className="col-span-2 text-right">Acquisition</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {samples.map((sample: any) => (
                            <div key={sample.id} className="flex flex-col md:grid md:grid-cols-12 gap-2 px-4 md:px-6 py-2.5 items-center transition-all hover:bg-white/[0.04] group border-b border-white/5 md:border-none">
                                {/* Play Button */}
                                <div className="w-full md:col-span-1 flex items-center justify-between md:justify-start">
                                    <PlayButton 
                                        id={sample.id} 
                                        url={sample.audio_url} 
                                        name={sample.name}
                                        packName="Unlocked Artifact"
                                        bpm={sample.bpm}
                                        audioKey={sample.key}
                                    />
                                </div>

                                {/* Name info */}
                                <div className="hidden md:block col-span-4">
                                    <div className="font-bold text-[13px] tracking-tight text-white/90 truncate">{sample.name}</div>
                                    <div className="text-[9px] uppercase font-bold tracking-widest text-white/10 mt-0.5 group-hover:text-[#00FF00] transition-colors">
                                        Authorized HQ Access
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="hidden md:block col-span-2 font-mono text-[10px] text-white/20 group-hover:text-white/60 transition-colors">
                                    {sample.bpm}BPM <span className="mx-1 opacity-20">/</span> {sample.key}
                                </div>

                                {/* Waveform */}
                                <div className="w-full md:col-span-3 px-0 md:px-4">
                                    <Waveform id={sample.id} active={true} />
                                </div>

                                {/* Download Button */}
                                <div className="hidden md:flex col-span-2 items-center justify-end">
                                    <SecureDownloadButton packId={sample.id} isIndividualSample={true} />
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
