import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Clock, Music4, Zap, ShieldCheck, Sparkles, Disc, Monitor, Layers } from 'lucide-react'
import Link from 'next/link'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { PriceDisplay } from '@/components/PriceDisplay'
import { BulkUnlockButton } from '@/components/audio/BulkUnlockButton'
import { SubscribeButton } from '@/components/SubscribeButton'
import { SecureDownloadButton } from '@/components/audio/SecureDownloadButton'
import { Waveform } from '@/components/audio/Waveform'
import { getRelatedPacks } from '@/app/browse/actions'

export default async function PackPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params
  const { data: { user } } = await supabase.auth.getUser()
  
  // 🎹 ENHANCED FETCH WITH RELATIONAL FALLBACK
  let { data: pack, error } = await supabase
    .from('sample_packs')
    .select('*, categories(name, id)')
    .eq('slug', slug)
    .single()

  // Fallback for cases where foreign keys are descriptive but missing in schema cache
  if (!pack || error) {
    const { data: fallbackPack } = await supabase
        .from('sample_packs')
        .select('*')
        .eq('slug', slug)
        .single()
    pack = fallbackPack;
  }

  if (!pack) notFound()
  
  const { data: samples } = await supabase.from('samples').select('*').eq('pack_id', pack.id).order('created_at', { ascending: true })
  
  // Handled relation locally if joined query failed
  const categoryId = pack.category_id;
  const relatedPacks = categoryId ? await getRelatedPacks(pack.id, categoryId) : [];
  
  const melodies = samples?.filter(s => s.bpm && s.key).length || 0
  const loops = samples?.filter(s => s.bpm && !s.key).length || 0
  const oneShots = samples?.filter(s => !s.bpm).length || 0

  let unlockedSampleIds: Set<string> = new Set()
  let isFullPackUnlocked = false;

  if (user) {
    const { data: vaultItems } = await supabase
        .from('user_vault')
        .select('item_id, item_type')
        .eq('user_id', user.id)

    if (vaultItems) {
        // Individual samples
        const sampleIds = vaultItems
            .filter(v => v.item_type === 'sample')
            .map(v => v.item_id)
        unlockedSampleIds = new Set(sampleIds)

        // Whole pack check
        isFullPackUnlocked = vaultItems.some(v => v.item_type === 'pack' && v.item_id === pack.id)
        
        // Logical fallback: If all samples are unlocked individually, treat as full pack unlocked (UX helper)
        if (!isFullPackUnlocked && samples && samples.length > 0) {
            const allSamplesOwned = samples.every(s => unlockedSampleIds.has(s.id))
            if (allSamplesOwned) isFullPackUnlocked = true
        }
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 min-h-screen font-mono">
      <Link href="/browse" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-studio-neon mb-8 md:mb-12 group transition-all">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-2" />
        RELOAD_BROWSER
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16 mb-24 relative">
        {/* 🧬 VST GUI MODULE */}
        <div className="lg:col-span-1">
          <div className="aspect-square relative overflow-hidden studio-panel bg-studio-grey border-2 border-white/10 shadow-2xl group">
             {/* VST Header */}
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
                <div className="absolute inset-0 flex items-center justify-center pt-8">
                    <Monitor className="h-24 w-24 text-white/5" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 p-4 md:p-6 studio-panel bg-black/40 border-2 border-white/5">
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-3 border-b border-white/5 pb-1">Artifact_Stats</span>
                <div className="space-y-1.5">
                    {melodies > 0 && <div className="flex items-center justify-between text-[9px] font-black text-studio-neon"><span>MELODIES</span><span>{melodies}</span></div>}
                    {loops > 0 && <div className="flex items-center justify-between text-[9px] font-black text-white/60"><span>LOOPS</span><span>{loops}</span></div>}
                    {oneShots > 0 && <div className="flex items-center justify-between text-[9px] font-black text-white/40"><span>1SHOTS</span><span>{oneShots}</span></div>}
                </div>
             </div>
             <div className="flex flex-col border-l border-white/5 pl-4 md:pl-6">
                <span className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-3 border-b border-white/5 pb-1">Signal_Type</span>
                <div className="flex items-center gap-2 text-[10px] font-black text-studio-yellow">
                    <Disc className="h-3 w-3 animate-spin-slow" />
                    <span>24-BIT WAV</span>
                </div>
                <div className="mt-2 text-[8px] text-white/20 uppercase font-black">ROYALTY_FREE</div>
             </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
             <span className="px-3 md:px-4 py-1 bg-black border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-studio-neon">
                {pack.categories?.name || 'STUDIO_PACK'}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl xl:text-[10vw] font-black tracking-tighter mb-8 uppercase leading-[0.85] md:leading-[0.8] italic text-white shadow-studio-text">
            {pack.name}
          </h1>
          <p className="text-sm md:text-2xl text-white/40 mb-12 md:mb-16 max-w-3xl leading-snug md:leading-relaxed whitespace-pre-line font-bold italic">
            {pack.description || "Experimental textures and precision-engineered loops for modern production workflow."}
          </p>

          {/* 💎 ACQUISITION RACK */}
          <div className="flex flex-col lg:flex-row items-stretch gap-6 md:gap-8 mb-24">
              <div className="flex-1 bg-studio-grey p-8 md:p-10 flex flex-col justify-between border-2 border-white/5 group hover:border-white/20 transition-all">
                  <div>
                      <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 md:mb-12">[ SELECTIVE_MODE ]</div>
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 md:mb-6 italic text-white/80">Individual Samples</h3>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">
                          Precision extraction mode. Unlock specific frequencies for your project using individual credits.
                      </p>
                  </div>
                  <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/10">
                      <div className="text-3xl md:text-4xl font-black italic mb-2 tracking-tighter text-studio-neon">7 CREDITS</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-white/20">INSTANT CLOUD SYNC</div>
                  </div>
              </div>

              <div className="flex-[1.8] bg-white text-black p-8 md:p-14 relative overflow-hidden group border-b-[16px] lg:border-b-0 lg:border-r-[24px] border-studio-yellow">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none group-hover:rotate-180 transition-transform duration-[3s]">
                      <Disc className="h-64 w-64" />
                  </div>

                  <div className="relative z-10">
                      <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] mb-8 md:mb-12 italic text-black/40">[ FULL_ACCESS_PROTOCOL ]</div>
                      <h3 className="text-4xl md:text-8xl font-black uppercase tracking-tighter mb-8 md:mb-12 italic leading-[0.8] md:leading-[0.8]">
                        The Full<br />Artifact
                      </h3>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mt-12 pt-8 md:pt-12 border-t border-black/10">
                         {isFullPackUnlocked ? (
                                <div className="w-full flex flex-col sm:flex-row items-center gap-6">
                                    <div className="px-8 md:px-10 py-4 md:py-5 bg-black text-white font-black uppercase tracking-widest text-[10px] md:text-[11px] flex items-center justify-center gap-4">
                                        <ShieldCheck className="h-5 w-5 text-studio-neon" /> ACCESS_GRANTED
                                    </div>
                                    <SecureDownloadButton packId={pack.id} />
                                </div>
                         ) : (
                            <div className="w-full flex gap-4 md:gap-6 flex-wrap">
                                <BulkUnlockButton packId={pack.id} cost={pack.bundle_credit_cost || 50} />
                                <SubscribeButton 
                                    planId={pack.id} 
                                    planName={`BUY: ₹${pack.price_inr}`} 
                                    mode="sample_pack"
                                    isFeatured
                                />
                            </div>
                         )}
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* 🎹 TRACK LIST ARRANGEMENT */}
      <div className="mb-32">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 border-b-4 border-black pb-6 gap-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4 md:gap-6 text-white/40">
                <Layers className="h-6 w-6 md:h-8 md:h-8 text-studio-neon" /> 
                Playlist :: {slug}
            </h2>
            <div className="flex gap-1 h-4 md:h-6 overflow-hidden max-w-full">
                 {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-1 bg-studio-neon/20 animate-peak shrink-0" style={{ animationDelay: `${i*0.1}s` }} />
                 ))}
            </div>
        </div>

        <div className="bg-black/60 studio-panel border-2 border-white/5 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-10 py-5 border-b-2 border-black text-[9px] uppercase font-black tracking-widest text-white/20 bg-studio-grey/40">
                <div className="col-span-1">Play</div>
                <div className="col-span-4 text-white/40 italic">Signature Artifact</div>
                <div className="col-span-1">BPM</div>
                <div className="col-span-1">Key</div>
                <div className="col-span-4 text-center">Spectral Data</div>
                <div className="col-span-1 text-right">Access</div>
            </div>

            <div className="divide-y divide-black">
            {samples?.map((sample, idx) => (
                <div key={sample.id} className="group flex flex-col md:grid md:grid-cols-12 gap-4 px-10 py-4 items-center bg-transparent hover:bg-white/[0.03] transition-all border-b border-white/5 md:border-none">
                    <div className="w-full md:col-span-1 flex items-center justify-between md:justify-start">
                        <PlayButton 
                            id={sample.id} 
                            url={sample.audio_url} 
                            name={sample.name}
                            packName={pack.name}
                            coverUrl={pack.cover_url}
                            bpm={sample.bpm}
                            audioKey={sample.key}
                            isUnlocked={unlockedSampleIds.has(sample.id) || isFullPackUnlocked}
                        />
                    </div>
                    
                    <div className="w-full md:col-span-4 flex flex-col">
                        <span className="text-[15px] font-black uppercase text-white/80 group-hover:text-studio-neon transition-colors truncate">{sample.name}</span>
                        <span className="text-[8px] font-bold uppercase text-white/10 tracking-[0.3em] mt-1 italic">Channel_{idx+1}</span>
                    </div>
                    
                    <div className="hidden md:block col-span-1 font-black text-[12px] text-white/30 italic">
                        {sample.bpm || ''}
                    </div>
                    <div className="hidden md:block col-span-1 font-black text-[12px] text-studio-neon tracking-tighter italic">
                        {sample.key || ''}
                    </div>
                    
                    <div className="w-full md:col-span-4">
                        <Waveform id={sample.id} active={true} />
                    </div>
                    
                    <div className="w-full md:col-span-1 flex justify-end">
                        <DownloadButton 
                            sampleId={sample.id} 
                            isUnlockedInitial={unlockedSampleIds.has(sample.id) || isFullPackUnlocked} 
                            creditCost={sample.credit_cost}
                        />
                    </div>
                </div>
            ))}
            </div>
        </div>
      </div>

      {/* 🧬 COLLATERAL MODULES */}
      <div className="border-t-4 border-black pt-24">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-16 flex items-center gap-6 text-white/20">
           <Disc className="h-10 w-10 animate-reverse-spin" /> 
           Cross-Breediing_Artifacts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {relatedPacks?.map((rp) => (
                <Link key={rp.id} href={`/packs/${rp.slug}`} className="group studio-panel bg-studio-grey border-2 border-white/5 hover:border-studio-neon transition-all overflow-hidden">
                    <div className="aspect-square relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                        {rp.cover_url && (
                          <Image src={rp.cover_url} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors p-6 flex flex-col justify-end">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">{rp.name}</h3>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
