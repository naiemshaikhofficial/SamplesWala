import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Clock, Music4, Zap, ShieldCheck, Sparkles, Disc } from 'lucide-react'
import Link from 'next/link'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { PriceDisplay } from '@/components/PriceDisplay'
import { BulkUnlockButton } from '@/components/audio/BulkUnlockButton'
import { Waveform } from '@/components/audio/Waveform'
import { getRelatedPacks } from '@/app/browse/actions'

export default async function PackPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { slug } = await (params as any)
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: pack } = await supabase.from('sample_packs').select('*, categories(*)').eq('slug', slug).single()
  if (!pack) notFound()
  
  const { data: samples } = await supabase.from('samples').select('*').eq('pack_id', pack.id).order('created_at', { ascending: true })
  const relatedPacks = await getRelatedPacks(pack.id, pack.category_id)
  
  let unlockedSampleIds: Set<string> = new Set()
  if (user) {
    const { data: unlocks } = await supabase.from('unlocked_samples').select('sample_id').eq('user_id', user.id)
    if (unlocks) {
      unlockedSampleIds = new Set(unlocks.map(u => u.sample_id))
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <Link href="/browse" className="inline-flex items-center text-sm text-white/40 hover:text-white mb-8 group">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to browse
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
        <div className="lg:col-span-1">
          <div className="aspect-square relative overflow-hidden rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl group">
            {pack.cover_url ? (
               <Image 
                 src={pack.cover_url} 
                 alt={pack.name} 
                 fill 
                 sizes="(max-width: 1024px) 100vw, 33vw"
                 className="object-cover group-hover:scale-105 transition-transform duration-1000" 
               />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/5 font-black italic text-5xl uppercase tracking-tighter mix-blend-overlay">WALA</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
          
          <div className="mt-8 flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
             <div className="flex flex-col flex-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1">Files</span>
                <span className="text-xl font-bold">{samples?.length || 0} Sounds</span>
             </div>
             <div className="flex flex-col flex-1 border-l border-white/5 pl-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1">Type</span>
                <div className="flex items-center gap-1.5 text-sm font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                    <span>HQ Wav</span>
                </div>
             </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
             <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">{pack.categories?.name}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 uppercase leading-[0.9] italic italic">{pack.name}</h1>
          <p className="text-xl text-white/40 mb-12 max-w-2xl leading-relaxed whitespace-pre-line">
            {pack.description || "Experimental textures and precision-engineered loops designed specifically for high-performance modern music production."}
          </p>
          
          <div className="flex flex-wrap items-center gap-6">
            <BulkUnlockButton packId={pack.id} cost={pack.bundle_credit_cost || 50} />
            <div className="flex items-center gap-3 px-8 text-white/40">
               <span className="h-[1px] w-8 bg-white/10"></span>
               <span className="text-[10px] font-black uppercase tracking-widest">Or</span>
               <span className="h-[1px] w-8 bg-white/10"></span>
            </div>
            <button className="text-sm font-black uppercase tracking-widest border-b border-white/20 pb-1 hover:border-white transition-all">Buy for <PriceDisplay inr={pack.price_inr} usd={pack.price_usd} /></button>
          </div>
        </div>
      </div>

      <div className="mb-24">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10 flex items-center gap-4">
           <Disc className="h-8 w-8" /> 
           Sample Browser
        </h2>
        <div className="border border-white/10 rounded-[2.5rem] overflow-hidden bg-white/[0.01] backdrop-blur-3xl shadow-2xl">
            <div className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/10 text-[10px] uppercase font-black tracking-widest text-white/20 bg-white/5">
                <div className="col-span-1">Play</div>
                <div className="col-span-4 text-white/30 italic">Collection Item</div>
                <div className="col-span-2 text-white/30">Metadata</div>
                <div className="col-span-3 text-center">Interactive Spectral</div>
                <div className="col-span-2 text-right">Access</div>
            </div>

            <div className="divide-y divide-white/5">
            {samples?.map((sample) => (
                <div key={sample.id} className="grid grid-cols-12 gap-4 px-8 py-10 items-center transition-all hover:bg-white/[0.03] group">
                    <div className="col-span-1">
                        <PlayButton id={sample.id} url={sample.audio_url} />
                    </div>
                    <div className="col-span-4">
                        <div className="font-black text-lg tracking-tight group-hover:translate-x-1 transition-transform">{sample.name}</div>
                        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-white/20 mt-1 flex items-center gap-2">
                           {pack.name}
                        </div>
                    </div>
                    <div className="col-span-2 font-mono text-[11px] text-white/40 group-hover:text-white transition-colors">
                        {sample.bpm}BPM <span className="mx-2 text-white/10">|</span> {sample.key}
                    </div>
                    <div className="col-span-3 px-6">
                        <Waveform id={sample.id} active={true} />
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
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10 flex items-center gap-4">
           <Sparkles className="h-8 w-8 text-yellow-500/40" /> 
           Related Sounds
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedPacks?.map((rp) => (
                <Link key={rp.id} href={`/packs/${rp.slug}`} className="group p-4 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all active:scale-[0.98]">
                    <div className="aspect-square relative overflow-hidden rounded-2xl mb-4 bg-white/5 shadow-2xl">
                        {rp.cover_url && (
                          <Image 
                            src={rp.cover_url} 
                            alt={rp.name} 
                            fill 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-full">Examine</span>
                        </div>
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">{rp.name}</h3>
                </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
