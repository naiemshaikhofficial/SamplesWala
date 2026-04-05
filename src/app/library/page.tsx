import { createClient } from '@/lib/supabase/server'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { Music, Search, Library as LibraryIcon, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await (await supabase.auth.getUser())
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-black mb-8">Your Library is locked.</h1>
        <p className="text-white/40 mb-12">Log in to view and download your unlocked sounds.</p>
        <Link href="/login" className="bg-white text-black px-12 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:opacity-90">Login</Link>
      </div>
    )
  }

  // Fetch all unlocked samples with their metadata
  const { data: unlocked } = await supabase
    .from('unlocked_samples')
    .select('*, samples(*, sample_packs(name))')
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <div className="flex items-center gap-3 text-white/40 mb-2">
            <LibraryIcon className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Personal Vault</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none italic">Your Sounds</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl">
          <div className="flex flex-col pr-8 border-r border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Total Collection</span>
            <span className="text-3xl font-black italic">{unlocked?.length || 0}</span>
          </div>
          <Link href="/browse" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-white/80 transition-colors pl-4">
             Explore More <Zap className="h-3 w-3 fill-white" />
          </Link>
        </div>
      </div>

      {unlocked && unlocked.length > 0 ? (
        <div className="border border-white/10 rounded-[2rem] overflow-hidden bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
          <div className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/10 text-[10px] uppercase font-bold tracking-widest text-white/20">
            <div className="col-span-1">Play</div>
            <div className="col-span-4">Sample Name / Pack</div>
            <div className="col-span-2">Details</div>
            <div className="col-span-3 text-center">Spectral Waveform</div>
            <div className="col-span-2 text-right">Download</div>
          </div>
          <div className="divide-y divide-white/5">
            {unlocked.map((item: any) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-8 py-8 items-center hover:bg-white/[0.03] transition-colors group">
                <div className="col-span-1">
                  <PlayButton id={item.samples.id} url={item.samples.audio_url} />
                </div>
                <div className="col-span-4">
                  <div className="font-bold text-base tracking-tight text-white group-hover:translate-x-1 transition-transform cursor-default">{item.samples.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1 inline-flex items-center gap-2">
                     <span className="h-1 w-1 bg-white/20 rounded-full"></span>
                     {item.samples.sample_packs.name}
                  </div>
                </div>
                <div className="col-span-2 font-mono text-xs text-white/40">
                  {item.samples.bpm}BPM / {item.samples.key}
                </div>
                <div className="col-span-3 h-10 relative flex items-center justify-center gap-[2.5px] px-8">
                   {[...Array(32)].map((_, i) => (
                      <div key={i} className="flex-1 bg-white/5 rounded-full transition-all group-hover:bg-white/20" style={{ height: (20 + Math.random() * 80) + '%' }}></div>
                   ))}
                </div>
                <div className="col-span-2 text-right">
                  <DownloadButton sampleId={item.samples.id} isUnlockedInitial={true} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
          <Music className="h-12 w-12 mx-auto mb-6 text-white/10" />
          <h3 className="text-xl font-bold uppercase tracking-widest text-white/20 italic">No samples in your vault yet.</h3>
          <p className="text-xs text-white/10 mt-4">Unlock sounds with your subscription credits to build a library.</p>
        </div>
      )}
    </div>
  )
}
