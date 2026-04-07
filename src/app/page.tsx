import { createClient } from '@/lib/supabase/server'
import Link from "next/link";
import { 
  ShieldCheck, Disc, Activity, Settings2, SlidersHorizontal, 
  BarChart3, Radio
} from "lucide-react";
import { NewArrivals } from "@/components/home/NewArrivals";
import { FreshSounds } from "@/components/home/FreshSounds";
import { TopSounds } from "@/components/home/TopSounds";
import { AdaptiveHero } from "@/components/home/AdaptiveHero";
import { getTopPopularSounds } from "@/lib/supabase/admin";
import { Suspense } from 'react'

export default async function Home() {
  const supabase = await createClient()
  
  // 📀 Fetch Latest Packs with Multilevel Failure Protection
  let { data: latestPacks, error: packsError } = await supabase
    .from('sample_packs')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })
    .limit(4)

  // Critical Fallback if the relationship query fails or returns empty
  if (packsError || !latestPacks || latestPacks.length === 0) {
      if (packsError) console.warn('[SIGNAL_REPAIR] Packs relational fetch failed, using bypass:', packsError.message)
      const { data: fallbackScan } = await supabase
        .from('sample_packs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)
      latestPacks = fallbackScan as any;
  }

  // 💿 AUTOMATIC POPULARITY ENGINE
  const topSamples = await getTopPopularSounds(12)

  // 📡 FRESH SOUNDS SIGNAL: Fetch newest individual samples with bypass
  let { data: freshSounds, error: freshError } = await supabase
    .from('samples')
    .select('*, sample_packs(name, slug, cover_url)')
    .order('created_at', { ascending: false })
    .limit(12)

  if (freshError || !freshSounds || freshSounds.length === 0) {
      if (freshError) console.warn('[SIGNAL_REPAIR] Fresh sounds fetch failed join, using bypass:', freshError.message);
      const { data: rawFresh } = await supabase.from('samples').select('*').order('created_at', { ascending: false }).limit(12)
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
        
        // A sample is considered unlocked if it's in the vault OR its pack is in the vault
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
    <div className="min-h-screen bg-studio-charcoal text-white selection:bg-studio-neon selection:text-black overflow-x-hidden font-mono step-grid transition-all duration-300">
        
        {/* 🏆 MASTER DASHBOARD HERO */}
        <Suspense fallback={<div className="h-screen bg-black" />}>
            <AdaptiveHero />
        </Suspense>

        {/* 💿 CHANNEL RACK: NEW SIGNALS */}
        <div className="px-6 md:px-20 py-24 border-y-8 border-black bg-studio-grey/30 relative">
            <div className="absolute top-4 left-6 flex items-center gap-4 text-studio-neon opacity-20">
                <div className="w-4 h-4 border-2 border-studio-neon animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Latest Arrivals</span>
            </div>
            <NewArrivals packs={latestPacks || []} />
        </div>

        {/* 📡 LIVE INTAKE: FRESH SOUNDS */}
        <FreshSounds 
            samples={freshSounds || []} 
            unlockedSampleIds={unlockedSampleIds}
        />

        {/* 🎚️ MASTER FX RACK */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b-8 border-black">
            <div className="p-12 border-b-8 md:border-b-0 md:border-r-8 border-black bg-studio-charcoal group hover:bg-[#151515] transition-all">
                <div className="flex items-center gap-2 mb-8">
                  <BarChart3 className="w-4 h-4 text-studio-neon" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">EQ_MASTER</span>
                </div>
                <div className="space-y-6">
                   {[10, 30, 80, 45, 15, 60, 40].map((h, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-[8px] font-black text-white/20 w-8">BAND_{i+1}</span>
                      <div className="flex-1 h-2 bg-black border border-white/5 relative">
                        <div className="absolute inset-y-0 left-0 bg-studio-neon/40 shadow-[0_0_5px_rgba(166,226,46,0.3)] transition-all group-hover:bg-studio-neon" style={{ width: `${h}%` }} />
                      </div>
                    </div>
                   ))}
                </div>
            </div>
            <div className="p-12 border-b-8 md:border-b-0 md:border-r-8 border-black bg-studio-charcoal">
                <div className="flex items-center gap-2 mb-8">
                  <Activity className="w-4 h-4 text-studio-yellow" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">DYNAMICS_CTRL</span>
                </div>
                <div className="aspect-square border-4 border-black bg-[#151515] rounded-full flex items-center justify-center relative group">
                    <div className="absolute inset-4 border border-white/5 rounded-full" />
                    <div className="w-1 h-32 bg-gradient-to-t from-transparent to-studio-yellow origin-bottom rotate-45 transform transition-transform group-hover:rotate-[120deg]" />
                    <div className="absolute bottom-6 text-[10px] font-black text-white/20 uppercase tracking-widest">THRESHOLD</div>
                </div>
            </div>
            <div className="p-12 bg-studio-charcoal group hover:bg-[#151515] transition-all">
                 <div className="flex items-center gap-2 mb-8">
                  <Radio className="w-4 h-4 text-spider-red" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">LIMITER_VUE</span>
                </div>
                <div className="h-48 bg-black border border-white/10 p-4 flex gap-1 items-end overflow-hidden">
                   {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-spider-red/40 group-hover:bg-spider-red transition-all" 
                      style={{ height: `${Math.random() * 100}%` }} 
                    />
                   ))}
                </div>
                <div className="mt-8 flex justify-between">
                  <span className="text-[8px] font-black text-white/20 uppercase">ATTACK: 10ms</span>
                  <span className="text-[8px] font-black text-white/20 uppercase">GAIN: +3dB</span>
                </div>
            </div>
        </div>

        {/* 🎚️ PLAYLIST ARRANGEMENT: TOP SOUNDS */}
        <div className="px-6 md:px-20 py-32 bg-studio-charcoal border-b-8 border-black relative">
            <div className="absolute top-4 left-6 flex items-center gap-4 text-studio-yellow opacity-20">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Top Sounds Trending</span>
            </div>
            <div className="max-w-[2000px] mx-auto">
                <Suspense fallback={<div className="h-96 bg-black" />}>
                    <TopSounds 
                        samples={topSamples || []} 
                        unlockedSampleIds={Array.from(unlockedSampleIds)}
                    />
                </Suspense>
            </div>
        </div>

        {/* 🛡️ HARDWARE STATUS CARDS - BOTTOM ROW */}
        <div className="flex flex-col md:flex-row border-b-8 border-black bg-studio-grey">
            <div className="flex-1 p-12 md:p-24 border-b-8 md:border-b-0 md:border-r-8 border-black hover:bg-studio-neon hover:text-black transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-20 transition-opacity">
                    <SlidersHorizontal className="h-40 w-40" />
                </div>
                <ShieldCheck className="h-16 w-16 mb-12 text-studio-neon group-hover:text-black transition-colors" />
                <h4 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 italic leading-none">Usage<br/>Rights</h4>
                <p className="text-lg font-bold opacity-40 group-hover:opacity-100 group-hover:text-black leading-loose max-w-sm mt-8">Every sound is 100% royalty-free and ready for your next hit.</p>
                <div className="mt-12 h-2 w-20 bg-studio-yellow group-hover:bg-black transition-all" />
            </div>
            <div className="flex-1 p-12 md:p-24 hover:bg-studio-yellow hover:text-black transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-20 transition-opacity">
                    <Settings2 className="h-40 w-40 animate-spin-slow" />
                </div>
                <Disc className="h-16 w-16 mb-12 text-spider-red group-hover:text-black transition-colors" />
                <h4 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 italic leading-none">Global<br/>Link</h4>
                <p className="text-lg font-bold opacity-40 group-hover:opacity-100 group-hover:text-black leading-loose max-w-sm mt-8">Used by world-class producers from Mumbai to London. Join the loop.</p>
                <div className="mt-12 h-2 w-20 bg-studio-neon group-hover:bg-black transition-all" />
            </div>
        </div>

    </div>
  );
}
