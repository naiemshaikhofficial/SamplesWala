import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Clock, Music4, Zap, ShieldCheck, Sparkles, Disc } from 'lucide-react'
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
  
  const { data: pack } = await supabase.from('sample_packs').select('*, categories(*)').eq('slug', slug).single()
  if (!pack) notFound()
  
  const { data: samples } = await supabase.from('samples').select('*').eq('pack_id', pack.id).order('created_at', { ascending: true })
  const relatedPacks = await getRelatedPacks(pack.id, pack.category_id)
  
  const melodies = samples?.filter(s => s.bpm && s.key).length || 0
  const loops = samples?.filter(s => s.bpm && !s.key).length || 0
  const oneShots = samples?.filter(s => !s.bpm).length || 0

  let unlockedSampleIds: Set<string> = new Set()
  let isFullPackUnlocked = false;

  if (user) {
    // 1. Check individual unlocks
    const { data: unlocks } = await supabase.from('unlocked_samples').select('sample_id').eq('user_id', user.id)
    if (unlocks) unlockedSampleIds = new Set(unlocks.map(u => u.sample_id))

    // 2. Check if FULL pack was purchased (THE ULTIMATE SOURCE OF TRUTH)
    const { data: directUnlock } = await supabase.from('unlocked_packs')
      .select('id')
      .eq('user_id', user.id)
      .eq('pack_id', pack.id)
      .maybeSingle()
    
    // 3. Fallback to Purchase History (Standard String Match)
    const { data: fullPurchase } = !directUnlock ? await supabase.from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_type', 'sample_pack')
      .ilike('item_name', `%${pack.name}%`)
      .maybeSingle() : { data: null }
    
    if (directUnlock || fullPurchase || (samples && unlockedSampleIds.size > 0 && unlockedSampleIds.size === samples.length)) {
        isFullPackUnlocked = true;
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
          
          <div className="mt-8 flex flex-wrap items-center gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
             <div className="flex flex-col flex-1 min-w-[100px]">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1">Breakdown</span>
                <div className="flex flex-col gap-1">
                    {melodies > 0 && (
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-studio-yellow">Melodies</span>
                            <span>{melodies}</span>
                        </div>
                    )}
                    {loops > 0 && (
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-white/60">Loops</span>
                            <span>{loops}</span>
                        </div>
                    )}
                    {oneShots > 0 && (
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-white/40">One-Shots</span>
                            <span>{oneShots}</span>
                        </div>
                    )}
                </div>
             </div>
             <div className="flex flex-col flex-1 border-l border-white/5 pl-6 min-w-[80px]">
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
          <h1 className="text-4xl md:text-8xl font-black tracking-tighter mb-6 uppercase leading-[0.9] italic">{pack.name}</h1>
          <p className="text-xl text-white/40 mb-12 max-w-2xl leading-relaxed whitespace-pre-line">
            {pack.description || "Experimental textures and precision-engineered loops."}
          </p>

          {/* 💎 THE VALUE DIVIDE: INDIVIDUAL vs FULL */}
          <div className="flex flex-col lg:flex-row items-stretch gap-6 mb-20 mt-12 bg-black">
              {/* 💠 OPTION 1: THE MANUAL GRID */}
              {!pack.is_bundle_only && (
                <div className="flex-1 border border-white/5 p-10 flex flex-col justify-between group hover:border-white/20 transition-all bg-[#050505]">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-10 italic">[ Selective_Mode ]</div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic leading-none text-white/80">Individual Sounds</h3>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white/40 leading-relaxed">
                            Only need a few loops? Pick exactly what you need for your project without unlocking the entire pack.
                        </p>
                    </div>
                    <div className="mt-12 pt-8 border-t border-white/5">
                        <div className="text-3xl font-black italic mb-2 tracking-tighter">7 Credits / Sound</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#00FF00]">Instant HQ WAV Access</div>
                    </div>
                </div>
              )}

              {/* 🔱 OPTION 2: THE FULL ARTIFACT (CONVERSION BOX) */}
              <div className="flex-[1.8] bg-white text-black p-10 md:p-14 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                      <Disc className="h-64 w-64 animate-spin-slow" />
                  </div>

                  <div className="relative z-10">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-12 italic">[ Recommended_Access ]</div>
                      <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-10 italic leading-[0.8]">
                        The Full<br />Collection
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-16">
                          {/* 📡 100% DB-DRIVEN BENEFITS */}
                          {(pack.total_contents_summary || "Full Artifact Access").split('|').map((benefit: string, index: number) => (
                            <div key={index} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest leading-tight border-b border-black/5 pb-2 group/item">
                                <Zap className="h-4 w-4 shrink-0 text-black group-hover/item:scale-110 transition-transform" />
                                {benefit.trim()}
                            </div>
                          ))}

                          {/* Static Compliance/Security info - Always good to show */}
                          <div className="md:col-span-2 mt-4 flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-black/40 italic">
                             <ShieldCheck className="h-3 w-3" /> Encrypted Transaction & Permanent Access
                          </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-6">
                         {isFullPackUnlocked ? (
                                <div className="w-full flex flex-col sm:flex-row items-center gap-6">
                                    <div className="px-10 py-5 bg-black/5 border-2 border-black font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                                        <ShieldCheck className="h-5 w-5" /> FULL COLLECTION UNLOCKED
                                    </div>
                                    {pack.full_pack_download_url && (
                                        <SecureDownloadButton packId={pack.id} />
                                    )}
                                </div>
                         ) : (
                            <div className="w-full flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex-1 w-full sm:w-auto">
                                    <BulkUnlockButton packId={pack.id} cost={pack.bundle_credit_cost || 50} />
                                </div>
                                <div className="flex-1 w-full sm:w-auto">
                                    <SubscribeButton 
                                        planId={pack.id} 
                                        planName={`BUY FULL PACK: ₹${pack.price_inr} / $${pack.price_usd}`} 
                                        mode="sample_pack"
                                        isFeatured
                                    />
                                </div>
                            </div>
                         )}
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>

      <div className="mb-24">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10 flex items-center gap-4">
           <Disc className="h-8 w-8" /> 
           Sample Browser
        </h2>
        <div className="border border-white/10 rounded-[2.5rem] overflow-hidden bg-white/[0.01] backdrop-blur-3xl shadow-2xl">
            <div className="hidden md:grid grid-cols-12 gap-3 px-8 py-4 border-b border-white/10 text-[9px] uppercase font-black tracking-widest text-white/20 bg-white/5">
                <div className="col-span-1">Play</div>
                <div className="col-span-3 text-white/30 italic">Collection Item</div>
                <div className="col-span-1">BPM</div>
                <div className="col-span-1">Key</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-3 text-center">Spectral Signature</div>
                <div className="col-span-1 text-right">Access</div>
            </div>

            <div className="divide-y divide-white/5">
            {samples?.map((sample) => (
                <div key={sample.id} className="flex flex-col md:grid md:grid-cols-12 gap-2 px-4 md:px-6 py-2.5 items-center transition-all hover:bg-white/[0.04] group border-b border-white/5 md:border-none">
                    <div className="w-full md:col-span-1 flex items-center justify-between md:justify-start">
                        <div className="flex items-center gap-3">
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
                            <div className="md:hidden">
                                <div className="font-bold text-sm tracking-tight">{sample.name}</div>
                                <div className="text-[8px] uppercase font-black tracking-widest text-white/20">
                                <div className="text-[8px] uppercase font-black tracking-widest text-white/20">
                                    {sample.bpm && sample.key ? `${sample.bpm}BPM | ${sample.key} | MELODY` : (sample.bpm ? `${sample.bpm}BPM | LOOP` : 'ONE-SHOT')}
                                </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:hidden">
                            {isFullPackUnlocked ? (
                                <DownloadButton 
                                    sampleId={sample.id} 
                                    isUnlockedInitial={true} 
                                    creditCost={0}
                                />
                            ) : (!pack.is_bundle_only && (!sample.is_preview_only || (sample.credit_cost && sample.credit_cost > 0))) ? (
                                <DownloadButton 
                                    sampleId={sample.id} 
                                    isUnlockedInitial={unlockedSampleIds.has(sample.id)} 
                                    creditCost={sample.credit_cost}
                                />
                            ) : (
                                <span className="text-[7px] font-black uppercase tracking-widest text-white/20">
                                    LOCKED
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="hidden md:block col-span-4 relative group/name">
                        <div className="font-bold text-[13px] tracking-tight text-white/90 group-hover:text-white transition-colors truncate cursor-help">{sample.name}</div>
                        <div className="text-[9px] uppercase font-bold tracking-widest text-white/10 mt-0.5 group-hover:text-white/30 transition-colors">
                           {pack.name}
                        </div>
                        
                        {/* 🛸 GHOST PREVIEW WAVEFORM */}
                        <div className="absolute left-0 bottom-full mb-2 w-64 h-12 bg-black/90 border border-white/20 rounded-xl opacity-0 translate-y-2 pointer-events-none group-hover/name:opacity-100 group-hover/name:translate-y-0 transition-all duration-300 z-50 p-2 backdrop-blur-xl">
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1 px-1">Spectral Signature</div>
                            <div className="h-6 opacity-40">
                                <Waveform id={`${sample.id}-ghost`} active={false} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="hidden md:block col-span-2 font-mono text-[10px] text-white/40 group-hover:text-white/60 transition-colors">
                        <span className="text-white/20">{sample.bpm ? `${sample.bpm}BPM / ${sample.key || 'NO KEY'}` : 'NO SYNC'}</span>
                        <div className="text-[7px] font-black uppercase tracking-widest text-studio-yellow mt-1">
                            {sample.bpm && sample.key ? 'MELODY' : (sample.bpm ? 'LOOP' : 'ONE-SHOT')}
                        </div>
                    </div>
                    
                    <div className="w-full md:col-span-3 px-0 md:px-4">
                        <Waveform id={sample.id} active={true} />
                    </div>
                    
                    <div className="hidden md:flex col-span-2 items-center justify-end">
                        {isFullPackUnlocked ? (
                            <DownloadButton 
                                sampleId={sample.id} 
                                isUnlockedInitial={true} 
                                creditCost={0}
                            />
                        ) : (!pack.is_bundle_only && (!sample.is_preview_only || (sample.credit_cost && sample.credit_cost > 0))) ? (
                           <DownloadButton 
                               sampleId={sample.id} 
                               isUnlockedInitial={unlockedSampleIds.has(sample.id)} 
                               creditCost={sample.credit_cost}
                           />
                        ) : (
                           <span className="text-[8px] font-black uppercase tracking-widest text-white/10 italic pr-2">
                                LOCKED
                           </span>
                        )}
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
