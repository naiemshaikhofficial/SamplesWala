import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import Link from "next/link";
import { 
  ShieldCheck, Activity, Zap, AudioLines, ArrowRight,
  Database, Cpu, Globe, BarChart3
} from "lucide-react";
import { NewArrivals } from "@/components/home/NewArrivals";
import { FreshSounds } from "@/components/home/FreshSounds";
import { TopSounds } from "@/components/home/TopSounds";
import { AdaptiveHero } from "@/components/home/AdaptiveHero";
import { getTopPopularSounds } from "@/lib/supabase/admin";
import { Suspense } from 'react'

export const metadata = {
  title: 'Samples Wala | Download High-Quality Royalty-Free Samples & Loops',
  description: 'Pro-grade sample packs, loops, and individual sounds for music producers. Industry-standard royalty-free audio for Trap, EDM, Hip-Hop, and more.',
}

export default async function Home() {
  const supabase = await createClient()
  const adminClient = getAdminClient()
  
  let { data: latestPacks, error: packsError } = await adminClient
    .from('sample_packs')
    .select('*, categories(name), samples(bpm, key)')
    .order('created_at', { ascending: false })
    .limit(12)

  if (packsError || !latestPacks || latestPacks.length === 0) {
      const { data: fallbackScan } = await adminClient
        .from('sample_packs')
        .select('*, samples(bpm, key)')
        .order('created_at', { ascending: false })
        .limit(12)
      latestPacks = fallbackScan as any;
  }

  const topSamples = await getTopPopularSounds(20)

  let { data: freshSounds, error: freshError } = await adminClient
    .from('samples')
    .select('*, sample_packs(name, slug, cover_url)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (freshError || !freshSounds || freshSounds.length === 0) {
      const { data: rawFresh } = await adminClient.from('samples').select('*').order('created_at', { ascending: false }).limit(12)
      freshSounds = rawFresh as any;
  }

  const { data: { user } } = await supabase.auth.getUser()
  let unlockedSampleIds: string[] = []
  if (user) {
    const { data: vaultItems } = await supabase
        .from('user_vault')
        .select('item_id, item_type')
        .eq('user_id', user.id)

    if (vaultItems) {
        const ownedPackIds = new Set(vaultItems.filter(v => v.item_type === 'pack').map(v => v.item_id))
        unlockedSampleIds = topSamples
            .filter(s => {
                const directlyOwned = vaultItems.some(v => v.item_type === 'sample' && v.item_id === s.id)
                const packOwned = ownedPackIds.has(s.pack_id)
                return directlyOwned || packOwned
            })
            .map(s => s.id)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-studio-neon selection:text-black overflow-x-hidden font-mono relative w-full overflow-y-auto custom-scrollbar">
        
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 footer-grid hidden md:block" />
        <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-transparent via-black/20 to-black h-full w-full" />

        <div className="relative z-10">
          <Suspense fallback={<div className="h-[600px] bg-black flex items-center justify-center"><Activity className="animate-pulse text-studio-neon" /></div>}>
              <AdaptiveHero />
          </Suspense>
        </div>

        {/* ⚡ SIGNAL FLOW: NEW ARRIVALS */}
        <section className="relative z-20 border-y-4 border-white/5 bg-studio-charcoal">
            <div className="px-4 md:px-20 py-16 md:py-24 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-10 md:mb-16">
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-studio-neon animate-pulse" />
                        <div className="w-2.5 h-2.5 rounded-full bg-studio-neon/20" />
                    </div>
                    <span className="text-[11px] md:text-sm font-black uppercase tracking-[0.4em] text-studio-neon">LATEST ARRIVALS</span>
                </div>
                
                <NewArrivals packs={latestPacks || []} />
            </div>
        </section>

        {/* 📡 LIVE CHANNEL RACK: FRESH SOUNDS */}
        <section id="fresh-sounds" className="relative z-20 py-20 md:py-32 bg-black border-b-4 border-white/5">
            <div className="max-w-7xl mx-auto">
              <FreshSounds 
                  samples={freshSounds || []} 
                  unlockedSampleIds={unlockedSampleIds}
              />
            </div>
        </section>

        {/* 🎚️ MIXER MATRIX (FX RACK) - FORCED ROW ON MOBILE */}
        <section className="relative z-20 border-b-4 border-white/5 bg-studio-charcoal overflow-hidden">
            <div className="grid grid-cols-3 divide-x-2 md:divide-x-4 divide-black">
                {/* EQ MODULE */}
                <div className="p-3 md:p-12 group">
                    <div className="flex items-center gap-2 mb-4 md:mb-12">
                        <BarChart3 className="w-3 h-3 md:w-5 md:h-5 text-studio-neon" />
                        <h3 className="text-[6px] md:text-xs font-black uppercase tracking-widest hidden xs:block">EQUALIZER</h3>
                    </div>
                    
                    <div className="space-y-2 md:space-y-6">
                        {[85, 40, 65, 90, 30].map((val, i) => (
                            <div key={i} className="space-y-1">
                                <div className="h-3 md:h-2 bg-black border border-white/5 relative overflow-hidden">
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-studio-neon/70 group-hover:bg-studio-neon transition-all duration-500" 
                                        style={{ width: `${val}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COMPRESSOR MODULE */}
                <div className="p-3 md:p-12 md:bg-black/10 flex flex-col items-center group">
                    <div className="w-full flex items-center gap-2 mb-4 md:mb-12">
                        <Zap className="w-3 h-3 md:w-5 md:h-5 text-studio-yellow" />
                        <h3 className="text-[6px] md:text-xs font-black uppercase tracking-widest hidden xs:block">DYNAMICS</h3>
                    </div>
                    
                    <div className="relative w-12 h-12 md:w-64 md:h-64 rounded-full border-2 md:border-8 border-black shadow-2xl flex items-center justify-center bg-[#181818]">
                        <div className="absolute inset-1 border border-white/5 rounded-full" />
                        <div className="w-0.5 md:w-2 h-6 md:h-32 bg-gradient-to-t from-transparent via-spider-red to-spider-red origin-bottom -rotate-45 transform transition-transform group-hover:rotate-[150deg] duration-[2s]" />
                    </div>
                </div>

                {/* LIMITER MODULE */}
                <div className="p-3 md:p-12 hover:bg-black/10 transition-colors group">
                    <div className="flex items-center justify-between mb-4 md:mb-12">
                        <div className="flex items-center gap-2">
                            <AudioLines className="w-3 h-3 md:w-5 md:h-5 text-spider-red" />
                            <h3 className="text-[6px] md:text-xs font-black uppercase tracking-widest hidden xs:block">VOLUME LIMITER</h3>
                        </div>
                    </div>
                    
                    <div className="h-12 md:h-48 border border-black bg-black flex items-end gap-[1px] md:gap-1 p-1 md:p-4 overflow-hidden relative">
                        {[...Array(8)].map((_, i) => (
                            <div 
                                key={i} 
                                className="flex-1 bg-spider-red/40 group-hover:bg-spider-red transition-all" 
                                style={{ 
                                    height: `${30 + Math.random() * 70}%`
                                }} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* 🏆 TOP CHARTS */}
        <section className="relative z-20 py-20 md:py-32 bg-black border-b-4 border-white/5">
            <div className="absolute top-20 left-10 text-[6rem] md:text-[12rem] font-black text-white/[0.03] pointer-events-none italic uppercase">
                Trending
            </div>
            <div className="max-w-7xl mx-auto px-4 md:px-20 relative">
                <TopSounds 
                    samples={topSamples || []} 
                    unlockedSampleIds={Array.from(unlockedSampleIds)}
                />
            </div>
        </section>

        {/* 🛡️ PRO STATUS */}
        <section className="relative z-20 grid grid-cols-1 md:grid-cols-2 bg-studio-charcoal">
            <div className="p-12 md:p-24 border-b-4 md:border-b-0 md:border-r-4 border-black hover:bg-studio-neon hover:text-black transition-all group overflow-hidden cursor-pointer">
                <ShieldCheck className="h-12 w-12 md:h-20 md:w-20 mb-8 text-studio-neon group-hover:text-black transition-colors" />
                <h4 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic mb-8 group-hover:text-black">Royalty<br/>Free</h4>
                <p className="text-lg md:text-2xl font-bold opacity-40 group-hover:opacity-100 max-w-sm">Every sound from our cloud is 100% royalty-free for commercial use.</p>
            </div>
            <div className="p-12 md:p-24 hover:bg-studio-yellow hover:text-black transition-all group overflow-hidden cursor-pointer">
                <Globe className="h-12 w-12 md:h-20 md:w-20 mb-8 text-studio-yellow group-hover:text-black transition-colors" />
                <h4 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic mb-8 group-hover:text-black">Studio<br/>Grade</h4>
                <p className="text-lg md:text-2xl font-bold opacity-40 group-hover:opacity-100 max-w-sm">The digital gold standard used by world-class music producers.</p>
            </div>
        </section>

        {/* 📟 STATUS FOOTER */}
        <footer className="relative z-20 pt-20 pb-32 md:py-16 px-6 bg-black border-t-8 border-black">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex gap-10 items-center">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">System_Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-studio-neon animate-pulse" />
                            <span className="text-xs font-bold text-studio-neon">ALL_MODULES_ACTIVE</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="/license" className="hover:text-white transition-colors">License</Link>
                </div>
            </div>
        </footer>

    </main>
  );
}
